import 'dotenv/config';
import express from 'express';
import { verifyKeyMiddleware } from 'discord-interactions';
import { 
  summarizeMessages, 
  fetchChannelMessages,
  filterMessagesByUser,
  filterMessagesByPeriod,
  filterMessagesByKeyword,
  getChannelStats
} from './summaryHandler.js';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware for Discord signature verification
app.use(express.raw({ type: 'application/json' }));

// Health check
app.get('/', (req, res) => {
  res.send('🤖 Discord Message Summarizer is live!');
});

// Discord interactions endpoint
app.post('/interactions', verifyKeyMiddleware(process.env.PUBLIC_KEY), async (req, res) => {
  const body = req.body;

  // PING
  if (body.type === 1) {
    return res.json({ type: 1 });
  }

  // COMMAND
  if (body.type === 2) {
    const commandName = body.data.name;

    if (commandName === 'test') {
      return res.json({
        type: 4,
        data: {
          content: '✅ Bot is working!',
        },
      });
    }

    if (commandName === 'summarize') {
      try {
        // Defer the response (this can take a while)
        res.json({
          type: 5, // DEFERRED_CHANNEL_MESSAGE_WITH_SOURCE
        });

        const channelId = body.channel_id;
        
        // Send status message
        await sendFollowup('⏳ Fetching all messages from this channel...', body.token);

        // Fetch ALL messages from channel
        const messages = await fetchChannelMessages(channelId, process.env.DISCORD_TOKEN);

        if (messages.length === 0) {
          return await sendFollowup('No messages found in this channel.', body.token);
        }
        
        // Send processing status
        await sendFollowup(`✅ Found ${messages.length} messages. Generating summary...`, body.token);

        // Generate summary
        const summary = await summarizeMessages(messages);

        // Send summary
        await sendFollowup(
          `📋 **Summary** (${messages.length} messages analyzed)\n\n${summary}`,
          body.token
        );
      } catch (error) {
        console.error('Error handling summarize command:', error);
        await sendFollowup('❌ Error generating summary. Please try again.', body.token);
      }
    }

    if (commandName === 'summarize_user') {
      try {
        res.json({ type: 5 });

        const channelId = body.channel_id;
        const userId = body.data.options?.find((o) => o.name === 'user')?.value;

        await sendFollowup('⏳ Fetching all messages from this channel...', body.token);
        const messages = await fetchChannelMessages(channelId, process.env.DISCORD_TOKEN);
        const userMessages = filterMessagesByUser(messages, userId);

        if (userMessages.length === 0) {
          return await sendFollowup('No messages found from this user.', body.token);
        }

        await sendFollowup(`✅ Found ${userMessages.length} messages. Generating summary...`, body.token);
        const summary = await summarizeMessages(userMessages);

        await sendFollowup(
          `📋 **Summary for User** (${userMessages.length} messages)\n\n${summary}`,
          body.token
        );
      } catch (error) {
        console.error('Error handling summarize_user command:', error);
        await sendFollowup('❌ Error generating summary. Please try again.', body.token);
      }
    }

    if (commandName === 'summarize_period') {
      try {
        res.json({ type: 5 });

        const channelId = body.channel_id;
        const period = body.data.options?.find((o) => o.name === 'period')?.value;

        await sendFollowup(`⏳ Fetching all messages from this channel...`, body.token);
        const messages = await fetchChannelMessages(channelId, process.env.DISCORD_TOKEN);
        const periodMessages = filterMessagesByPeriod(messages, period);

        if (periodMessages.length === 0) {
          return await sendFollowup(`No messages found in the last ${period}.`, body.token);
        }

        await sendFollowup(`✅ Found ${periodMessages.length} messages. Generating summary...`, body.token);
        const summary = await summarizeMessages(periodMessages);

        await sendFollowup(
          `📋 **Summary (Last ${period})** (${periodMessages.length} messages)\n\n${summary}`,
          body.token
        );
      } catch (error) {
        console.error('Error handling summarize_period command:', error);
        await sendFollowup('❌ Error generating summary. Please try again.', body.token);
      }
    }

    if (commandName === 'search_summarize') {
      try {
        res.json({ type: 5 });

        const channelId = body.channel_id;
        const keyword = body.data.options?.find((o) => o.name === 'keyword')?.value;

        await sendFollowup(`⏳ Fetching all messages and searching for "${keyword}"...`, body.token);
        const messages = await fetchChannelMessages(channelId, process.env.DISCORD_TOKEN);
        const foundMessages = filterMessagesByKeyword(messages, keyword);

        if (foundMessages.length === 0) {
          return await sendFollowup(`No messages found containing "${keyword}".`, body.token);
        }

        await sendFollowup(`✅ Found ${foundMessages.length} messages. Generating summary...`, body.token);
        const summary = await summarizeMessages(foundMessages);

        await sendFollowup(
          `📋 **Summary (Search: "${keyword}")** (${foundMessages.length} messages)\n\n${summary}`,
          body.token
        );
      } catch (error) {
        console.error('Error handling search_summarize command:', error);
        await sendFollowup('❌ Error generating summary. Please try again.', body.token);
      }
    }

    if (commandName === 'stats') {
      try {
        res.json({ type: 5 });

        const channelId = body.channel_id;

        await sendFollowup('⏳ Fetching all messages from this channel...', body.token);
        const messages = await fetchChannelMessages(channelId, process.env.DISCORD_TOKEN);
        const stats = getChannelStats(messages);

        const statsMessage = `
📊 **Channel Statistics**

Total Messages: ${stats.totalMessages}
Unique Users: ${stats.uniqueUsers}
Average Messages/User: ${stats.averageMessagesPerUser}
Date Range: ${stats.dateRange}

**Top 5 Users:**
${stats.topUsers.map((user, i) => `${i + 1}. ${user}`).join('\n')}
        `.trim();

        await sendFollowup(statsMessage, body.token);
      } catch (error) {
        console.error('Error handling stats command:', error);
        await sendFollowup('❌ Error fetching statistics. Please try again.', body.token);
      }
    }
  }
});

// Send followup message to Discord (handles long content by splitting into chunks)
async function sendFollowup(content, token) {
  const MAX_CONTENT_LENGTH = 2000;
  const chunks = [];
  
  // Split content into Discord-compatible chunks
  if (content.length > MAX_CONTENT_LENGTH) {
    let currentChunk = '';
    const lines = content.split('\n');
    
    for (const line of lines) {
      if ((currentChunk + line + '\n').length > MAX_CONTENT_LENGTH) {
        if (currentChunk) chunks.push(currentChunk);
        currentChunk = line + '\n';
      } else {
        currentChunk += line + '\n';
      }
    }
    if (currentChunk) chunks.push(currentChunk);
  } else {
    chunks.push(content);
  }
  
  // Send each chunk
  for (const chunk of chunks) {
    try {
      const response = await fetch(`https://discord.com/api/v10/webhooks/${process.env.APP_ID}/${token}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: chunk,
        }),
      });

      if (!response.ok) {
        console.error(`Error sending followup: ${response.status}`);
      }
    } catch (error) {
      console.error('Error sending followup:', error);
    }
  }
}

app.listen(PORT, () => {
  console.log(`✅ Server listening on port ${PORT}`);
});
