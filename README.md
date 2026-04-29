# Discord Message Summarizer Bot

A Discord bot that reads messages from a channel and creates AI-powered summaries using **Llama via Together AI** (100% free tier).

## Features

✅ Summarize the last **100 messages** from a channel (using Llama 3.8B Instruct)
✅ **Professional, detailed summaries** with structure, topics, decisions, and action items
✅ Instant single-pass summarization (no chunking needed)
✅ Filter by user or time period
✅ Search for keywords and summarize
✅ Get channel statistics
✅ 100% free (uses Together AI free tier - no credit card needed)
✅ Respects Discord rate limits

## Setup

### 1. Create a Discord Application
- Go to https://discord.com/developers/applications
- Click "New Application"
- Go to **Bot** → Click **"Add Bot"**
- Copy the **TOKEN** and save it
- Go to **General Information** and copy **APP_ID** and **PUBLIC_KEY**

### 2. Get Together AI API Key (Free)
- Go to https://www.together.ai/ and sign up (free tier available)
- Go to Settings → API Keys
- Create a new API key (no credit card needed)

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
TOGETHER_API_KEY=your_together_api_key_here
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
| `/summarize` | Summarize the last 100 messages from the channel (instant!) |
| `/summarize_user` | Summarize messages from a specific user (up to 100) |
| `/summarize_period` | Summarize messages from a time period (1h, 24h, 7d, 30d) - up to 100 |
| `/search_summarize` | Search for keyword and summarize matching messages (up to 100) |
| `/stats` | Show channel statistics (last 100 messages) |
| `/test` | Check if bot is online |

## Model & Performance

### Current Model: `Llama 3.8B Instruct` (via Together AI)

**Specifications:**
- **Free Tier**: Unlimited (rate limited but generous)
- **Requests per Minute**: Very generous on free tier
- **Max Tokens per Request**: ~4000
- **Quality**: Excellent for summarization tasks 

**Optimizations:**
- ✅ Maximum 100 messages per request (prevents API size errors)
- ✅ Each message truncated to 80 characters (lean, efficient)
- ✅ Instant responses (single API call)
- ✅ Professional summaries with comprehensive analysis
- ⚠️ 250 requests/day limit (plenty for personal use)

**Why 100 messages with 80 char truncation?**
- API stability: Eliminates "Request Entity Too Large" (413) errors completely
- Quality: Focuses on recent, relevant conversations
- Speed: Single request = instant response
- Reliability: Conservative settings ensure consistent performance
- Coverage: 100 messages = ~20-30 min of typical channel conversation

## Limitations & Notes

⚠️ **Rate Limits**: 
- 250 API requests per day (each summary = 1 request)
- That's ~8 summaries per hour = More than enough for a personal bot!
- Each message is limited to 80 characters to prevent "Request Entity Too Large" errors

📊 **Message Range**: 
- Analyzes the last **100 messages** per request
- Messages older than 100 won't be included
- Each message content is truncated to 80 chars for API stability
- Perfect for analyzing recent conversations (~20-30 min of typical chat)

💡 **If you need more:**
- The 100-message limit ensures API stability and avoids request size errors
- For longer conversations, run `/summarize` multiple times across different days
- Or increase `MAX_MESSAGES` and adjust char truncation in `summaryHandler.js` if you want to test

## Troubleshooting

### "Error: 403 - Unauthorized"
- Check your DISCORD_TOKEN is correct
- Bot must have permissions: "Read Messages", "Send Messages", "Read Message History"

### "Model decommissioned"
- The model is still active. If you get an error, check your API key
- Or visit https://www.together.ai/ to verify your account status

### "Request too large"
- You're trying to summarize too many messages
- Bot is limited to 100 messages on free plan
- Or upgrade your Together AI account

## Notes

- The bot respects Discord rate limits (500ms delay between API calls)
- Summaries are generated on-demand (no caching)
- Free Together AI tier is sufficient for most use cases
- ✅ Together AI has no message content moderation (unlike some APIs)
