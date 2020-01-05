import * as cdk from '@aws-cdk/core';
import { Stack } from './stack';

const app = new cdk.App();
new Stack(app, 'monitor-cdk');
