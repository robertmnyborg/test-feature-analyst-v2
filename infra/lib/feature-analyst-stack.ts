// Feature Analyst V2 - Main CDK Stack
// Functional approach: minimal classes, all logic in pure functions

import { Stack, StackProps, Duration, RemovalPolicy, CfnOutput } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as ecs from 'aws-cdk-lib/aws-ecs';
import * as ecr from 'aws-cdk-lib/aws-ecr';
import * as elbv2 from 'aws-cdk-lib/aws-elasticloadbalancingv2';
import * as logs from 'aws-cdk-lib/aws-logs';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as ssm from 'aws-cdk-lib/aws-ssm';
import * as cloudwatch from 'aws-cdk-lib/aws-cloudwatch';
import * as cloudwatchActions from 'aws-cdk-lib/aws-cloudwatch-actions';
import * as sns from 'aws-cdk-lib/aws-sns';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as s3deploy from 'aws-cdk-lib/aws-s3-deployment';
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';
import * as origins from 'aws-cdk-lib/aws-cloudfront-origins';
import * as route53 from 'aws-cdk-lib/aws-route53';
import * as targets from 'aws-cdk-lib/aws-route53-targets';
import * as acm from 'aws-cdk-lib/aws-certificatemanager';
import {
  EnvironmentConfig,
  BackendConfig,
  FrontendConfig,
  MonitoringConfig,
  getCorsOrigin,
  getParameterPaths,
} from './config';

// ============================================================================
// Type Definitions
// ============================================================================

export interface InfrastructureResources {
  readonly vpc: ec2.IVpc;
  readonly cluster: ecs.ICluster;
  readonly alb: elbv2.ApplicationLoadBalancer;
  readonly ecsService: ecs.Ec2Service;
  readonly frontendBucket: s3.Bucket;
  readonly distribution: cloudfront.Distribution;
  readonly logGroup: logs.LogGroup;
}

export interface SecurityGroupConfig {
  readonly albSecurityGroup: ec2.SecurityGroup;
  readonly ecsSecurityGroup: ec2.SecurityGroup;
}

export interface LoadBalancerResources {
  readonly alb: elbv2.ApplicationLoadBalancer;
  readonly targetGroup: elbv2.ApplicationTargetGroup;
  readonly listener: elbv2.ApplicationListener;
}

export interface EcsResources {
  readonly taskDefinition: ecs.Ec2TaskDefinition;
  readonly container: ecs.ContainerDefinition;
  readonly service: ecs.Ec2Service;
}

// ============================================================================
// Pure Functions - VPC and Cluster
// ============================================================================

const importExistingVpc = (scope: Construct, vpcId: string): ec2.IVpc => {
  return ec2.Vpc.fromLookup(scope, 'ExistingVpc', {
    vpcId,
  });
};

const importExistingCluster = (
  scope: Construct,
  vpc: ec2.IVpc,
  clusterName: string
): ecs.ICluster => {
  return ecs.Cluster.fromClusterAttributes(scope, 'ExistingCluster', {
    clusterName,
    vpc,
    securityGroups: [],
  });
};

// ============================================================================
// Pure Functions - Security Groups
// ============================================================================

const createSecurityGroups = (
  scope: Construct,
  vpc: ec2.IVpc
): SecurityGroupConfig => {
  const albSecurityGroup = new ec2.SecurityGroup(scope, 'AlbSecurityGroup', {
    vpc,
    description: 'Security group for Feature Analyst ALB',
    allowAllOutbound: true,
  });

  albSecurityGroup.addIngressRule(
    ec2.Peer.anyIpv4(),
    ec2.Port.tcp(443),
    'Allow HTTPS from anywhere'
  );

  albSecurityGroup.addIngressRule(
    ec2.Peer.anyIpv4(),
    ec2.Port.tcp(80),
    'Allow HTTP from anywhere'
  );

  const ecsSecurityGroup = new ec2.SecurityGroup(scope, 'EcsSecurityGroup', {
    vpc,
    description: 'Security group for Feature Analyst ECS tasks',
    allowAllOutbound: true,
  });

  ecsSecurityGroup.addIngressRule(
    albSecurityGroup,
    ec2.Port.tcp(3001),
    'Allow traffic from ALB'
  );

  return { albSecurityGroup, ecsSecurityGroup };
};

