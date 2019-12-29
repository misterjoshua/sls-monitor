import { CommonCloudWatch } from '../aws';
import { HttpCheckResult, checkHttp } from '../checkHttp/checkHttp';
import {
  checkHttpSuccessAnd,
  regexpCheck,
} from '../checkHttp/checkHttpResponse';
import { PutMetricDataInput } from 'aws-sdk/clients/cloudwatch';
import { MonitoringTask } from '.';
import { createDimensions, createMetricData } from '../cloudwatch';

export const runMonitoringTask = async (
  task: MonitoringTask
): Promise<HttpCheckResult> => {
  console.debug('Monitoring ', task);

  // Check the task url
  const checkResult = await checkHttp(
    task.url,
    checkHttpSuccessAnd(regexpCheck(new RegExp(task.checkExpression)))
  );

  // Log the error.
  if (checkResult.errorMessage) {
    console.error(
      "Check result indicates there's an error: ",
      checkResult.errorMessage,
      task,
      checkResult,
    );
  }

  // Send the metrics to cloudwatch.
  const dimensions = createDimensions(task);
  const metricData: PutMetricDataInput = {
    Namespace: 'misterjoshua/monitor',
    MetricData: createMetricData(dimensions, checkResult),
  };

  await CommonCloudWatch.putMetricData(metricData).promise();

  return checkResult;
};
