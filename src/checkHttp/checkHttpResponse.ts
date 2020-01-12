import * as request from 'request';

export type HttpResponseCheck = (response: request.Response) => Promise<void>;

export const checkHttpStatusCode = (
  successCodes: number[],
): HttpResponseCheck => async (response: request.Response): Promise<void> => {
  if (!successCodes.includes(response.statusCode))
    throw new Error(
      `Response status code ${
        response.statusCode
      } is not successful. Expected one of: ${successCodes.join(', ')}`,
    );
};

export const defaultCheckHttpStatusCode = checkHttpStatusCode([200]);

export const regexpCheck = (
  checkExpression: RegExp,
): HttpResponseCheck => async (response: request.Response): Promise<void> => {
  if (!checkExpression.test(response.body))
    throw new Error(`Response body did not match the check expression`);
};

export const checkSequentially = (
  ...sequence: HttpResponseCheck[]
): HttpResponseCheck => async (response: request.Response): Promise<void> => {
  for (const key in sequence) {
    await sequence[key](response);
  }
};

export const checkHttpSuccessAnd = (
  ...moreChecks: HttpResponseCheck[]
): HttpResponseCheck =>
  checkSequentially(...[defaultCheckHttpStatusCode].concat(moreChecks));
