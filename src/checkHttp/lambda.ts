import {
  APIGatewayProxyHandler,
  APIGatewayProxyResult,
  SNSHandler,
  SNSEvent,
} from 'aws-lambda';
import {
  parseMonitoringTask,
  runMonitoringTask,
  publishAllMonitoringTasks,
} from '../monitoringTasks';
import { bindLogPrefixes } from '../bindLogPrefixes';

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

export const snsWorker: SNSHandler = async (event: SNSEvent) => {
  await Promise.all(
    event.Records.map(async record => {
      const task = parseMonitoringTask(record);
      const result = await runMonitoringTask(task);

      console.debug(task, result);
    })
  );
};
