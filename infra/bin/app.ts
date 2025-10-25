#!/usr/bin/env node
// CDK App Entry Point - Feature Analyst V2
// Minimal setup, delegates to functional constructs

import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { FeatureAnalystStack } from '../lib/feature-analyst-stack';
import {
  getEnvironmentConfig,
  backendConfig,
  frontendConfig,
  monitoringConfig,
} from '../lib/config';

// Get environment from context or default to development
const app = new cdk.App();
const environment = app.node.tryGetContext('environment') || process.env.ENVIRONMENT || 'development';

// Get environment-specific configuration
const envConfig = getEnvironmentConfig(environment);

// Create the stack
new FeatureAnalystStack(
  app,
  `FeatureAnalystStack-${envConfig.environment}`,
  envConfig,
  backendConfig,
  frontendConfig,
  monitoringConfig,
  {
    env: {
      account: process.env.CDK_DEFAULT_ACCOUNT,
      region: process.env.CDK_DEFAULT_REGION || 'us-east-1',
    },
    description: `Feature Analyst V2 - ${envConfig.environment} environment`,
    tags: {
      Environment: envConfig.environment,
      Application: 'feature-analyst-v2',
      ManagedBy: 'CDK',
    },
  }
);

app.synth();
