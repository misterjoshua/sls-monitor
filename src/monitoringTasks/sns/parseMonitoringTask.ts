import { SNSEventRecord } from 'aws-lambda';
import { MonitoringTask } from '../index';

export const parseMonitoringTask = (
  snsEventRecord: SNSEventRecord
): MonitoringTask => JSON.parse(snsEventRecord.Sns.Message);
