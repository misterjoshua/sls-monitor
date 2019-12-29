# SLS Monitor

This is a Serverless Framework-based monitoring system which is similar to AWS Synthetics Canaries, but a lot lower cost.

## About this Project

* Serverless Framework
* Written in TypeScript
* Lambda-based REST API
* Scheduled checks for HTTP status and for a keyword (regex)
* Records transport timings for HTTP
* Checks are configured through a DynamoDB table
* Puts custom metrics into CloudWatch Metrics
* Automatically creates Alarms for each check
* Very low operational cost compared to AWS Synthetics Canaries

## Status

This project is currently incubating, so check back later if you're interested in it.