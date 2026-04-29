# Discord Message Summarizer Bot

A Discord bot that reads messages from a channel and creates AI-powered summaries using Groq API (free tier).

## Features

✅ Summarize the last **600 messages** from a channel (auto-divided into chunks for quality)
✅ **Professional summaries** with clear structure and key points
✅ Hierarchical summarization (chunks → summaries → final summary)
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
| `/summarize` | Summarize the last 600 messages from the channel (auto-chunked) |
| `/summarize_user` | Summarize messages from a specific user (up to 600) |
| `/summarize_period` | Summarize messages from a time period (1h, 24h, 7d, 30d) - up to 600 |
| `/search_summarize` | Search for keyword and summarize matching messages (up to 600) |
| `/stats` | Show channel statistics (last 600 messages) |
| `/test` | Check if bot is online |

## Limitations & Optimization

⚠️ **Message Range**: The bot analyzes the last **600 messages** per request

**Why 600?**
- Free tier Groq limit: 6000 tokens/minute
- 600 messages are automatically split into chunks (100 messages each)
- Each chunk is summarized separately, then combined
- This **reduces token usage** and improves **summary quality**

**Technical Details:**
- Messages 1-100 → Summary A
- Messages 101-200 → Summary B  
- Messages 201-300 → Summary C
- Summary A + B + C → Final comprehensive summary

**Upgrading?**
- Groq Dev Tier: Remove the hierarchical limitation (analyze 1000+ messages at once)
- Change `MAX_MESSAGES` in `summaryHandler.js` if you upgrade

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
