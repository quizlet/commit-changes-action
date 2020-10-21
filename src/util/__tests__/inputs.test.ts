import {getInput} from '@actions/core';
import {mocked} from 'ts-jest/utils';
import _ from 'lodash';
import {getBooleanInput, getDelimitedArrayInput} from '../inputs';

jest.mock('@actions/core');
const mockGetInput = mocked(getInput, true);

describe('getBooleanInput', () => {
  it.each([`true`, `t`, `yes`, `y`, `on`, `1`])('returns true for %p', (v: string) => {
    const key = 'input';
    mockGetInput.mockReturnValueOnce(v);
    expect(getBooleanInput(key)).toBe(true);
    expect(mockGetInput).toHaveBeenCalledWith(key, undefined);
  });

  it('is case insensitive', () => {
    const key = 'input';
    mockGetInput.mockReturnValueOnce('Yes');
    expect(getBooleanInput(key)).toBe(true);
    expect(mockGetInput).toHaveBeenCalledWith(key, undefined);
  });

  it('returns false for non-matching inputs', () => {
    const key = 'input';
    mockGetInput.mockReturnValueOnce('false');
    expect(getBooleanInput(key)).toBe(false);
    expect(mockGetInput).toHaveBeenCalledWith(key, undefined);
  });
});

describe('getDelimitedArrayInput', () => {
  it.each([',', ', '])('parses a comman separated list delimted by %p', delim => {
    const key = 'input';
    const value = ['foo', 'bar', 'baz'];
    mockGetInput.mockReturnValueOnce(_.join(value, delim));
    expect(getDelimitedArrayInput(key)).toStrictEqual(value);
    expect(mockGetInput).toHaveBeenCalledWith(key, undefined);
  });

  it('parses a newline seperated list', () => {
    const key = 'input';
    const value = ['foo', 'bar', 'baz', 'value,with,commas'];
    mockGetInput.mockReturnValueOnce(_.join(value, '\n'));
    expect(getDelimitedArrayInput(key)).toStrictEqual(value);
    expect(mockGetInput).toHaveBeenCalledWith(key, undefined);
  });
});
