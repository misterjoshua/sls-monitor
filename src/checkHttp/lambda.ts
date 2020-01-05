import { SNSHandler, SNSEvent } from 'aws-lambda';
import { parseMonitoringTask } from '../monitoringTasks';
import { bindLogPrefixes } from '../bindLogPrefixes';
import { runCheckHttp } from './runCheckHttp';

bindLogPrefixes();

export const snsWorker: SNSHandler = async (event: SNSEvent) => {
  await Promise.all(
    event.Records.map(async record => {
      const task = parseMonitoringTask(record);
      const result = await runCheckHttp(task);

      console.debug(task, result);
    })
  );
};
