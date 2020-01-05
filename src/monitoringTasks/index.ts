import { parseMonitoringTask } from './sns/parseMonitoringTask';
import { publishMonitoringTask } from './sns/publishMonitoringTask';

export interface MonitoringTask {
  name: string;
  url: string;
  checkExpression: string;
}

export { parseMonitoringTask, publishMonitoringTask };
