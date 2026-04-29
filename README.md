# Discord Message Summarizer Bot

A Discord bot that reads messages from a channel and creates AI-powered summaries using Groq API (free tier).

## Features

✅ Summarize the last **1000 messages** from a channel (powered by groq/compound - 70K TPM!)
✅ **Professional, detailed summaries** with structure, topics, decisions, and action items
✅ Instant single-pass summarization (no chunking needed)
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
| `/summarize` | Summarize the last 1000 messages from the channel (instant!) |
| `/summarize_user` | Summarize messages from a specific user (up to 1000) |
| `/summarize_period` | Summarize messages from a time period (1h, 24h, 7d, 30d) - up to 1000 |
| `/search_summarize` | Search for keyword and summarize matching messages (up to 1000) |
| `/stats` | Show channel statistics (last 1000 messages) |
| `/test` | Check if bot is online |

## Model & Performance

### Current Model: `groq/compound`

**Specifications:**
- **Tokens per Minute (TPM)**: 70,000 (12x better than previous!)
- **Requests per Day**: 250 (perfect for a personal bot)
- **Max Tokens per Request**: ~150,000 (can handle 1000+ messages easily)

**What this means:**
- ✅ Analyze 1000 messages in **one request** (no chunking)
- ✅ Instant responses (single API call)
- ✅ Better quality summaries (larger, more capable model)
- ✅ Perfect for personal/small team Discord servers
- ⚠️ 250 requests/day limit (plenty for personal use)

**Previous Model**: llama-3.1-8b-instant (6K TPM) → Now upgraded to groq/compound (70K TPM)

## Limitations & Notes

⚠️ **Rate Limits**: 
- 250 API requests per day (each summary = 1 request)
- That's ~8 summaries per hour = More than enough for a personal bot!

📊 **Message Range**: 
- Analyzes the last **1000 messages** per request
- Messages older than 1000 won't be included
- Perfect for analyzing recent conversations

💡 **If you need more:**
- Switch to `llama-3.3-70b-versatile` (12K TPM, 1000 requests/day)
- Request Groq tier upgrade for even higher limits

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
