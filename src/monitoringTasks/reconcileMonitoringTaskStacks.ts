import { getMonitoringTasks, MonitoringTask } from '.';
import { putStackTask } from '../putStack/putStackTask';

const ResourceUniqueString = process.env.ResourcePrefix;
const MonitoringAlertsTopicExportName =
  process.env.MonitoringAlertsTopicExportName;

const createAlarm = (task: MonitoringTask, index: number): object => ({
  Type: 'AWS::CloudWatch::Alarm',
  Properties: {
    AlarmActions: [{ 'Fn::ImportValue': MonitoringAlertsTopicExportName }],
    AlarmName: `${task.name}-${ResourceUniqueString}-${index}`,
    ComparisonOperator: 'LessThanThreshold',
    DatapointsToAlarm: 2,
    Dimensions: [{ Name: 'TaskName', Value: task.name }],
    EvaluationPeriods: 2,
    MetricName: 'successfulContentCheck',
    Namespace: 'misterjoshua/monitor',
    Period: 300,
    Statistic: 'Average',
    Threshold: 1.0,
  },
});

type MonitoringTaskStackResult = string[];

const putMonitoringTaskStacks = async (
  tasks: MonitoringTask[]
): Promise<MonitoringTaskStackResult> => {
  const template = {
    AWSTemplateFormatVersion: '2010-09-09',
    Description: 'Task Stack',
    Resources: {},
  };

  tasks.forEach((task, i) => {
    template.Resources[`Alarm${i}`] = createAlarm(task, i);
  });

  console.log(template);

  const putStackTaskId = await putStackTask(
    `${ResourceUniqueString}-monitoring-tasks-stack`,
    JSON.stringify(template)
  );

  return [putStackTaskId];
};

export const reconcileMonitoringTaskStacks = async (): Promise<MonitoringTaskStackResult> => {
  return await putMonitoringTaskStacks(await getMonitoringTasks());
};
