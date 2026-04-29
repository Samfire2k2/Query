import { Groq } from 'groq-sdk';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export async function summarizeMessages(messages) {
  if (!messages || messages.length === 0) {
    return 'No messages to summarize.';
  }

  // Format messages for summarization
  const messageText = messages
    .map((msg) => `${msg.author}: ${msg.content}`)
    .join('\n');

  try {
    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: 'user',
          content: `You are a professional technical writer and Discord community analyst. Please provide a well-structured and comprehensive summary of the following Discord conversation. Focus on:

1. **Main Discussion Topics** - What were the primary topics discussed?
2. **Key Decisions** - Any conclusions or decisions made?
3. **Action Items** - Any follow-ups or next steps?
4. **Important Disagreements** - Any conflicts or differing opinions?
5. **Overall Sentiment** - What was the tone (constructive, heated, supportive, etc)?
6. **Key Contributors** - Who were the main participants and what did they contribute?

Format your summary with clear markdown sections, bullet points, and emphasis on important details. Make it professional yet conversational.

Discord Conversation (${messages.length} messages):
${messageText}`,
        },
      ],
      model: 'groq/compound',
      max_tokens: 2048,
      temperature: 0.7,
    });

    return chatCompletion.choices[0]?.message?.content || 'Could not generate summary.';
  } catch (error) {
    console.error('Error generating summary with Groq:', error);
    return 'Error generating summary. Please try again later.';
  }
}

export async function fetchChannelMessages(channelId, token) {
  const allMessages = [];
  let lastMessageId = null;
  let pageCount = 0;
  const MAX_MESSAGES = 300; // Reduced to prevent "Request Entity Too Large" errors

  try {
    while (true) {
      let endpoint = `https://discord.com/api/v10/channels/${channelId}/messages?limit=100`;
      
      if (lastMessageId) {
        endpoint += `&before=${lastMessageId}`;
      }

      const res = await fetch(endpoint, {
        headers: {
          Authorization: `Bot ${token}`,
        },
      });

      if (!res.ok) {
        const errorText = await res.text();
        console.error(`❌ Error fetching messages: ${res.status}`);
        console.error(`Error details: ${errorText}`);
        console.error(`Channel ID: ${channelId}`);
        break;
      }

      const data = await res.json();
      
      if (data.length === 0) {
        console.log(`✅ Fetched ${pageCount} pages of messages (${allMessages.length} total)`);
        break;
      }

      // Format and add messages
      const formatted = data
        .map((msg) => ({
          author: msg.author.username,
          authorId: msg.author.id,
          content: msg.content.slice(0, 300), // Limit each message to 300 chars to prevent size issues
          timestamp: msg.timestamp,
        }))
        .filter((msg) => msg.content.length > 0);
      
      allMessages.push(...formatted);
      lastMessageId = data[data.length - 1].id;
      pageCount++;
      
      // Stop if we've reached the limit
      if (allMessages.length >= MAX_MESSAGES) {
        console.log(`✅ Reached message limit of ${MAX_MESSAGES}`);
        break;
      }
      
      // Add delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    // Return only the last MAX_MESSAGES and reverse to get chronological order
    const messages = allMessages.slice(-MAX_MESSAGES).reverse();
    console.log(`📊 Returning ${messages.length} messages for processing (truncated to 300 chars each)`);
    return messages;
  } catch (error) {
    console.error('Error fetching messages:', error);
    return [];
  }
}

// Filter messages by user
export function filterMessagesByUser(messages, userId) {
  return messages.filter((msg) => msg.authorId === userId);
}

// Filter messages by time period
export function filterMessagesByPeriod(messages, period) {
  const now = new Date();
  let startTime;

  switch (period) {
    case '1h':
      startTime = new Date(now.getTime() - 1 * 60 * 60 * 1000);
      break;
    case '24h':
      startTime = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      break;
    case '7d':
      startTime = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      break;
    case '30d':
      startTime = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      break;
    default:
      return messages;
  }

  return messages.filter((msg) => new Date(msg.timestamp) >= startTime);
}

// Filter messages by keyword
export function filterMessagesByKeyword(messages, keyword) {
  const lowerKeyword = keyword.toLowerCase();
  return messages.filter((msg) => msg.content.toLowerCase().includes(lowerKeyword));
}

// Get channel statistics
export function getChannelStats(messages) {
  if (messages.length === 0) {
    return {
      totalMessages: 0,
      uniqueUsers: 0,
      topUsers: [],
      averageMessagesPerUser: 0,
      dateRange: 'N/A',
    };
  }

  const userCounts = {};
  messages.forEach((msg) => {
    userCounts[msg.author] = (userCounts[msg.author] || 0) + 1;
  });

  const topUsers = Object.entries(userCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([name, count]) => `${name} (${count})`);

  const dates = messages.map((msg) => new Date(msg.timestamp));
  const oldestDate = new Date(Math.min(...dates.map((d) => d.getTime())));
  const newestDate = new Date(Math.max(...dates.map((d) => d.getTime())));

  return {
    totalMessages: messages.length,
    uniqueUsers: Object.keys(userCounts).length,
    topUsers,
    averageMessagesPerUser: (messages.length / Object.keys(userCounts).length).toFixed(1),
    dateRange: `${oldestDate.toLocaleDateString()} - ${newestDate.toLocaleDateString()}`,
  };
}
