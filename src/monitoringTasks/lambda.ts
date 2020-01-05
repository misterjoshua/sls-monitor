import {
  APIGatewayProxyHandler,
  APIGatewayProxyResult,
  SNSHandler,
} from 'aws-lambda';
import { reconcileMonitoringTaskStacks } from './stack/reconcileMonitoringTaskStacks';
import { bindLogPrefixes } from '../bindLogPrefixes';
import { publishAllMonitoringTasks } from './publishAllMonitoringTasks';

bindLogPrefixes();

export const restApi: APIGatewayProxyHandler = async (): Promise<APIGatewayProxyResult> => {
  return {
    statusCode: 200,
    body: JSON.stringify(await publishAllMonitoringTasks()),
  };
};

export const scheduleWorker: SNSHandler = async () => {
  await publishAllMonitoringTasks();
};

export const reconcileRestApi: APIGatewayProxyHandler = async (): Promise<APIGatewayProxyResult> => {
  return {
    statusCode: 200,
    body: JSON.stringify(await reconcileMonitoringTaskStacks()),
  };
};

export const reconcileScheduleWorker: SNSHandler = async (): Promise<void> => {
  await reconcileMonitoringTaskStacks();
};
