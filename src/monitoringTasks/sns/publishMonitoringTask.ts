import { CommonSNS } from '../../aws';
import { MonitoringTask } from '../index';
import { getMonitoringTaskTopic } from '../../config';

export const publishMonitoringTask = async (
  monitoringTask: MonitoringTask,
): Promise<string> => {
  console.debug('publishMonitoringTask = ', monitoringTask);

  const result = await CommonSNS.publish({
    TopicArn: getMonitoringTaskTopic(),
    Subject: monitoringTask.url,
    Message: JSON.stringify(monitoringTask),
  }).promise();

  return result.MessageId || '';
};