// ============================================================================
// Pure Functions - IAM Roles
// ============================================================================

const createTaskRole = (scope: Construct): iam.Role => {
  const role = new iam.Role(scope, 'TaskRole', {
    assumedBy: new iam.ServicePrincipal('ecs-tasks.amazonaws.com'),
    description: 'IAM role for Feature Analyst ECS tasks',
  });

  // Add permissions for CloudWatch Logs
  role.addManagedPolicy(
    iam.ManagedPolicy.fromAwsManagedPolicyName('CloudWatchLogsFullAccess')
  );

  // Add permissions for SSM Parameter Store
  role.addToPolicy(
    new iam.PolicyStatement({
      effect: iam.Effect.ALLOW,
      actions: ['ssm:GetParameter', 'ssm:GetParameters'],
      resources: ['arn:aws:ssm:*:*:parameter/feature-analyst/*'],
    })
  );

  return role;
};

const createExecutionRole = (scope: Construct): iam.Role => {
  const role = new iam.Role(scope, 'ExecutionRole', {
    assumedBy: new iam.ServicePrincipal('ecs-tasks.amazonaws.com'),
    description: 'IAM role for ECS task execution (pulling images, logs)',
  });

  role.addManagedPolicy(
    iam.ManagedPolicy.fromAwsManagedPolicyName(
      'service-role/AmazonECSTaskExecutionRolePolicy'
    )
  );

  return role;
};

// ============================================================================
// Pure Functions - CloudWatch Logs
// ============================================================================

const createLogGroup = (scope: Construct, serviceName: string): logs.LogGroup => {
  return new logs.LogGroup(scope, 'LogGroup', {
    logGroupName: `/ecs/feature-analyst/${serviceName}`,
    retention: logs.RetentionDays.ONE_MONTH,
    removalPolicy: RemovalPolicy.DESTROY,
  });
};

// ============================================================================
// Pure Functions - Application Load Balancer
// ============================================================================

const createLoadBalancer = (
  scope: Construct,
  vpc: ec2.IVpc,
  securityGroup: ec2.SecurityGroup,
  config: BackendConfig
): LoadBalancerResources => {
  const alb = new elbv2.ApplicationLoadBalancer(scope, 'LoadBalancer', {
    vpc,
    internetFacing: true,
    securityGroup,
    http2Enabled: true,
  });

  const targetGroup = new elbv2.ApplicationTargetGroup(scope, 'TargetGroup', {
    vpc,
    port: config.containerPort,
    protocol: elbv2.ApplicationProtocol.HTTP,
    targetType: elbv2.TargetType.INSTANCE,
    healthCheck: {
      path: config.healthCheckPath,
      interval: Duration.seconds(30),
      timeout: Duration.seconds(5),
      healthyThresholdCount: 2,
      unhealthyThresholdCount: 3,
    },
    deregistrationDelay: Duration.seconds(30),
  });

  const listener = alb.addListener('HttpListener', {
    port: 80,
    protocol: elbv2.ApplicationProtocol.HTTP,
    defaultTargetGroups: [targetGroup],
  });

  return { alb, targetGroup, listener };
};

// ============================================================================
// Pure Functions - ECR Repository
// ============================================================================

const createEcrRepository = (scope: Construct, serviceName: string): ecr.Repository => {
  return new ecr.Repository(scope, 'EcrRepository', {
    repositoryName: serviceName,
    removalPolicy: RemovalPolicy.RETAIN,
    imageScanOnPush: true,
    imageTagMutability: ecr.TagMutability.MUTABLE,
    lifecycleRules: [
      {
        description: 'Keep last 10 images',
        maxImageCount: 10,
      },
    ],
  });
};

