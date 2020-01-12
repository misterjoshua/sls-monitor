import { MonitoringTask } from '..';
import { putStackTask } from '../../putStack/putStackTask';
import { createMonitoringStackTemplate } from './createMonitoringStackTemplate';
import { getMonitoringTasks } from '../dynogels';

type MonitoringTaskStackResult = string[];

const putMonitoringTaskStacks = async (
  tasks: MonitoringTask[],
): Promise<MonitoringTaskStackResult> => {
  const template = createMonitoringStackTemplate(tasks);

  console.debug(template);

  const putStackTaskId = await putStackTask(
    `monitoring-tasks-stack`,
    JSON.stringify(template),
  );

  return [putStackTaskId];
};

export const reconcileMonitoringTaskStacks = async (): Promise<MonitoringTaskStackResult> => {
  return await putMonitoringTaskStacks(await getMonitoringTasks());
};
