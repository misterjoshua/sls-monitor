import * as request from 'request';
import { OptionsWithUrl, CoreOptions } from 'request';
import * as util from 'util';
import { HttpResponseCheck } from './checkHttpResponse';
import { doCheckHttp } from './doCheckHttp';

export interface HttpCheckResult {
  body?: string;
  successfulTransport: boolean;
  transportTimings?: HttpCheckTimingPhases;
  successfulContentCheck: boolean;
  errorMessage?: string;
  error?: Error;
}

export interface HttpCheckTimingPhases {
  wait: number;
  dns: number;
  tcp: number;
  firstByte: number;
  download: number;
  total: number;
}

export type RequestSender = (
  request: request.OptionsWithUrl
) => Promise<request.Response>;

export const createOptions = (
  url: string,
  givenOptions: CoreOptions = {}
): OptionsWithUrl => {
  const defaultOptions = {
    url: url,
    timeout: 2000,
    followRedirect: true,
    followAllRedirects: false,
    time: true,
  };

  const enforcedOptions = {
    time: true,
  };

  const mergedOptions = {
    ...defaultOptions,
    ...givenOptions,
    ...enforcedOptions,
  };

  return mergedOptions;
};

export const requestGet = util.promisify(request.get);

export const checkHttp = async (
  url: string,
  checkResponse: HttpResponseCheck
): Promise<HttpCheckResult> =>
  await doCheckHttp(createOptions(url), requestGet, checkResponse);

export const checkHttpWithOptions = async (
  options: OptionsWithUrl,
  checkResponse: HttpResponseCheck
): Promise<HttpCheckResult> =>
  await doCheckHttp(options, requestGet, checkResponse);
