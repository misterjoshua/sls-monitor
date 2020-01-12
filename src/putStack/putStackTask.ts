import { CommonSQS } from '../aws';
import { getPutStackTaskQueue } from '../config';

export interface PutStackTask {
  stackName: string;
  templateBody: string;
}

export const putStackTask = async (
  stackName: string,
  templateBody: string,
): Promise<string> => {
  console.info(`Requesting to create ${stackName}:\n`, templateBody);
  const result = await CommonSQS.sendMessage({
    QueueUrl: getPutStackTaskQueue(),
    MessageBody: JSON.stringify({
      stackName,
      templateBody,
    } as PutStackTask),
  }).promise();

  return result.MessageId || '';
};

export const parsePutStackTask = (json: string): PutStackTask =>
  JSON.parse(json);
