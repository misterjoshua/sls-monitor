import {
  APIGatewayProxyHandler,
  APIGatewayProxyResult,
  SNSHandler,
} from 'aws-lambda';
import { reconcileMonitoringTaskStacks } from '../monitoringTasks/reconcileMonitoringTaskStacks';

export const reconcileTaskStacksApi: APIGatewayProxyHandler = async (): Promise<APIGatewayProxyResult> => {
  return {
    statusCode: 200,
    body: JSON.stringify(await reconcileMonitoringTaskStacks()),
  };
};

export const reconcileTaskStacksSchedule: SNSHandler = async (): Promise<void> => {
  await reconcileMonitoringTaskStacks();
};
