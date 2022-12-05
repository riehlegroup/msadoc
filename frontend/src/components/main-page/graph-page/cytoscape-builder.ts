import { EdgeDefinition, ElementDefinition, NodeDefinition } from 'cytoscape';

import {
  APINode,
  EventNode,
  RegularGroupNode,
  RootGroupNode,
  ServiceDocsTreeNodeType,
  ServiceNode,
} from '../service-docs-tree';

export interface ICyptoScapeBuilder {
  fromGroup(group: RegularGroupNode | RootGroupNode): ICyptoScapeBuilder;
  build(): ElementDefinition[];
}

interface MyNodeDefinition<Type extends 'service' | 'group'>
  extends NodeDefinition {
  group: 'nodes';
  data: {
    type: Type;
    id: string;
    name: string;
    parent?: string | undefined;
  };
  style: {
    'background-color': string;
  };
}
type ServiceNodeDefinition = MyNodeDefinition<'service'>;
type GroupNodeDefinition = MyNodeDefinition<'group'>;

interface MyEdgeDefinition<Type extends 'api' | 'event'>
  extends EdgeDefinition {
  group: 'edges';
  data: {
    type: Type;
    source: string;
    target: string;
  };
  style: {
    'line-color': string;
    'target-arrow-color': string;
  };
}
type ApiEdgeDefinition = MyEdgeDefinition<'api'>;
type EventEdgeDefinition = MyEdgeDefinition<'event'>;

interface CytoScapeBuilderOptions {
  apiEdgeColorFn: (apiNode: APINode) => string;
  eventEdgeColorFn: (eventNode: EventNode) => string;
  serviceBackgroundColorFn: (groupNode: ServiceNode) => string;
  groupBackgroundColorFn: (groupNode: RegularGroupNode) => string;
}

export class CyptoScapeBuilder implements ICyptoScapeBuilder {
  elementDefinitions: ElementDefinition[] = [];

  constructor(private options: CytoScapeBuilderOptions) {}

  fromGroup(group: RegularGroupNode | RootGroupNode): CyptoScapeBuilder {
    for (const childGroup of Object.values(group.childGroups)) {
      this.addGroup(childGroup);
      this.fromGroup(childGroup);
    }
    for (const childService of Object.values(group.services)) {
      this.addService(childService);
    }
    return this;
  }

  private addService(service: ServiceNode): void {
    this.doAddService(service);
    this.doAddServiceDependencies(service);
  }

  private doAddService(service: ServiceNode): void {
    const nodeDefinition: ServiceNodeDefinition = {
      group: 'nodes',
      data: {
        type: 'service',
        id: this.getServiceIdentifier(service),
        name: service.name,
      },
      style: {
        'background-color': this.options.serviceBackgroundColorFn(service),
      },
    };
    if (service.group.type === ServiceDocsTreeNodeType.RegularGroup) {
      nodeDefinition.data.parent = service.group.identifier;
    }
    this.elementDefinitions.push(nodeDefinition);
  }

  private getServiceIdentifier(service: ServiceNode): string {
    return `${
      service.group.type === ServiceDocsTreeNodeType.RegularGroup
        ? service.group.identifier
        : '#/'
    }/${service.name}`;
  }

  private doAddServiceDependencies(service: ServiceNode): void {
    for (const consumedApi of service.consumedAPIs) {
      for (const apiProvider of consumedApi.providedBy) {
        const edgeColor = this.options.apiEdgeColorFn(consumedApi);
        const nodeDefinition: ApiEdgeDefinition = {
          group: 'edges',
          data: {
            type: 'api',
            source: this.getServiceIdentifier(service),
            target: this.getServiceIdentifier(apiProvider),
          },
          style: {
            'line-color': edgeColor,
            'target-arrow-color': edgeColor,
          },
        };
        this.elementDefinitions.push(nodeDefinition);
      }
    }

    for (const providedApi of service.providedAPIs) {
      for (const apiConsumer of providedApi.consumedBy) {
        const edgeColor = this.options.apiEdgeColorFn(providedApi);
        const nodeDefinition: ApiEdgeDefinition = {
          group: 'edges',
          data: {
            type: 'api',
            source: this.getServiceIdentifier(apiConsumer),
            target: this.getServiceIdentifier(service),
          },
          style: {
            'line-color': edgeColor,
            'target-arrow-color': edgeColor,
          },
        };
        this.elementDefinitions.push(nodeDefinition);
      }
    }

    for (const subscribedEvent of service.subscribedEvents) {
      for (const eventPublisher of subscribedEvent.publishedBy) {
        const edgeColor = this.options.eventEdgeColorFn(subscribedEvent);
        const nodeDefinition: EventEdgeDefinition = {
          group: 'edges',
          data: {
            type: 'event',
            source: this.getServiceIdentifier(service),
            target: this.getServiceIdentifier(eventPublisher),
          },
          style: {
            'line-color': edgeColor,
            'target-arrow-color': edgeColor,
          },
        };
        this.elementDefinitions.push(nodeDefinition);
      }
    }

    for (const publishedEvent of service.publishedEvents) {
      for (const eventSubscriber of publishedEvent.subscribedBy) {
        const edgeColor = this.options.eventEdgeColorFn(publishedEvent);
        const nodeDefinition: EventEdgeDefinition = {
          group: 'edges',
          data: {
            type: 'event',
            source: this.getServiceIdentifier(eventSubscriber),
            target: this.getServiceIdentifier(service),
          },
          style: {
            'line-color': edgeColor,
            'target-arrow-color': edgeColor,
          },
        };
        this.elementDefinitions.push(nodeDefinition);
      }
    }
  }

  private addGroup(group: RegularGroupNode): void {
    this.doAddGroup(group);

    for (const childGroup of Object.values(group.childGroups)) {
      this.fromGroup(childGroup);
    }
  }

  private doAddGroup(group: RegularGroupNode): void {
    const nodeDefinition: GroupNodeDefinition = {
      group: 'nodes',
      data: {
        type: 'group',
        id: group.identifier,
        name: group.name,
      },
      style: {
        'background-color': this.options.groupBackgroundColorFn(group),
      },
    };
    if (group.parent.type !== ServiceDocsTreeNodeType.RootGroup) {
      nodeDefinition.data.parent = group.parent.identifier;
    }
    this.elementDefinitions.push(nodeDefinition);
  }

  build(): ElementDefinition[] {
    this.removeDuplicateEdges();
    return this.elementDefinitions;
  }

  removeDuplicateEdges(): void {
    const allEdges = this.elementDefinitions.filter((x) => x.group === 'edges');
    const otherNodes = this.elementDefinitions.filter(
      (x) => x.group !== 'edges',
    );

    const edgeSet = new Set<string>();
    allEdges.forEach((x) => edgeSet.add(JSON.stringify(x)));
    edgeSet.forEach((x) => otherNodes.push(JSON.parse(x) as EdgeDefinition));

    this.elementDefinitions = otherNodes;
  }
}
