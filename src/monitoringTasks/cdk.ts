import * as cdk from '@aws-cdk/core';
import * as lambda from '@aws-cdk/aws-lambda';
import * as lambdaEvents from '@aws-cdk/aws-lambda-event-sources';
import { CommonProps } from '../../cdk/stack';
import * as dynamodb from '@aws-cdk/aws-dynamodb';
import * as events from '@aws-cdk/aws-events';
import * as eventsTargets from '@aws-cdk/aws-events-targets';
import * as sqs from '@aws-cdk/aws-sqs';
import * as sns from '@aws-cdk/aws-sns';

export interface MonitoringTaskProps extends CommonProps {
  putStackTaskQueue: sqs.Queue;
  resourceUniqueString: string;
}

export class MonitoringTask extends cdk.Construct {
  constructor(scope: cdk.Construct, id: string, props: MonitoringTaskProps) {
    super(scope, id);

    const table = new dynamodb.Table(this, 'TasksTable', {
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      partitionKey: {
        name: 'name',
        type: dynamodb.AttributeType.STRING,
      },
    });

    const monitoringAlertsTopic = new sns.Topic(this, 'MonitoringAlertsTopic');
    const monitoringAlertsTopicExportName = `${props.resourceUniqueString}MonitoringAlertsTopic`;

    new cdk.CfnOutput(this, 'MonitoringAlertsTopicName', {
      value: monitoringAlertsTopic.topicArn,
      exportName: monitoringAlertsTopicExportName,
    });

    const environment = {
      MonitoringTasksTable: table.tableName,
      PutStackTaskQueue: props.putStackTaskQueue.queueUrl,
      MonitoringTaskTopic: props.checkTopic.topicArn,
      ResourceUniqueString: props.resourceUniqueString,
      MonitoringAlertsTopicExportName: monitoringAlertsTopicExportName,
    };

    const restApiFn = new lambda.Function(this, 'CheckAllFn', {
      handler: 'index.restApi',
      runtime: lambda.Runtime.NODEJS_12_X,
      code: lambda.Code.fromAsset('./dist/src/monitoringTasks/lambda'),
      layers: [props.baseLayer],
      environment,
      tracing: props.tracing,
      events: [
        new lambdaEvents.ApiEventSource("any", "/check")
      ]
    });
    table.grantReadWriteData(restApiFn);
    props.checkTopic.grantPublish(restApiFn);

    // Add the check schedule.

    const scheduleWorkerFn = new lambda.Function(this, 'ScheduleWorkerFn', {
      handler: 'index.scheduleWorker',
      code: lambda.Code.fromAsset('./dist/src/monitoringTasks/lambda'),
      runtime: lambda.Runtime.NODEJS_12_X,
      layers: [props.baseLayer],
      environment,
      tracing: props.tracing,
    });
    table.grantReadData(scheduleWorkerFn);
    props.checkTopic.grantPublish(scheduleWorkerFn);

    new events.Rule(this, 'ScheduleRule', {
      schedule: events.Schedule.cron({}),
      targets: [new eventsTargets.LambdaFunction(scheduleWorkerFn)],
    });

    // Reconcile Alarms API

    const reconcileRestApiFn = new lambda.Function(this, 'ReconcileRestApiFn', {
      handler: 'index.reconcileRestApi',
      code: lambda.Code.fromAsset('./dist/src/monitoringTasks/lambda'),
      runtime: lambda.Runtime.NODEJS_12_X,
      layers: [props.baseLayer],
      environment,
      tracing: props.tracing,
      events: [
        new lambdaEvents.ApiEventSource("any", "/reconcile"),
      ]
    });
    props.putStackTaskQueue.grantSendMessages(reconcileRestApiFn);
    table.grantReadData(reconcileRestApiFn);

    // Reconcile Alarms schedule

    const reconcileScheduleFn = new lambda.Function(
      this,
      'ReconcileScheduleFn',
      {
        handler: 'index.reconcileScheduleWorker',
        code: lambda.Code.fromAsset('./dist/src/monitoringTasks/lambda'),
        runtime: lambda.Runtime.NODEJS_12_X,
        layers: [props.baseLayer],
        environment,
        tracing: props.tracing,
      }
    );
    props.putStackTaskQueue.grantSendMessages(reconcileScheduleFn);
    table.grantReadData(reconcileScheduleFn);

    new events.Rule(this, 'ReconcileScheduleRule', {
      schedule: events.Schedule.cron({
        minute: '*/30',
      }),
      targets: [new eventsTargets.LambdaFunction(reconcileScheduleFn)],
    });
  }
}
