import AWSXRay from 'aws-xray-sdk';
import AWS from 'aws-sdk';

export const CommonAWS = AWSXRay.captureAWS(AWS);

const region = process.env.AWS_REGION;
export const CommonCloudWatch = new CommonAWS.CloudWatch({ region });
export const CommonCloudWatchEvents = new CommonAWS.CloudWatchEvents({
  region,
});
export const CommonSQS = new CommonAWS.SQS({ region });
export const CommonSNS = new CommonAWS.SNS({ region });
export const CommonCloudFormation = new CommonAWS.CloudFormation({ region });
