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
    // TODO: clarify if there may be dependencies that may have no source/target

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
    const nodeDefinition: NodeDefinition = {
      data: {
        id: this.getServiceIdentifier(service),
        label: service.name,
        backgroundColor: this.options.serviceBackgroundColorFn(service),
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
    // TODO: clarify if adding duplicates is an issue

    for (const consumedApi of service.consumedAPIs) {
      for (const apiProvider of consumedApi.providedBy) {
        const nodeDefinition: EdgeDefinition = {
          group: 'edges',
          data: {
            type: 'api',
            source: this.getServiceIdentifier(service),
            target: this.getServiceIdentifier(apiProvider),
            lineColor: this.options.apiEdgeColorFn(consumedApi),
          },
        };
        this.elementDefinitions.push(nodeDefinition);
      }
    }

    for (const providedApi of service.providedAPIs) {
      for (const apiConsumer of providedApi.consumedBy) {
        const nodeDefinition: EdgeDefinition = {
          group: 'edges',
          data: {
            type: 'api',
            source: this.getServiceIdentifier(apiConsumer),
            target: this.getServiceIdentifier(service),
            lineColor: this.options.apiEdgeColorFn(providedApi),
          },
        };
        this.elementDefinitions.push(nodeDefinition);
      }
    }

    for (const subscribedEvent of service.subscribedEvents) {
      for (const eventPublisher of subscribedEvent.publishedBy) {
        const nodeDefinition: EdgeDefinition = {
          group: 'edges',
          data: {
            type: 'event',
            source: this.getServiceIdentifier(service),
            target: this.getServiceIdentifier(eventPublisher),
            lineColor: this.options.eventEdgeColorFn(subscribedEvent),
          },
        };
        this.elementDefinitions.push(nodeDefinition);
      }
    }

    for (const publishedEvent of service.publishedEvents) {
      for (const eventSubscriber of publishedEvent.subscribedBy) {
        const nodeDefinition: EdgeDefinition = {
          group: 'edges',
          data: {
            type: 'event',
            source: this.getServiceIdentifier(eventSubscriber),
            target: this.getServiceIdentifier(service),
            lineColor: this.options.eventEdgeColorFn(publishedEvent),
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
    // TODO: add aggregated dependencies
  }

  private doAddGroup(group: RegularGroupNode): void {
    const nodeDefinition: NodeDefinition = {
      group: 'nodes',
      data: {
        id: group.identifier,
        label: group.name,
        backgroundColor: this.options.groupBackgroundColorFn(group),
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
