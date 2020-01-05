const getOrThrow = (name: string, value: string) => (): string => {
  if (value === '' || value === undefined)
    throw new Error(`Cannot get ${name} as it is uninitialized`);
  return value;
};

export const getMonitoringTasksTable = getOrThrow(
  'MonitoringTasksTable',
  process.env.MonitoringTasksTable
);
export const getMonitoringTaskTopic = getOrThrow(
  'MonitoringTaskTopic',
  process.env.MonitoringTaskTopic
);
export const getPutStackTaskQueue = getOrThrow(
  'PutStackTaskQueue',
  process.env.PutStackTaskQueue
);
export const getResourceUniqueString = getOrThrow(
  'ResourceUniqueString',
  process.env.ResourceUniqueString
);
export const getMonitoringAlertsTopicExportName = getOrThrow(
  'MonitoringAlertsTopicExportName',
  process.env.MonitoringAlertsTopicExportName
);
