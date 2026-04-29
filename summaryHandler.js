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
          content: `Please summarize the following Discord messages in a concise and helpful way. Focus on the main topics and key points:\n\n${messageText}`,
        },
      ],
      model: 'mixtral-8x7b-32768',
      max_tokens: 1024,
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
        console.error(`❌ Error fetching messages: ${res.status}`);
        break;
      }

      const data = await res.json();
      
      if (data.length === 0) {
        console.log(`✅ Fetched ${pageCount} pages of messages`);
        break;
      }

      // Format and add messages
      const formatted = data
        .map((msg) => ({
          author: msg.author.username,
          content: msg.content,
          timestamp: msg.timestamp,
        }))
        .filter((msg) => msg.content.length > 0);
      
      allMessages.push(...formatted);
      lastMessageId = data[data.length - 1].id;
      pageCount++;
      
      // Add delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    // Reverse to get chronological order
    return allMessages.reverse();
  } catch (error) {
    console.error('Error fetching messages:', error);
    return [];
  }
}