// ============================================================================
// Pure Functions - ECS Task Definition and Service
// ============================================================================

const createEcsTaskDefinition = (
  scope: Construct,
  taskRole: iam.Role,
  executionRole: iam.Role,
  config: BackendConfig
): ecs.Ec2TaskDefinition => {
  return new ecs.Ec2TaskDefinition(scope, 'TaskDefinition', {
    networkMode: ecs.NetworkMode.BRIDGE,
    taskRole,
    executionRole,
  });
};

const addContainerToTask = (
  taskDefinition: ecs.Ec2TaskDefinition,
  logGroup: logs.LogGroup,
  repository: ecr.Repository,
  config: BackendConfig,
  envConfig: EnvironmentConfig
): ecs.ContainerDefinition => {
  const parameterPaths = getParameterPaths(envConfig);

  return taskDefinition.addContainer('ApiContainer', {
    image: ecs.ContainerImage.fromEcrRepository(repository, 'latest'),
    cpu: config.cpu,
    memoryLimitMiB: config.memoryLimitMiB,
    logging: ecs.LogDrivers.awsLogs({
      streamPrefix: 'feature-analyst',
      logGroup,
    }),
    environment: {
      NODE_ENV: envConfig.environment,
      PORT: config.containerPort.toString(),
      CORS_ORIGIN: getCorsOrigin(envConfig),
    },
    secrets: {
      DATABASE_URL: ecs.Secret.fromSsmParameter(
        ssm.StringParameter.fromStringParameterName(
          taskDefinition,
          'DatabaseUrl',
          parameterPaths.databaseUrl
        )
      ),
      CENSUS_API_KEY: ecs.Secret.fromSsmParameter(
        ssm.StringParameter.fromStringParameterName(
          taskDefinition,
          'CensusApiKey',
          parameterPaths.censusApiKey
        )
      ),
    },
    portMappings: [
      {
        containerPort: config.containerPort,
        hostPort: 0, // Dynamic port mapping for BRIDGE mode
        protocol: ecs.Protocol.TCP,
      },
    ],
    healthCheck: {
      command: [
        'CMD-SHELL',
        `curl -f http://localhost:${config.containerPort}${config.healthCheckPath} || exit 1`,
      ],
      interval: Duration.seconds(30),
      timeout: Duration.seconds(5),
      retries: 3,
      startPeriod: Duration.seconds(60),
    },
  });
};

const createEcsService = (
  scope: Construct,
  cluster: ecs.ICluster,
  taskDefinition: ecs.Ec2TaskDefinition,
  targetGroup: elbv2.ApplicationTargetGroup,
  securityGroup: ec2.SecurityGroup,
  config: BackendConfig
): ecs.Ec2Service => {
  const service = new ecs.Ec2Service(scope, 'EcsService', {
    cluster,
    taskDefinition,
    desiredCount: config.desiredCount,
    minHealthyPercent: 50,
    maxHealthyPercent: 200,
    securityGroups: [securityGroup],
    enableExecuteCommand: true,
  });

  service.attachToApplicationTargetGroup(targetGroup);

  // Auto-scaling configuration
  const scaling = service.autoScaleTaskCount({
    minCapacity: config.minCapacity,
    maxCapacity: config.maxCapacity,
  });

  scaling.scaleOnCpuUtilization('CpuScaling', {
    targetUtilizationPercent: config.autoScaling.targetCpuUtilization,
    scaleInCooldown: Duration.seconds(60),
    scaleOutCooldown: Duration.seconds(60),
  });

  scaling.scaleOnMemoryUtilization('MemoryScaling', {
    targetUtilizationPercent: config.autoScaling.targetMemoryUtilization,
    scaleInCooldown: Duration.seconds(60),
    scaleOutCooldown: Duration.seconds(60),
  });

  return service;
};

// ============================================================================
// Pure Functions - Backend Infrastructure
// ============================================================================

