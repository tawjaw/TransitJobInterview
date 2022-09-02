import dotenv from 'dotenv';

dotenv.config();

export function extractStringEnvVar(key: keyof NodeJS.ProcessEnv): string {
  const value = process.env[key];

  if (value === undefined) {
    const message = `The environment variable "${key}" cannot be "undefined".`;

    throw new Error(message);
  }

  return value;
}

export const MTA_API_KEY = extractStringEnvVar('MTA_API_KEY');
