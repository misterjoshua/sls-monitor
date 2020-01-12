import * as cdk from '@aws-cdk/core';
import * as sqs from '@aws-cdk/aws-sqs';
import * as lambda from '@aws-cdk/aws-lambda';
import * as lambdaEvents from '@aws-cdk/aws-lambda-event-sources';
import * as iam from '@aws-cdk/aws-iam';
import { CommonProps } from './Stack';

interface PutStackProps extends CommonProps {
  queue: sqs.Queue;
  resourceUniqueString: string;
}

export class PutStack extends cdk.Construct {
  constructor(scope: cdk.Construct, id: string, props: PutStackProps) {
    super(scope, id);

    const taskWorkerFn = new lambda.Function(this, 'TaskWorkerFn', {
      runtime: lambda.Runtime.NODEJS_12_X,
      code: lambda.Code.fromAsset('./dist/putStack'),
      layers: [props.nodeModulesLayer],
      handler: 'lambda.taskWorker',
      environment: {
        ResourceUniqueString: props.resourceUniqueString,
      },
      events: [new lambdaEvents.SqsEventSource(props.queue)],
    });
    taskWorkerFn.addToRolePolicy(
      new iam.PolicyStatement({
        actions: ['cloudwatch:*', 'cloudformation:*'],
        resources: ['*'],
      }),
    );
  }
}
