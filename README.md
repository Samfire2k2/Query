# Discord Message Summarizer Bot

A Discord bot that reads all messages from a channel and creates AI-powered summaries using Groq API.

## Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Create a Discord Application:**
   - Go to https://discord.com/developers/applications
   - Create a new application
   - Go to "Bot" → "Add Bot"
   - Copy the TOKEN
   - Go to "General Information" → Copy APP_ID and PUBLIC_KEY

3. **Get Groq API Key:**
   - Go to https://console.groq.com/keys
   - Create a new API key (free tier available)

4. **Configure .env:**
   ```
   APP_ID=your_app_id
   DISCORD_TOKEN=your_bot_token
   PUBLIC_KEY=your_public_key
   GROQ_API_KEY=your_groq_api_key
   ```

5. **Register commands:**
   ```bash
   npm run register
   ```

6. **Start the bot:**
   ```bash
   npm start
   ```

## Commands

- `/summarize [limit]` - Summarize messages from the channel (1-100 messages)
- `/test` - Test if the bot is working

## Features

- ✅ Summarizes channel messages using Groq AI (free)
- ✅ Works in servers and DMs
- ✅ Configurable message limit
- ✅ Similar structure to Daft Punk bot
