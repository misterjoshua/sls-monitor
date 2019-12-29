import { CommonSQS } from '../aws';

const PutStackTaskQueue = process.env.PutStackTaskQueue;

export interface PutStackTask {
  stackName: string;
  templateBody: string;
}

export const putStackTask = async (
  stackName: string,
  templateBody: string
): Promise<string> => {
  const result = await CommonSQS.sendMessage({
    QueueUrl: PutStackTaskQueue,
    MessageBody: JSON.stringify({
      stackName,
      templateBody,
    } as PutStackTask),
  }).promise();

  return result.MessageId;
};

export const parsePutStackTask = (json: string): PutStackTask =>
  JSON.parse(json);
