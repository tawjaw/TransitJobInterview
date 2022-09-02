import test from 'ava';

import { isString } from '.';

test('should return true when a string is passed', async (t) => {
  t.is(isString('this is a string'), true);
});

test('should return false when undefined is passed', async (t) => {
  t.is(isString(undefined), false);
});

test('should return false when number is passed', async (t) => {
  t.is(isString(5), false);
});