const createBackendInfrastructure = (
  scope: Construct,
  envConfig: EnvironmentConfig,
  backendConfig: BackendConfig
): { alb: elbv2.ApplicationLoadBalancer; service: ecs.Ec2Service; logGroup: logs.LogGroup } => {
  // Import existing resources
  const vpc = importExistingVpc(scope, envConfig.existingVpcId);
  const cluster = importExistingCluster(scope, vpc, envConfig.existingClusterName);

  // Create security groups
  const { albSecurityGroup, ecsSecurityGroup } = createSecurityGroups(scope, vpc);

  // Create IAM roles
  const taskRole = createTaskRole(scope);
  const executionRole = createExecutionRole(scope);

  // Create log group
  const logGroup = createLogGroup(scope, backendConfig.serviceName);

  // Create load balancer
  const { alb, targetGroup } = createLoadBalancer(scope, vpc, albSecurityGroup, backendConfig);

  // Create ECR repository
  const repository = createEcrRepository(scope, backendConfig.serviceName);

  // Create ECS task definition
  const taskDefinition = createEcsTaskDefinition(scope, taskRole, executionRole, backendConfig);

  // Add container to task
  addContainerToTask(taskDefinition, logGroup, repository, backendConfig, envConfig);

  // Create ECS service
  const service = createEcsService(
    scope,
    cluster,
    taskDefinition,
    targetGroup,
    ecsSecurityGroup,
    backendConfig
  );

  return { alb, service, logGroup };
};

// ============================================================================
// Pure Functions - Frontend Infrastructure (S3 + CloudFront)
// ============================================================================

const createFrontendBucket = (
  scope: Construct,
  config: FrontendConfig,
  envName: string
): s3.Bucket => {
  return new s3.Bucket(scope, 'FrontendBucket', {
    bucketName: `${config.bucketName}-${envName}`,
    publicReadAccess: false,
    blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
    removalPolicy: RemovalPolicy.RETAIN,
    autoDeleteObjects: false,
    encryption: s3.BucketEncryption.S3_MANAGED,
    versioned: false,
  });
};

const createCloudFrontDistribution = (
  scope: Construct,
  bucket: s3.Bucket,
  alb: elbv2.ApplicationLoadBalancer,
  envConfig: EnvironmentConfig,
  frontendConfig: FrontendConfig
): cloudfront.Distribution => {
  // Import existing certificate
  const certificate = acm.Certificate.fromCertificateArn(
    scope,
    'Certificate',
    envConfig.certificateArn
  );

  // Create origin access identity for S3
  const originAccessIdentity = new cloudfront.OriginAccessIdentity(scope, 'OAI', {
    comment: `OAI for Feature Analyst ${envConfig.environment}`,
  });

  bucket.grantRead(originAccessIdentity);

  // Create CloudFront distribution
  const distribution = new cloudfront.Distribution(scope, 'Distribution', {
    defaultRootObject: frontendConfig.indexDocument,
    domainNames: [envConfig.domain],
    certificate,
    minimumProtocolVersion: cloudfront.SecurityPolicyProtocol.TLS_V1_2_2021,
    defaultBehavior: {
      origin: new origins.S3Origin(bucket, {
        originAccessIdentity,
      }),
      viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
      allowedMethods: cloudfront.AllowedMethods.ALLOW_GET_HEAD_OPTIONS,
      cachedMethods: cloudfront.CachedMethods.CACHE_GET_HEAD_OPTIONS,
      compress: true,
      cachePolicy: cloudfront.CachePolicy.CACHING_OPTIMIZED,
    },
    additionalBehaviors: {
      '/api/*': {
        origin: new origins.HttpOrigin(alb.loadBalancerDnsName, {
          protocolPolicy: cloudfront.OriginProtocolPolicy.HTTP_ONLY,
        }),
        viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        allowedMethods: cloudfront.AllowedMethods.ALLOW_ALL,
        cachePolicy: cloudfront.CachePolicy.CACHING_DISABLED,
        originRequestPolicy: cloudfront.OriginRequestPolicy.ALL_VIEWER,
      },
    },
    errorResponses: [
      {
        httpStatus: 404,
        responseHttpStatus: 200,
        responsePagePath: `/${frontendConfig.indexDocument}`,
        ttl: Duration.minutes(5),
      },
      {
        httpStatus: 403,
        responseHttpStatus: 200,
        responsePagePath: `/${frontendConfig.indexDocument}`,
        ttl: Duration.minutes(5),
      },
    ],
    priceClass: cloudfront.PriceClass.PRICE_CLASS_100,
  });

  return distribution;
};

