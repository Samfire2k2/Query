import 'dotenv/config';
import { InstallGlobalCommands } from './utils.js';

// Summarize command
const SUMMARIZE_COMMAND = {
  name: 'summarize',
  description: 'Summarize ALL messages from this channel using AI',
  type: 1,
  integration_types: [0, 1],
  contexts: [0, 2],
};

// Test command
const TEST_COMMAND = {
  name: 'test',
  description: 'Test command',
  type: 1,
  integration_types: [0, 1],
  contexts: [0, 1, 2],
};

// Summarize by user command
const SUMMARIZE_USER_COMMAND = {
  name: 'summarize_user',
  description: 'Summarize messages from a specific user',
  options: [
    {
      type: 9, // USER
      name: 'user',
      description: 'The user to summarize messages from',
      required: true,
    },
  ],
  type: 1,
  integration_types: [0, 1],
  contexts: [0, 2],
};

// Summarize by period command
const SUMMARIZE_PERIOD_COMMAND = {
  name: 'summarize_period',
  description: 'Summarize messages from last X hours/days',
  options: [
    {
      type: 3, // STRING
      name: 'period',
      description: 'Time period (1h, 24h, 7d, 30d)',
      required: true,
      choices: [
        { name: 'Last 1 hour', value: '1h' },
        { name: 'Last 24 hours', value: '24h' },
        { name: 'Last 7 days', value: '7d' },
        { name: 'Last 30 days', value: '30d' },
      ],
    },
  ],
  type: 1,
  integration_types: [0, 1],
  contexts: [0, 2],
};

// Search and summarize command
const SEARCH_SUMMARIZE_COMMAND = {
  name: 'search_summarize',
  description: 'Search for messages containing a keyword and summarize them',
  options: [
    {
      type: 3, // STRING
      name: 'keyword',
      description: 'Keyword to search for',
      required: true,
    },
  ],
  type: 1,
  integration_types: [0, 1],
  contexts: [0, 2],
};

// Statistics command
const STATS_COMMAND = {
  name: 'stats',
  description: 'Get channel statistics (message count, active users, etc)',
  type: 1,
  integration_types: [0, 1],
  contexts: [0, 2],
};

const ALL_COMMANDS = [TEST_COMMAND, SUMMARIZE_COMMAND, SUMMARIZE_USER_COMMAND, SUMMARIZE_PERIOD_COMMAND, SEARCH_SUMMARIZE_COMMAND, STATS_COMMAND];

InstallGlobalCommands(process.env.APP_ID, ALL_COMMANDS);
