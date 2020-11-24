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

export function getIntegerInput(name: string, options?: InputOptions): number {
  const value = getInput(name, options);
  const int = parseInt(value, 10);
  if (_.isNaN(int)) {
    throw TypeError(`Could not parse ${value} as an integer`);
  }
  return int;
}

/**
 * Gets an input and interprets it as a list. Seperator is a newline if the value includes newlines, otherwise is a
 * comma.
 *
 * @param {string} name - @see getInput.
 * @param {InputOptions} options - @see getInput.
 * @returns {string[]} The value converted to a list of strings.
 */
export function getDelimitedArrayInput(name: string, options?: InputOptions): string[] {
  const value = getInput(name, options);
  const sep = _.includes(value, '\n') ? '\n' : ',';
  // eslint-disable-next-line @typescript-eslint/unbound-method
  return _.map(_.filter(_.split(value, sep)), _.trim);
}
