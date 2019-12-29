import { runMonitoringTask } from './runMonitoringTask';
import { parseMonitoringTask } from './sns/parseMonitoringTask';
import { publishMonitoringTask } from './sns/publishMonitoringTask';
import { publishAllMonitoringTasks } from './sns/publishAllMonitoringTasks';
import { getMonitoringTasks } from './dynogels';

export interface MonitoringTask {
  name: string;
  url: string;
  checkExpression: string;
}

export {
  getMonitoringTasks,
  runMonitoringTask,
  parseMonitoringTask,
  publishMonitoringTask,
  publishAllMonitoringTasks,
};
