import {getInput, InputOptions} from '@actions/core';
import _ from 'lodash';

/**
 * Gets an input and interprets it as a boolean value. Will treat any value matching true, t, yes, y, on, or 1 (case
 * insensitive) as true, anything that doesn't match is false.
 *
 * @param {string} name - @see getInput.
 * @param {InputOptions} options - @see getInput.
 * @returns {string[]} The value converted to a list of strings.
 */
export function getBooleanInput(name: string, options?: InputOptions): boolean {
  const value = getInput(name, options).toLowerCase();
  return _.includes(['true', 't', 'yes', 'y', 'on', '1'], value);
}
