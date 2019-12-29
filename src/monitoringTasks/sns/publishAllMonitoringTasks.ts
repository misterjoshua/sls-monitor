import { getMonitoringTasks, publishMonitoringTask } from '..';

export const publishAllMonitoringTasks = async (): Promise<object[]> => {
  const monitoringTasks = await getMonitoringTasks();
  console.log('publishAllMonitoringTasks monitoringTasks = ', monitoringTasks);

  const publishRecords = await Promise.all(
    monitoringTasks.map(async monitoringTask => ({
      monitoringTask,
      messageId: await publishMonitoringTask(monitoringTask),
    }))
  );

  return publishRecords;
};
