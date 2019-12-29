import { CommonSNS } from '../../aws';
import { MonitoringTask } from '../index';

const MonitoringTaskTopic = process.env.MonitoringTaskTopic;

export const publishMonitoringTask = async (
  monitoringTask: MonitoringTask
): Promise<string> => {
  console.log('publishMonitoringTask = ', monitoringTask);

  const result = await CommonSNS.publish({
    TopicArn: MonitoringTaskTopic,
    Subject: monitoringTask.url,
    Message: JSON.stringify(monitoringTask),
  }).promise();

  return result.MessageId;
};
