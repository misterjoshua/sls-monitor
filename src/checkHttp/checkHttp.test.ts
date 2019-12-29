import { createOptions, checkHttp, checkHttpWithOptions } from './checkHttp';
import { doCheckHttp } from './doCheckHttp';
import { Options } from 'request';

jest.mock('./doCheckHttp', () => ({
  doCheckHttp: jest.fn(),
}));

const doCheckHttpMock = doCheckHttp as jest.Mock;

const testUrl = 'http://www.example.com/';

it('should provide reasonable option defaults', () => {
  const options = createOptions(testUrl);
  expect(options.url).toBe(testUrl);
  expect(options.timeout).toBeGreaterThan(0);
  expect(options.followRedirect).toBe(true);
  expect(options.followAllRedirects).toBe(false);
});

it('should allow option overrides from the reasonable defaults', () => {
  const options = createOptions(testUrl, {
    timeout: 1234,
    followRedirect: false,
    followAllRedirects: true,
    time: false,
  });

  expect(options.timeout).toBe(1234);
  expect(options.followRedirect).toBe(false);
  expect(options.followAllRedirects).toBe(true);
  expect(options.time).toBe(true); // Always timed.
});

it('should call checkHttp with a request', async () => {
  await checkHttp(testUrl, jest.fn());
  expect(doCheckHttpMock).toBeCalledWith(
    expect.objectContaining({ url: testUrl }),
    expect.any(Function),
    expect.any(Function)
  );
});

it('should pass the options through to doCheckHttp', async () => {
  const options: Options = {
    url: testUrl,
  };

  await checkHttpWithOptions(options, jest.fn());
  expect(doCheckHttpMock).toBeCalledWith(
    expect.objectContaining(options),
    expect.any(Function),
    expect.any(Function)
  );
});
