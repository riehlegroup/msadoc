import { GetServiceDocResponse } from 'msadoc-client';

const allServiceDocs: GetServiceDocResponse[] = [
  {
    name: 'WebClient',
    group: 'frontend',
    tags: ['project=msadoc-demo'],
    repository: 'https://github.com/msadoc-demo/web-client',
    taskBoard: 'https://github.com/orgs/msadoc-demo/projects/1',
    consumedAPIs: [
      '/extractions/config',
      '/extractions/execution-stats',
      '/transformation/configs',
      '/transformation/execution-stats',
      '/load/configs',
      '/load/execution-stats',
      '/notifications/configs',
      '/notifications/execution-stats',
      '/query/graphql',
      '/query/restful',
    ],
    deploymentDocumentation:
      'https://github.com/msadoc-demo/web-client/blob/main/deployment.md',
    responsibles: ['john.doe@msadoc-demo.org'],
    responsibleTeam: 'WC Team',
    creationTimestamp: '2022-12-16T13:56:47.727Z',
    updateTimestamp: '2022-12-16T14:00:22.610Z',
    extensions: {
      "usedInProducts": ["WhiteLabelProduct", "CloudService"],
      "programmingLanguage": "TypeScript"
    }
  },
  {
    name: 'ExtractionService',
    group: 'backend.etl.extract',
    tags: ['project=msadoc-demo'],
    repository: 'https://github.com/msadoc-demo/extraction-service',
    taskBoard: 'https://github.com/orgs/msadoc-demo/projects/2',
    providedAPIs: ['/extractions/config', '/extractions/execution-stats'],
    subscribedEvents: ['extraction.execution.triggered'],
    publishedEvents: [
      'extraction.config.created',
      'extraction.config.updated',
      'extraction.config.deleted',
      'extraction.execution.success',
      'extraction.execution.failure',
    ],
    deploymentDocumentation:
    'https://github.com/msadoc-demo/extraction-service/blob/main/deployment.md',
    responsibles: ['jane.smith@msadoc-demo.org'],
    responsibleTeam: 'ET Team',
    creationTimestamp: '2022-12-16T13:56:48.744Z',
    updateTimestamp: '2022-12-16T14:00:51.493Z',
    extensions: {
      "usedInProducts": ["WhiteLabelProduct", "CloudService"],
      "programmingLanguage": "TypeScript"
    }
  },
  {
    name: 'SchedulerService',
    group: 'backend.etl.extract',
    tags: ['project=msadoc-demo'],
    repository: 'https://github.com/msadoc-demo/scheduler-service',
    taskBoard: 'https://github.com/orgs/msadoc-demo/projects/3',
    providedAPIs: ['/scheduler/tasks'],
    subscribedEvents: [
      'extraction.config.created',
      'extraction.config.updated',
      'extraction.config.deleted',
    ],
    publishedEvents: ['extraction.execution.triggered'],
    developmentDocumentation:
      'https://github.com/msadoc-demo/scheduler-service/blob/main/README.md',
    deploymentDocumentation:
    'https://github.com/msadoc-demo/scheduler-service/blob/main/deployment.md',
    responsibles: ['jane.smith@msadoc-demo.org'],
    responsibleTeam: 'ET Team',
    creationTimestamp: '2022-12-16T13:56:49.570Z',
    updateTimestamp: '2022-12-16T14:00:52.661Z',
    extensions: {
      "usedInProducts": ["WhiteLabelProduct", "CloudService"],
      "programmingLanguage": "TypeScript"
    }
  },
  {
    name: 'LoadService',
    group: 'backend.etl.load',
    tags: ['project=msadoc-demo'],
    repository: 'https://github.com/msadoc-demo/load-service',
    taskBoard: 'https://github.com/orgs/msadoc-demo/projects/4',
    providedAPIs: ['/load/configs', '/load/execution-stats'],
    subscribedEvents: [
      'transformation.config.created',
      'transformation.config.updated',
      'transformation.config.deleted',
      'transformation.execution.success',
      'transformation.execution.failure',
    ],
    publishedEvents: [
      'load.config.created',
      'load.config.updated',
      'load.config.deleted',
      'load.execution.success',
      'load.execution.failure',
    ],
    deploymentDocumentation:
    'https://github.com/msadoc-demo/load-service/blob/main/deployment.md',
    responsibles: ['michael.johnson@msadoc-demo.org', 'emily.brown@msadoc-demo.org'],
    responsibleTeam: 'L Team',
    creationTimestamp: '2022-12-16T13:56:52.553Z',
    updateTimestamp: '2022-12-16T13:58:07.149Z',
    extensions: {
      "usedInProducts": ["WhiteLabelProduct", "CloudService"],
      "programmingLanguage": "Java"
    }
  },
  {
    name: 'NotificationService',
    group: 'backend',
    tags: ['project=msadoc-demo'],
    repository: 'https://github.com/msadoc-demo/notification-service',
    taskBoard: 'https://github.com/orgs/msadoc-demo/projects/5',
    providedAPIs: ['/notifications/configs', '/notifications/execution-stats'],
    subscribedEvents: ['load.execution.success', 'load.execution.failure'],
    publishedEvents: [
      'notification.config.created',
      'notification.config.updated',
      'notification.config.deleted',
      'notification.execution.success',
      'notification.execution.failure',
    ],
    deploymentDocumentation:
    'https://github.com/msadoc-demo/notification-service/blob/main/deployment.md',
    responsibles: ['daniel.wilson@msadoc-demo.org'],
    responsibleTeam: 'N Team',
    creationTimestamp: '2022-12-16T13:56:54.131Z',
    updateTimestamp: '2022-12-16T13:58:08.297Z',
    extensions: {
      "usedInProducts": ["CloudService"],
      "programmingLanguage": "Go"
    }
  },
  {
    name: 'RestfulQueryService',
    group: 'backend.etl.load.query',
    tags: ['project=msadoc-demo'],
    repository: 'https://github.com/msadoc-demo/restful-query-service',
    taskBoard: 'https://github.com/orgs/msadoc-demo/projects/6',
    providedAPIs: ['/query/restful'],
    subscribedEvents: [
      'loading.config.created',
      'loading.config.updated',
      'loading.config.deleted',
      'loading.execution.success',
      'loading.execution.failure',
    ],
    deploymentDocumentation:
    'https://github.com/msadoc-demo/restful-query-service/blob/main/deployment.md',
    responsibles: ['michael.johnson@msadoc-demo.org'],
    responsibleTeam: 'L Team',
    creationTimestamp: '2022-12-16T13:56:56.288Z',
    updateTimestamp: '2022-12-16T13:58:09.287Z',
    extensions: {
      "usedInProducts": ["CloudService"],
      "programmingLanguage": "Go"
    }
  },
  {
    name: 'GraphQlQueryService',
    group: 'backend.etl.load.query',
    tags: ['project=msadoc-demo'],
    repository: 'https://github.com/msadoc-demo/graphql-query-service',
    taskBoard: 'https://github.com/orgs/msadoc-demo/projects/7',
    providedAPIs: ['/query/graphql'],
    subscribedEvents: [
      'loading.config.created',
      'loading.config.updated',
      'loading.config.deleted',
      'loading.execution.success',
      'loading.execution.failure',
    ],
    deploymentDocumentation:
    'https://github.com/msadoc-demo/graphql-query-service/blob/main/deployment.md',
    responsibles: ['emily.brown@msadoc-demo.org'],
    responsibleTeam: 'L Team',
    creationTimestamp: '2022-12-16T13:56:57.659Z',
    updateTimestamp: '2022-12-16T13:58:10.360Z',
    extensions: {
      "usedInProducts": ["CloudService"],
      "programmingLanguage": "Go"
    }
  },
  {
    name: 'TransformationService',
    group: 'backend.etl.transform',
    tags: ['project=msadoc-demo'],
    repository: 'https://github.com/msadoc-demo/transformation-service',
    taskBoard: 'https://github.com/orgs/msadoc-demo/projects/8',
    providedAPIs: [
      '/transformation/configs',
      '/transformation/execution-stats',
    ],
    subscribedEvents: [
      'extraction.config.created',
      'extraction.config.updated',
      'extraction.config.deleted',
      'extraction.execution.success',
      'extraction.execution.failure',
    ],
    publishedEvents: [
      'transformation.execution.success',
      'transformation.execution.failure',
      'transformation.config.created',
      'transformation.config.updated',
      'transformation.config.deleted',
    ],
    developmentDocumentation:
      'https://github.com/msadoc-demo/transformation-service/blob/main/README.md',
    deploymentDocumentation:
      'https://github.com/msadoc-demo/transformation-service/tree/main/deployment.md',
    responsibles: ['jane.smith@msadoc-demo.org'],
    responsibleTeam: 'ET Team',
    creationTimestamp: '2022-12-16T13:56:51.462Z',
    updateTimestamp: '2022-12-16T13:59:32.151Z',
    extensions: {
      "usedInProducts": ["WhiteLabelProduct", "CloudService"],
      "programmingLanguage": "TypeScript"
    }
  },
  {
    name: 'MobileAppClient',
    group: 'frontend',
    tags: ['project=msadoc-demo'],
    repository: 'https://github.com/msadoc-demo/mobile-app',
    taskBoard: 'https://github.com/orgs/msadoc-demo/projects/9',
    developmentDocumentation:
      'https://github.com/msadoc-demo/mobile-app/blob/main/README.md',
    deploymentDocumentation:
      'https://github.com/msadoc-demo/mobile-app/tree/main/deployment.md',
    consumedAPIs: [
      '/extractions/config',
      '/extractions/execution-stats',
      '/transformation/configs',
      '/transformation/execution-stats',
      '/load/configs',
      '/load/execution-stats',
      '/notifications/configs',
      '/notifications/execution-stats',
      '/query/graphql',
      '/query/restful',
    ],
    responsibles: ['chris.davis@msadoc-demo.org'],
    responsibleTeam: 'App Team',
    creationTimestamp: '2022-12-16T13:56:51.462Z',
    updateTimestamp: '2022-12-16T13:59:32.151Z',
    extensions: {
      "usedInProducts": ["WhiteLabelProduct", "CloudService"],
      "programmingLanguage": "TypeScript"
    }
  },
];

export const ServiceDocsMockData = {
  allServiceDocs: allServiceDocs,
};
