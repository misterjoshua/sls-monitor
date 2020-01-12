import * as cdk from '@aws-cdk/core';
import { Stack } from './Stack';

const app = new cdk.App();
new Stack(app, 'monitor-cdk');
