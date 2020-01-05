import * as cdk from '@aws-cdk/core';
import * as lambda from '@aws-cdk/aws-lambda';
import * as snsSubcriptions from '@aws-cdk/aws-sns-subscriptions';
import * as cloudwatch from '@aws-cdk/aws-cloudwatch';
import { CommonProps } from '../../cdk/stack';

export class HttpChecker extends cdk.Construct {
  constructor(scope: cdk.Construct, id: string, common: CommonProps) {
    super(scope, id);

    const snsWorker = new lambda.Function(this, 'SnsWorkerFn', {
      runtime: lambda.Runtime.NODEJS_12_X,
      handler: 'index.snsWorker',
      code: lambda.Code.fromAsset('./dist/src/checkHttp/lambda'),
      layers: [common.baseLayer],
      tracing: common.tracing,
    });
    cloudwatch.Metric.grantPutMetricData(snsWorker);
    common.checkTopic.addSubscription(
      new snsSubcriptions.LambdaSubscription(snsWorker)
    );
  }
}
