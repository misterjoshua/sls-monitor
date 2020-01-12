import * as cdk from '@aws-cdk/core';
import * as lambda from '@aws-cdk/aws-lambda';
import * as lambdaEvents from '@aws-cdk/aws-lambda-event-sources';
import * as cloudwatch from '@aws-cdk/aws-cloudwatch';
import { CommonProps } from './Stack';

export class HttpChecker extends cdk.Construct {
  constructor(scope: cdk.Construct, id: string, props: CommonProps) {
    super(scope, id);

    const snsWorker = new lambda.Function(this, 'SnsWorkerFn', {
      runtime: lambda.Runtime.NODEJS_12_X,
      handler: 'lambda.snsWorker',
      code: lambda.Code.fromAsset('./dist/checkHttp'),
      layers: [props.nodeModulesLayer],
      tracing: props.tracing,
      events: [new lambdaEvents.SnsEventSource(props.checkTopic)],
    });
    cloudwatch.Metric.grantPutMetricData(snsWorker);
  }
}
