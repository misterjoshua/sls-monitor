import { createOptions } from './checkHttp';
import { doCheckHttp } from './doCheckHttp';

const successUrl = 'https://www.example.com/';
const failTransportUrl = 'http://www.example.com:1234/';

const successfulGetFn = jest
  .fn()
  .mockReturnValue({ body: 'MOCK', timingPhases: {} });

const failGetFn = jest.fn(async () => {
  throw new Error('Transport error simulation');
});

it('should report success on successful transport and response checks', async () => {
  const checkResult = await doCheckHttp(
    createOptions(successUrl),
    successfulGetFn,
    jest.fn()
  );
  expect(checkResult.errorMessage).toBeFalsy();
  expect(checkResult.successfulTransport).toBe(true);
  expect(checkResult.successfulContentCheck).toBe(true);
  expect(checkResult.transportTimings).toBeTruthy();
});

it('should report failure when the content check fails', async () => {
  const responseFailMock = jest.fn().mockImplementation(() => {
    throw new Error('Mock');
  });
  const checkResult = await doCheckHttp(
    createOptions(successUrl),
    successfulGetFn,
    responseFailMock
  );
  expect(checkResult.errorMessage).toBeTruthy();
  expect(checkResult.successfulTransport).toBe(true);
  expect(checkResult.successfulContentCheck).toBe(false);
  expect(checkResult.transportTimings).toBeTruthy();
});

it('should report failure when it cant connect to http', async () => {
  const neverMock = jest.fn();
  const checkResult = await doCheckHttp(
    createOptions(failTransportUrl),
    failGetFn,
    neverMock
  );
  expect(neverMock).not.toHaveBeenCalled();
  expect(checkResult.errorMessage).toBeTruthy();
  expect(checkResult.successfulTransport).toBe(false);
  expect(checkResult.successfulContentCheck).toBe(false);
  expect(checkResult.transportTimings).not.toBeTruthy();
});
