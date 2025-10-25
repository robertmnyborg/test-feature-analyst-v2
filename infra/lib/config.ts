// Environment configuration for Feature Analyst V2
// Pure data structures - no classes, all exported as const

export interface EnvironmentConfig {
  readonly environment: string;
  readonly domain: string;
  readonly certificateArn: string;
  readonly hostedZoneId: string;
  readonly hostedZoneName: string;
  readonly existingClusterName: string;
  readonly existingVpcId: string;
  readonly databaseUrl: string; // SSM parameter name
  readonly censusApiKey: string; // SSM parameter name
}

export interface BackendConfig {
  readonly serviceName: string;
  readonly containerPort: number;
  readonly healthCheckPath: string;
  readonly desiredCount: number;
  readonly minCapacity: number;
  readonly maxCapacity: number;
  readonly cpu: number;
  readonly memoryLimitMiB: number;
  readonly autoScaling: {
    readonly targetCpuUtilization: number;
    readonly targetMemoryUtilization: number;
  };
}

export interface FrontendConfig {
  readonly bucketName: string;
  readonly indexDocument: string;
  readonly errorDocument: string;
  readonly buildPath: string;
}

export interface MonitoringConfig {
  readonly enableAlarms: boolean;
  readonly alarmEmail?: string;
  readonly highCpuThreshold: number;
  readonly highMemoryThreshold: number;
  readonly errorRateThreshold: number;
}

// Production environment configuration
export const prodConfig: EnvironmentConfig = {
  environment: 'production',
  domain: 'unit-features.peek.us',
  certificateArn: 'arn:aws:acm:us-east-1:ACCOUNT_ID:certificate/CERT_ID', // Replace with actual ARN
  hostedZoneId: 'HOSTED_ZONE_ID', // Replace with actual Zone ID
  hostedZoneName: 'peek.us',
  existingClusterName: 'peek-ecs-cluster', // Replace with actual cluster name
  existingVpcId: 'vpc-xxxxx', // Replace with actual VPC ID
  databaseUrl: '/feature-analyst/production/database-url',
  censusApiKey: '/feature-analyst/production/census-api-key',
};

// Development environment configuration
export const devConfig: EnvironmentConfig = {
  environment: 'development',
  domain: 'unit-features-dev.peek.us',
  certificateArn: 'arn:aws:acm:us-east-1:ACCOUNT_ID:certificate/CERT_ID', // Replace with actual ARN
  hostedZoneId: 'HOSTED_ZONE_ID', // Replace with actual Zone ID
  hostedZoneName: 'peek.us',
  existingClusterName: 'peek-ecs-cluster-dev', // Replace with actual cluster name
  existingVpcId: 'vpc-xxxxx', // Replace with actual VPC ID
  databaseUrl: '/feature-analyst/development/database-url',
  censusApiKey: '/feature-analyst/development/census-api-key',
};

// Backend configuration (shared across environments)
export const backendConfig: BackendConfig = {
  serviceName: 'feature-analyst-api',
  containerPort: 3001,
  healthCheckPath: '/api/health',
  desiredCount: 1,
  minCapacity: 1,
  maxCapacity: 3,
  cpu: 512,
  memoryLimitMiB: 1024,
  autoScaling: {
    targetCpuUtilization: 80,
    targetMemoryUtilization: 80,
  },
};

// Frontend configuration (shared across environments)
export const frontendConfig: FrontendConfig = {
  bucketName: 'feature-analyst-frontend',
  indexDocument: 'index.html',
  errorDocument: 'index.html', // SPA routing
  buildPath: '../frontend/dist',
};

// Monitoring configuration (shared across environments)
export const monitoringConfig: MonitoringConfig = {
  enableAlarms: true,
  alarmEmail: 'alerts@peek.us', // Replace with actual email
  highCpuThreshold: 80,
  highMemoryThreshold: 80,
  errorRateThreshold: 5, // percentage
};

// Pure function to get environment configuration
export const getEnvironmentConfig = (env: string): EnvironmentConfig => {
  switch (env) {
    case 'production':
    case 'prod':
      return prodConfig;
    case 'development':
    case 'dev':
      return devConfig;
    default:
      return devConfig;
  }
};

// Pure function to get CORS origin from environment
export const getCorsOrigin = (config: EnvironmentConfig): string => {
  return `https://${config.domain}`;
};

// Pure function to construct SSM parameter paths
export const getParameterPaths = (config: EnvironmentConfig) => ({
  databaseUrl: config.databaseUrl,
  censusApiKey: config.censusApiKey,
  corsOrigin: `/feature-analyst/${config.environment}/cors-origin`,
});
