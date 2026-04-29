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

// Check required environment variables
const requiredEnvVars = ['DISCORD_TOKEN', 'PUBLIC_KEY', 'APP_ID', 'GROQ_API_KEY'];
const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingEnvVars.length > 0) {
  console.error(`❌ Missing environment variables: ${missingEnvVars.join(', ')}`);
  process.exit(1);
}

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
        
        // Small delay to ensure Discord has processed the defer
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Send status message
        await sendFollowup('⏳ Fetching last 300 messages from this channel...', body.token);

        // Fetch messages from channel (limited to last 300 for Groq free tier)
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
          `📋 **Summary** (${messages.length} last messages analyzed)\n\n${summary}`,
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

        await sendFollowup('⏳ Fetching last 300 messages from this channel...', body.token);
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

        await sendFollowup(`⏳ Fetching last 300 messages from this channel...`, body.token);
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

        await sendFollowup(`⏳ Fetching last 300 messages and searching for "${keyword}"...`, body.token);
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

        await sendFollowup('⏳ Fetching last 300 messages from this channel...', body.token);
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
  for (let i = 0; i < chunks.length; i++) {
    const chunk = chunks[i];
    try {
      const webhookUrl = `https://discord.com/api/v10/webhooks/${process.env.APP_ID}/${token}`;
      
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: chunk,
        }),
      });

      if (!response.ok) {
        if (response.status === 404) {
          console.error(`⚠️ Webhook expired (404). The interaction token may have timed out.`);
          return;
        }
        const errorText = await response.text();
        console.error(`Error sending followup ${i + 1}/${chunks.length}: ${response.status}`);
        console.error(`Response: ${errorText}`);
      } else {
        console.log(`✅ Sent message ${i + 1}/${chunks.length}`);
      }
      
      // Add delay between messages
      if (i < chunks.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    } catch (error) {
      console.error('Error sending followup:', error.message);
    }
  }
}

app.listen(PORT, () => {
  console.log(`✅ Server listening on port ${PORT}`);
});
