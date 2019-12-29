import { Dimension } from 'aws-sdk/clients/cloudwatch';
import { MonitoringTask } from '../monitoringTasks';

export const createDimensions = (task: MonitoringTask): Dimension[] => [
  {
    Name: 'TaskName',
    Value: task.name,
  },
];
