import * as cdk from '@aws-cdk/core';
import * as apigateway from '@aws-cdk/aws-apigateway';
import * as lambda from '@aws-cdk/aws-lambda';
import { CommonProps } from '../../cdk/stack';
import * as dynamodb from '@aws-cdk/aws-dynamodb';
import * as events from '@aws-cdk/aws-events';
import * as eventsTargets from '@aws-cdk/aws-events-targets';
import * as sqs from '@aws-cdk/aws-sqs';
import * as sns from '@aws-cdk/aws-sns';

export interface MonitoringTaskProps extends CommonProps {
  baseResource: apigateway.IResource;
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

    // Add the checkAll api.

    const restApiResource = new apigateway.Resource(this, 'CheckAllResource', {
      parent: props.baseResource,
      pathPart: 'check',
    });

    const restApiFn = new lambda.Function(this, 'CheckAllFn', {
      handler: 'index.restApi',
      runtime: lambda.Runtime.NODEJS_12_X,
      code: lambda.Code.fromAsset('./dist/src/monitoringTasks/lambda'),
      layers: [props.baseLayer],
      environment,
      tracing: props.tracing,
    });
    table.grantReadWriteData(restApiFn);
    restApiResource.addMethod(
      'any',
      new apigateway.LambdaIntegration(restApiFn)
    );
    props.checkTopic.grantPublish(restApiFn);

    new cdk.CfnOutput(this, 'CheckAllEndpoint', {
      value: restApiResource.url,
    });

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
    });
    props.putStackTaskQueue.grantSendMessages(reconcileRestApiFn);
    table.grantReadData(reconcileRestApiFn);

    const reconcileRestApiResource = new apigateway.Resource(
      this,
      'ReconcileRestApiResource',
      {
        parent: props.baseResource,
        pathPart: 'reconcile',
      }
    );
    reconcileRestApiResource.addMethod(
      'any',
      new apigateway.LambdaIntegration(reconcileRestApiFn)
    );

    new cdk.CfnOutput(this, 'ReconcileEndpoint', {
      value: reconcileRestApiResource.url,
    });

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
