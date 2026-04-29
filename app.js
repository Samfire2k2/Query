import 'dotenv/config';
import express from 'express';
import { verifyKeyMiddleware } from 'discord-interactions';
import { summarizeMessages, fetchChannelMessages } from './summaryHandler.js';

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
