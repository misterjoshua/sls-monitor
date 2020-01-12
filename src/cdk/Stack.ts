import * as cdk from '@aws-cdk/core';
import { HttpChecker } from './HttpChecker';
import * as lambda from '@aws-cdk/aws-lambda';
import * as sns from '@aws-cdk/aws-sns';
import * as sqs from '@aws-cdk/aws-sqs';
import { MonitoringTask } from './MonitoringTask';
import { PutStack } from '../checkHttp/PutStack';

export interface CommonProps {
  checkTopic: sns.Topic;
  tracing: lambda.Tracing;
}

export class Stack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string) {
    super(scope, id);

    const checkTopic = new sns.Topic(this, 'CheckTopic');
    const deadTasks = new sqs.Queue(this, 'DeadTasksQueue');

    const putStackTaskQueue = new sqs.Queue(this, 'PutStackTaskQueue', {
      deadLetterQueue: {
        maxReceiveCount: 2,
        queue: deadTasks,
      },
    });

    const commonProps: CommonProps = {
      checkTopic,
      tracing: lambda.Tracing.ACTIVE,
    };

    const resourceUniqueString = this.stackName;

    new HttpChecker(this, 'HttpChecker', commonProps);

    new PutStack(this, 'PutStack', {
      ...commonProps,
      queue: putStackTaskQueue,
      resourceUniqueString: resourceUniqueString,
    });

    new MonitoringTask(this, 'MonitoringTasks', {
      ...commonProps,
      tracing: lambda.Tracing.ACTIVE,
      putStackTaskQueue,
      resourceUniqueString: resourceUniqueString,
    });
  }
}