const createRoute53Record = (
  scope: Construct,
  distribution: cloudfront.Distribution,
  envConfig: EnvironmentConfig
): route53.ARecord => {
  const hostedZone = route53.HostedZone.fromHostedZoneAttributes(scope, 'HostedZone', {
    hostedZoneId: envConfig.hostedZoneId,
    zoneName: envConfig.hostedZoneName,
  });

  return new route53.ARecord(scope, 'AliasRecord', {
    zone: hostedZone,
    recordName: envConfig.domain,
    target: route53.RecordTarget.fromAlias(new targets.CloudFrontTarget(distribution)),
  });
};

const deployFrontendAssets = (
  scope: Construct,
  bucket: s3.Bucket,
  distribution: cloudfront.Distribution,
  frontendConfig: FrontendConfig
): s3deploy.BucketDeployment => {
  return new s3deploy.BucketDeployment(scope, 'DeployFrontend', {
    sources: [s3deploy.Source.asset(frontendConfig.buildPath)],
    destinationBucket: bucket,
    distribution,
    distributionPaths: ['/*'],
  });
};

const createFrontendInfrastructure = (
  scope: Construct,
  alb: elbv2.ApplicationLoadBalancer,
  envConfig: EnvironmentConfig,
  frontendConfig: FrontendConfig
): { bucket: s3.Bucket; distribution: cloudfront.Distribution } => {
  const bucket = createFrontendBucket(scope, frontendConfig, envConfig.environment);
  const distribution = createCloudFrontDistribution(
    scope,
    bucket,
    alb,
    envConfig,
    frontendConfig
  );
  createRoute53Record(scope, distribution, envConfig);
  deployFrontendAssets(scope, bucket, distribution, frontendConfig);

  return { bucket, distribution };
};

// ============================================================================
// Pure Functions - Monitoring and Alarms
// ============================================================================

const createAlarmTopic = (scope: Construct, config: MonitoringConfig): sns.Topic => {
  const topic = new sns.Topic(scope, 'AlarmTopic', {
    displayName: 'Feature Analyst Alarms',
  });

  if (config.alarmEmail) {
    new sns.Subscription(scope, 'EmailSubscription', {
      topic,
      protocol: sns.SubscriptionProtocol.EMAIL,
      endpoint: config.alarmEmail,
    });
  }

  return topic;
};

