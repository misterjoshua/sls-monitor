import {
  APIGatewayProxyHandler,
  APIGatewayProxyResult,
  SNSHandler,
} from 'aws-lambda';
import { reconcileMonitoringTaskStacks } from './stack/reconcileMonitoringTaskStacks';
import { bindLogPrefixes } from '../bindLogPrefixes';

bindLogPrefixes();

export const reconcileRestApi: APIGatewayProxyHandler = async (): Promise<APIGatewayProxyResult> => {
  return {
    statusCode: 200,
    body: JSON.stringify(await reconcileMonitoringTaskStacks()),
  };
};

export const reconcileScheduleWorker: SNSHandler = async (): Promise<void> => {
  await reconcileMonitoringTaskStacks();
};
