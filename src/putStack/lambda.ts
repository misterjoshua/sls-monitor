import { SQSHandler, SQSEvent } from 'aws-lambda';
import { parsePutStackTask } from './putStackTask';
import { runPutStackTask } from './runPutStackTask';
import { bindLogPrefixes } from '../bindLogPrefixes';

bindLogPrefixes();

export const taskWorker: SQSHandler = async (
  event: SQSEvent
): Promise<void> => {
  await Promise.all(
    event.Records.map(async record => {
      const task = parsePutStackTask(record.body);
      console.debug('task = ', task);
      await runPutStackTask(task);
    })
  );
};
