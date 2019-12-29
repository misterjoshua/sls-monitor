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
  console.log('Monitoring ', task);

  const checkResult = await checkHttp(
    task.url,
    checkHttpSuccessAnd(regexpCheck(new RegExp(task.checkExpression)))
  );

  const dimensions = createDimensions(task);
  console.log('dimensions = ', dimensions);

  const metricData: PutMetricDataInput = {
    Namespace: 'misterjoshua/monitor',
    MetricData: createMetricData(dimensions, checkResult),
  };
  console.log('metricData = ', metricData);

  const putResult = await CommonCloudWatch.putMetricData(metricData).promise();
  console.log('putResult = ', putResult);

  return checkResult;
};
