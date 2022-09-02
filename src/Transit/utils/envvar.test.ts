import test from 'ava';

import { extractStringEnvVar } from './envvar';

test('should get correct key', async (t) => {
  process.env.TEST = 'CORRECT';
  t.is(extractStringEnvVar('TEST'), 'CORRECT');
  process.env.TEST = 'TEST';
  t.is(extractStringEnvVar('TEST'), 'TEST');
});

test('should throw error when key not found', async (t) => {
  process.env.TEST = 'CORRECT';
  t.throws(() => {
    extractStringEnvVar('WRONG');
  });
});