const createCloudWatchAlarms = (
  scope: Construct,
  service: ecs.Ec2Service,
  alb: elbv2.ApplicationLoadBalancer,
  topic: sns.Topic,
  config: MonitoringConfig
): void => {
  if (!config.enableAlarms) return;

  // High CPU alarm
  const cpuAlarm = new cloudwatch.Alarm(scope, 'HighCpuAlarm', {
    metric: service.metricCpuUtilization(),
    threshold: config.highCpuThreshold,
    evaluationPeriods: 2,
    comparisonOperator: cloudwatch.ComparisonOperator.GREATER_THAN_THRESHOLD,
    alarmDescription: 'Alert when CPU utilization is too high',
    treatMissingData: cloudwatch.TreatMissingData.NOT_BREACHING,
  });
  cpuAlarm.addAlarmAction(new cloudwatchActions.SnsAction(topic));

  // High memory alarm
  const memoryAlarm = new cloudwatch.Alarm(scope, 'HighMemoryAlarm', {
    metric: service.metricMemoryUtilization(),
    threshold: config.highMemoryThreshold,
    evaluationPeriods: 2,
    comparisonOperator: cloudwatch.ComparisonOperator.GREATER_THAN_THRESHOLD,
    alarmDescription: 'Alert when memory utilization is too high',
    treatMissingData: cloudwatch.TreatMissingData.NOT_BREACHING,
  });
  memoryAlarm.addAlarmAction(new cloudwatchActions.SnsAction(topic));

  // 5XX error alarm (ALB)
  const errorAlarm = new cloudwatch.Alarm(scope, 'HighErrorRateAlarm', {
    metric: new cloudwatch.Metric({
      namespace: 'AWS/ApplicationELB',
      metricName: 'HTTPCode_Target_5XX_Count',
      dimensionsMap: {
        LoadBalancer: alb.loadBalancerFullName,
      },
      statistic: 'Sum',
      period: Duration.minutes(5),
    }),
    threshold: config.errorRateThreshold,
    evaluationPeriods: 1,
    comparisonOperator: cloudwatch.ComparisonOperator.GREATER_THAN_THRESHOLD,
    alarmDescription: 'Alert when 5XX error rate is too high',
    treatMissingData: cloudwatch.TreatMissingData.NOT_BREACHING,
  });
  errorAlarm.addAlarmAction(new cloudwatchActions.SnsAction(topic));

  // Unhealthy target alarm
  const unhealthyTargetAlarm = new cloudwatch.Alarm(scope, 'UnhealthyTargetAlarm', {
    metric: new cloudwatch.Metric({
      namespace: 'AWS/ApplicationELB',
      metricName: 'UnHealthyHostCount',
      dimensionsMap: {
        LoadBalancer: alb.loadBalancerFullName,
      },
      statistic: 'Average',
      period: Duration.minutes(1),
    }),
    threshold: 1,
    evaluationPeriods: 2,
    comparisonOperator: cloudwatch.ComparisonOperator.GREATER_THAN_OR_EQUAL_TO_THRESHOLD,
    alarmDescription: 'Alert when targets are unhealthy',
    treatMissingData: cloudwatch.TreatMissingData.NOT_BREACHING,
  });
  unhealthyTargetAlarm.addAlarmAction(new cloudwatchActions.SnsAction(topic));
};

// ============================================================================
// Main Stack Class (Required by CDK - Minimal Class)
// ============================================================================

export class FeatureAnalystStack extends Stack {
  constructor(
    scope: Construct,
    id: string,
    envConfig: EnvironmentConfig,
    backendConfig: BackendConfig,
    frontendConfig: FrontendConfig,
    monitoringConfig: MonitoringConfig,
    props?: StackProps
  ) {
    super(scope, id, props);

    // All logic delegated to pure functions
    const { alb, service, logGroup } = createBackendInfrastructure(
      this,
      envConfig,
      backendConfig
    );

    const { bucket, distribution } = createFrontendInfrastructure(
      this,
      alb,
      envConfig,
      frontendConfig
    );

    const alarmTopic = createAlarmTopic(this, monitoringConfig);
    createCloudWatchAlarms(this, service, alb, alarmTopic, monitoringConfig);

    // Outputs
    new CfnOutput(this, 'LoadBalancerDnsName', {
      value: alb.loadBalancerDnsName,
      description: 'ALB DNS name',
    });

    new CfnOutput(this, 'CloudFrontUrl', {
      value: `https://${distribution.distributionDomainName}`,
      description: 'CloudFront distribution URL',
    });

    new CfnOutput(this, 'CustomDomainUrl', {
      value: `https://${envConfig.domain}`,
      description: 'Custom domain URL',
    });

    new CfnOutput(this, 'FrontendBucketName', {
      value: bucket.bucketName,
      description: 'S3 bucket for frontend assets',
    });

    new CfnOutput(this, 'LogGroupName', {
      value: logGroup.logGroupName,
      description: 'CloudWatch Log Group',
    });
  }
}
