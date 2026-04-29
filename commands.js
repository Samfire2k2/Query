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

const ALL_COMMANDS = [TEST_COMMAND, SUMMARIZE_COMMAND];

InstallGlobalCommands(process.env.APP_ID, ALL_COMMANDS);
