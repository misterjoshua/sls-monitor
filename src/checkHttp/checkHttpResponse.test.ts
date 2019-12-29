/* eslint @typescript-eslint/no-explicit-any: 0 */

import {
  checkHttpStatusCode,
  defaultCheckHttpStatusCode,
  regexpCheck,
  checkSequentially,
  checkHttpSuccessAnd,
} from './checkHttpResponse';

it('should check for success status codes', async () => {
  const check = checkHttpStatusCode([200]);
  await expect(check({ statusCode: 200 } as any)).resolves.not.toThrow();
  await expect(check({ statusCode: 201 } as any)).rejects.toThrow();
  await expect(
    defaultCheckHttpStatusCode({ statusCode: 200 } as any)
  ).resolves.not.toThrow();
  await expect(
    defaultCheckHttpStatusCode({ statusCode: 201 } as any)
  ).rejects.toThrow();
});

it('should check for content matches', async () => {
  const check = regexpCheck(/MATCH/);
  await expect(check({ body: 'MATCH' } as any)).resolves.not.toThrow();
  await expect(check({ body: 'SOMETHINGELSE' } as any)).rejects.toThrow();
});

const requestMock = {} as any;
const successCheckMock = jest.fn(async () => {
  /* Do nothing */
});
const failCheckMock = jest.fn(async () => {
  throw new Error('Failure mock');
});

beforeEach(() => {
  jest.clearAllMocks();
});

it('should fail when provided a failing check in the sequence', async () => {
  await expect(
    checkSequentially(successCheckMock)(requestMock)
  ).resolves.not.toThrow();

  expect(successCheckMock).toHaveBeenCalled();

  await expect(checkSequentially(failCheckMock)(requestMock)).rejects.toThrow();

  expect(failCheckMock).toHaveBeenCalled();
});

it('should run checks sequentially and fail if any check in the sequence fails', async () => {
  jest.clearAllMocks();

  await expect(
    checkSequentially(successCheckMock, failCheckMock)(requestMock)
  ).rejects.toThrow();

  expect(successCheckMock).toHaveBeenCalled();
  expect(failCheckMock).toHaveBeenCalled();
});

it('should not run checks after the first sequential check fail', async () => {
  await expect(
    checkSequentially(failCheckMock, successCheckMock)(requestMock)
  ).rejects.toThrow();

  expect(failCheckMock).toHaveBeenCalled();
  expect(successCheckMock).not.toHaveBeenCalled();
});

it('it should check sucess and more checks', async () => {
  await expect(
    checkHttpSuccessAnd(successCheckMock)({ statusCode: 200 } as any)
  ).resolves.not.toThrow();
  expect(successCheckMock).toHaveBeenCalled();

  jest.clearAllMocks();
  await expect(
    checkHttpSuccessAnd(successCheckMock)({ statusCode: 404 } as any)
  ).rejects.toThrow();
  expect(successCheckMock).not.toHaveBeenCalled();

  jest.clearAllMocks();
  await expect(
    checkHttpSuccessAnd(failCheckMock)({ statusCode: 200 } as any)
  ).rejects.toThrow();
  expect(failCheckMock).toHaveBeenCalled();
});
