import { Groq } from 'groq-sdk';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export async function summarizeMessages(messages) {
  if (!messages || messages.length === 0) {
    return 'No messages to summarize.';
  }

  // For large message sets, use hierarchical summarization to save tokens
  if (messages.length > 150) {
    console.log(`📊 Using hierarchical summarization for ${messages.length} messages`);
    return await hierarchicalSummarize(messages);
  }

  // For smaller sets, direct summarization
  return await directSummarize(messages);
}

async function directSummarize(messages) {
  // Format messages for summarization
  const messageText = messages
    .map((msg) => `${msg.author}: ${msg.content}`)
    .join('\n');

  try {
    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: 'user',
          content: `You are a professional technical writer. Please provide a well-structured and comprehensive summary of the following Discord conversation. Focus on:

1. Main discussion topics and themes
2. Key decisions or conclusions
3. Action items or follow-ups (if any)
4. Important disagreements or conflicts (if any)
5. Overall sentiment and tone

Format the summary with clear sections and bullet points where appropriate. Make it concise yet informative.

Discord Messages:
${messageText}`,
        },
      ],
      model: 'llama-3.1-8b-instant',
      max_tokens: 1024,
      temperature: 0.7,
    });

    return chatCompletion.choices[0]?.message?.content || 'Could not generate summary.';
  } catch (error) {
    console.error('Error generating summary with Groq:', error);
    return 'Error generating summary. Please try again later.';
  }
}

async function hierarchicalSummarize(messages) {
  const chunkSize = 100;
  const chunks = [];

  // Divide messages into chunks
  for (let i = 0; i < messages.length; i += chunkSize) {
    chunks.push(messages.slice(i, i + chunkSize));
  }

  console.log(`📚 Summarizing ${chunks.length} chunks...`);

  // Summarize each chunk
  const chunkSummaries = [];
  for (let i = 0; i < chunks.length; i++) {
    const chunkText = chunks[i]
      .map((msg) => `${msg.author}: ${msg.content}`)
      .join('\n');

    try {
      const chatCompletion = await groq.chat.completions.create({
        messages: [
          {
            role: 'user',
            content: `Summarize the following Discord conversation concisely. Focus on main topics, decisions, and action items:

${chunkText}`,
          },
        ],
        model: 'llama-3.1-8b-instant',
        max_tokens: 300,
        temperature: 0.7,
      });

      const summary = chatCompletion.choices[0]?.message?.content || '';
      chunkSummaries.push(summary);
      console.log(`✅ Chunk ${i + 1}/${chunks.length} summarized`);

      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 200));
    } catch (error) {
      console.error(`Error summarizing chunk ${i + 1}:`, error);
      chunkSummaries.push('Error summarizing this section.');
    }
  }

  // Combine chunk summaries and create final summary
  const combinedSummaries = chunkSummaries.join('\n\n---\n\n');

  try {
    const finalSummary = await groq.chat.completions.create({
      messages: [
        {
          role: 'user',
          content: `You are a professional summarizer. Please synthesize the following summaries into one cohesive, well-structured final summary. Remove redundancies and emphasize the most important information. Format with clear sections and bullet points.

Section Summaries:
${combinedSummaries}`,
        },
      ],
      model: 'llama-3.1-8b-instant',
      max_tokens: 1024,
      temperature: 0.7,
    });

    return finalSummary.choices[0]?.message?.content || 'Could not generate final summary.';
  } catch (error) {
    console.error('Error generating final summary:', error);
    return `Chunk Summaries:\n\n${combinedSummaries}`;
  }
}

export async function fetchChannelMessages(channelId, token) {
  const allMessages = [];
  let lastMessageId = null;
  let pageCount = 0;
  const MAX_MESSAGES = 600; // Increased from 300 - hierarchical summarization handles this efficiently

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
          content: msg.content,
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
    console.log(`📊 Returning ${messages.length} messages for processing`);
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
