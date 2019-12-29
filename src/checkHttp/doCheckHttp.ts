import request from 'request';
import { HttpResponseCheck } from './checkHttpResponse';
import { RequestSender, HttpCheckResult } from './checkHttp';

export const doCheckHttp = async (
  options: request.OptionsWithUrl,
  sendRequest: RequestSender,
  checkResponse: HttpResponseCheck
): Promise<HttpCheckResult> => {
  try {
    const response = await sendRequest(options);
    // Transport succeeded. Check for an application error.
    try {
      await checkResponse(response);
      return {
        body: response.body,
        successfulTransport: true,
        transportTimings: response.timingPhases,
        successfulContentCheck: true,
      };
    } catch (e) {
      return {
        body: response.body,
        successfulTransport: true,
        transportTimings: response.timingPhases,
        successfulContentCheck: false,
        errorMessage: e.message,
        error: e,
      };
    }
  } catch (e) {
    return {
      successfulTransport: false,
      successfulContentCheck: false,
      errorMessage: e.message,
      error: e,
    };
  }
};
