import { MonitoringTask } from '..';
import { ResourceUniqueString } from './reconcileMonitoringTaskStacks';

export const MonitoringAlertsTopicExportName =
  process.env.MonitoringAlertsTopicExportName;

const slugName = (name: string, filler = 'z'): string => name.replace(/[^a-z0-9]/gi, filler);
const resourceName = (name: string): string => 'r' + slugName(name);

const createAlarm = (task: MonitoringTask): object => ({
  Type: 'AWS::CloudWatch::Alarm',
  Properties: {
    AlarmActions: [{ 'Fn::ImportValue': MonitoringAlertsTopicExportName }],
    AlarmName: `${slugName(task.name,'-')}-${ResourceUniqueString}`,
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
  const template = {
    AWSTemplateFormatVersion: '2010-09-09',
    Description: 'Task Stack',
    Resources: {},
  };

  tasks.forEach(task => {
    template.Resources[resourceName(task.name)] = createAlarm(task);
  });

  return template;
}
