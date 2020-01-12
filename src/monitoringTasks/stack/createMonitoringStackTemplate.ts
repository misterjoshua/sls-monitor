import { MonitoringTask } from '..';
import {
  getMonitoringAlertsTopicExportName,
  getResourceUniqueString,
} from '../../config';

const slugName = (name: string, filler = 'z'): string =>
  name.replace(/[^a-z0-9]/gi, filler);
const resourceName = (name: string): string => 'r' + slugName(name);

const createAlarm = (task: MonitoringTask): object => ({
  Type: 'AWS::CloudWatch::Alarm',
  Properties: {
    AlarmActions: [{ 'Fn::ImportValue': getMonitoringAlertsTopicExportName() }],
    AlarmName: `${slugName(task.name, '-')}-${getResourceUniqueString()}`,
    ComparisonOperator: 'LessThanThreshold',
    DatapointsToAlarm: 2,
    Dimensions: [{ Name: 'TaskName', Value: task.name }],
    EvaluationPeriods: 2,
    MetricName: 'successfulContentCheck',
    Namespace: 'misterjoshua/monitor',
    Period: 300,
    Statistic: 'Average',
    Threshold: 0.8,
  },
});

export function createMonitoringStackTemplate(tasks: MonitoringTask[]): object {
  interface Resources {
    [x: string]: object;
  }
  interface Template {
    AWSTemplateFormatVersion: string;
    Description: string;
    Resources: Resources;
  }

  const template: Template = {
    AWSTemplateFormatVersion: '2010-09-09',
    Description: 'Task Stack',
    Resources: {},
  };

  tasks.forEach(task => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    template.Resources[resourceName(task.name as any)] = createAlarm(task);
  });

  return template;
}
