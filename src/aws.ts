import * as AWSXRay from 'aws-xray-sdk';
import * as AWS from 'aws-sdk';

export const CommonAWS = AWSXRay.captureAWS(AWS);

export const CommonCloudWatch = new CommonAWS.CloudWatch();
export const CommonCloudWatchEvents = new CommonAWS.CloudWatchEvents();
export const CommonSQS = new CommonAWS.SQS();
export const CommonSNS = new CommonAWS.SNS();
export const CommonCloudFormation = new CommonAWS.CloudFormation();
