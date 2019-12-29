import { HttpCheckResult, HttpCheckTimingPhases } from '../checkHttp/checkHttp';
import { Dimension, MetricDatum, MetricData } from 'aws-sdk/clients/cloudwatch';

export const createMetricData = (
  dimensions: Dimension[],
  checkResult: HttpCheckResult
): MetricData => {
  const createMetricDatum = (
    name: string,
    data: HttpCheckTimingPhases
  ): MetricDatum => ({
    MetricName: name,
    Unit: 'Milliseconds',
    Value: Math.round(data[name]),
    Dimensions: dimensions,
  });

  const successMetrics = [
    {
      MetricName: 'successfulTransport',
      Value: checkResult.successfulTransport ? 1 : 0,
      Dimensions: dimensions,
    },
    {
      MetricName: 'successfulContentCheck',
      Value: checkResult.successfulContentCheck ? 1 : 0,
      Dimensions: dimensions,
    },
  ];

  const transportTimingMetrics = !checkResult.transportTimings
    ? []
    : [
        createMetricDatum('wait', checkResult.transportTimings),
        createMetricDatum('dns', checkResult.transportTimings),
        createMetricDatum('tcp', checkResult.transportTimings),
        createMetricDatum('firstByte', checkResult.transportTimings),
        createMetricDatum('download', checkResult.transportTimings),
        createMetricDatum('total', checkResult.transportTimings),
      ];

  return [...successMetrics, ...transportTimingMetrics];
};
