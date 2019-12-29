import { SQSHandler, SQSEvent } from 'aws-lambda';
import { parsePutStackTask } from '../putStack/putStackTask';
import { runPutStackTask } from '../putStack/runPutStackTask';

export const taskQueueWorker: SQSHandler = async (
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
