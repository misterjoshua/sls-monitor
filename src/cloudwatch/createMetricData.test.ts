import { Dimension } from 'aws-sdk/clients/cloudwatch';
import {
  HttpCheckResult,
  HttpCheckTimingPhaseName,
} from '../checkHttp/checkHttp';
import { createMetricData } from './createMetricData';

const transportTimings = {
  wait: 15,
  dns: 50,
  tcp: 30,
  firstByte: 20,
  download: 70,
  total: 185,
};

const goodTestResult: HttpCheckResult = {
  successfulContentCheck: true,
  successfulTransport: true,
  transportTimings,
};
const failedContentResult: HttpCheckResult = {
  successfulContentCheck: false,
  successfulTransport: true,
  transportTimings,
};
const failedTransportResult: HttpCheckResult = {
  successfulContentCheck: false,
  successfulTransport: false,
};

const testDimensions: Dimension[] = [];

it('should create metric data for all http check results', () => {
  const successChecks = (check: {
    successfulTransport: number;
    successfulContentCheck: number;
  }): any => // eslint-disable-line @typescript-eslint/no-explicit-any
    expect.arrayContaining([
      expect.objectContaining({
        MetricName: 'successfulTransport',
        Value: check.successfulTransport,
      }),
      expect.objectContaining({
        MetricName: 'successfulContentCheck',
        Value: check.successfulContentCheck,
      }),
    ]);

  expect(createMetricData(testDimensions, goodTestResult)).toEqual(
    successChecks({
      successfulTransport: 1,
      successfulContentCheck: 1,
    }),
  );

  expect(createMetricData(testDimensions, failedContentResult)).toEqual(
    successChecks({
      successfulTransport: 1,
      successfulContentCheck: 0,
    }),
  );

  expect(createMetricData(testDimensions, failedTransportResult)).toEqual(
    successChecks({
      successfulTransport: 0,
      successfulContentCheck: 0,
    }),
  );
});

it('should create metric data for all http timings', () => {
  expect(createMetricData(testDimensions, goodTestResult)).toEqual(
    expect.arrayContaining(
      ([
        'wait',
        'dns',
        'tcp',
        'firstByte',
        'download',
        'total',
      ] as HttpCheckTimingPhaseName[]).map(timing =>
        expect.objectContaining({
          MetricName: timing,
          Value: transportTimings[timing],
        }),
      ),
    ),
  );
});
