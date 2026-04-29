# Discord Message Summarizer Bot

A Discord bot that reads messages from a channel and creates AI-powered summaries using **Mistral via Hugging Face Inference API** (100% free tier, no credit card).

## Features

✅ Summarize the last **100 messages** from a channel (using Mistral 7B Instruct)
✅ **Professional, detailed summaries** with structure, topics, decisions, and action items
✅ Instant single-pass summarization (no chunking needed)
✅ Filter by user or time period
✅ Search for keywords and summarize
✅ Get channel statistics
✅ 100% free (uses Hugging Face Inference API - no credit card needed)
✅ Respects Discord rate limits

## Setup

### 1. Create a Discord Application
- Go to https://discord.com/developers/applications
- Click "New Application"
- Go to **Bot** → Click **"Add Bot"**
- Copy the **TOKEN** and save it
- Go to **General Information** and copy **APP_ID** and **PUBLIC_KEY**

### 2. Get Hugging Face API Key (Free)
- Go to https://huggingface.co/ and sign up (free, no credit card needed)
- Go to Settings → Access Tokens
- Create a new token (read access is enough)
- Copy the token

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
HUGGINGFACE_API_KEY=your_huggingface_token_here
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

### Current Model: `Mistral 7B Instruct` (via Hugging Face Inference API)

**Specifications:**
- **Free Tier**: Unlimited (monthly rate limits)
- **Quality**: Excellent for summarization
- **Speed**: Fast inference
- **No credit card**: 100% free for personal use 

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
- The model is still available. If you get a rate limit error, wait a few minutes and try again
- Or visit https://huggingface.co/ to check your API key status

### "Request too large"
- You're trying to summarize too many messages
- Bot is limited to 100 messages on free plan
- Or increase `MAX_MESSAGES` in summaryHandler.js

## Notes

- The bot respects Discord rate limits (500ms delay between API calls)
- Summaries are generated on-demand (no caching)
- Free Hugging Face Inference API tier is sufficient for most use cases
- ✅ Mistral is an excellent open-source model for summarization
