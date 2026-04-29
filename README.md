# Discord Message Summarizer Bot

A Discord bot that reads messages from a channel and creates AI-powered summaries using Groq API (free tier).

## Features

✅ Summarize the last 300 messages from a channel
✅ Filter by user or time period
✅ Search for keywords and summarize
✅ Get channel statistics
✅ 100% free (uses Groq free tier)
✅ Respects Discord rate limits

## Setup

### 1. Create a Discord Application
- Go to https://discord.com/developers/applications
- Click "New Application"
- Go to **Bot** → Click **"Add Bot"**
- Copy the **TOKEN** and save it
- Go to **General Information** and copy **APP_ID** and **PUBLIC_KEY**

### 2. Get Groq API Key (Free)
- Go to https://console.groq.com/keys
- Create a new API key (free tier available, no credit card needed)

### 3. Install & Configure
```bash
# Clone or download this repo
cd query_bot

# Install dependencies
npm install

# Create .env file with your credentials
```

Create `.env` file:
```
APP_ID=your_app_id_here
DISCORD_TOKEN=your_bot_token_here
PUBLIC_KEY=your_public_key_here
GROQ_API_KEY=your_groq_api_key_here
PORT=3000
```

### 4. Register Commands
```bash
npm run register
```

### 5. Start the Bot
```bash
npm start
```

### 6. Deploy to Render (Recommended)
- Push code to GitHub
- Go to https://render.com
- Create new **Web Service**
- Connect your GitHub repo
- Add environment variables
- Deploy!

## Commands

| Command | Description |
|---------|-------------|
| `/summarize` | Summarize the last 300 messages from the channel |
| `/summarize_user` | Summarize messages from a specific user |
| `/summarize_period` | Summarize messages from a time period (1h, 24h, 7d, 30d) |
| `/search_summarize` | Search for keyword and summarize matching messages |
| `/stats` | Show channel statistics (message count, top users, etc) |
| `/test` | Check if bot is online |

## Limitations

⚠️ **Message Limit**: The bot summarizes the last **300 messages** to stay within Groq's free tier token limits (6000 tokens/minute)

- Free tier model: `llama-3.1-8b-instant`
- Max tokens per minute: 6000
- Typical usage: ~300 recent messages = ~20k tokens (need to chunk)

**Want to summarize more?** 
- Upgrade Groq to Dev Tier at https://console.groq.com/settings/billing
- Or increase `MAX_MESSAGES` in `summaryHandler.js`

## Troubleshooting

### "Error: 403 - Unauthorized"
- Check your DISCORD_TOKEN is correct
- Bot must have permissions: "Read Messages", "Send Messages", "Read Message History"

### "Model decommissioned"
- The Groq model has been retired. Current model: `llama-3.1-8b-instant`
- Update the bot or edit the model in `summaryHandler.js`

### "Request too large"
- You're trying to summarize too many messages
- Bot is limited to 300 messages on free plan
- Reduce the number or upgrade Groq

## Notes

- The bot respects Discord rate limits (500ms delay between API calls)
- Summaries are generated on-demand (no caching)
- Free Groq tier is sufficient for most use cases
- ✅ Similar structure to Daft Punk bot
