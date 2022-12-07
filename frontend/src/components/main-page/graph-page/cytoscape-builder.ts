import { EdgeDefinition, ElementDefinition, NodeDefinition } from 'cytoscape';

import {
  APINode,
  EventNode,
  RegularGroupNode,
  RootGroupNode,
  ServiceDocsTreeNodeType,
  ServiceNode,
  getDepthLevel,
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
  depth: number;
  apiEdgeColorFn: (apiNode: APINode) => string;
  eventEdgeColorFn: (eventNode: EventNode) => string;
  serviceBackgroundColorFn: (groupNode: ServiceNode) => string;
  groupBackgroundColorFn: (groupNode: RegularGroupNode) => string;
}

export class CyptoScapeBuilder implements ICyptoScapeBuilder {
  elementDefinitions: ElementDefinition[] = [];

  constructor(private options: CytoScapeBuilderOptions) {}

  fromGroup(group: RootGroupNode): CyptoScapeBuilder {
    for (const childGroup of Object.values(group.childGroups)) {
      this.addGroup(childGroup);
    }
    for (const childService of Object.values(group.services)) {
      this.addService(childService);
    }
    return this;
  }

  private addService(service: ServiceNode): void {
    this.doAddService(service);
    this.addServiceDependencies(service);
  }

  private doAddService(service: ServiceNode): void {
    if (getDepthLevel(service) > this.options.depth) {
      return;
    }

    const nodeDefinition: ServiceNodeDefinition = {
      group: 'nodes',
      data: {
        type: 'service',
        id: this.getIdentifier(service),
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

  private getIdentifier(node: ServiceNode | RegularGroupNode): string {
    if (node.type === ServiceDocsTreeNodeType.RegularGroup) {
      return node.identifier;
    }

    return `${
      node.group.type === ServiceDocsTreeNodeType.RegularGroup
        ? node.group.identifier
        : '#/'
    }/${node.name}`;
  }

  private addServiceDependencies(service: ServiceNode): void {
    this.doAddProvidingApiDependencies(service);
    this.doAddConsumingApiDependencies(service);
    this.doAddPublishingEventDependencies(service);
    this.doAddSubscribingEventDependencies(service);
  }

  private doAddProvidingApiDependencies(service: ServiceNode): void {
    for (const providedApi of service.providedAPIs) {
      for (const apiConsumer of providedApi.consumedBy) {
        const source = this.determineEdgeConnectorNodeByDepth(apiConsumer);
        const target = this.determineEdgeConnectorNodeByDepth(service);
        const edgeColor = this.options.apiEdgeColorFn(providedApi);

        const nodeDefinition: ApiEdgeDefinition = this.doCreateEdgeDefinition(
          'api',
          source,
          target,
          edgeColor,
        );
        this.elementDefinitions.push(nodeDefinition);
      }
    }
  }

  private doAddConsumingApiDependencies(service: ServiceNode): void {
    for (const consumedApi of service.consumedAPIs) {
      for (const apiProvider of consumedApi.providedBy) {
        const source = this.determineEdgeConnectorNodeByDepth(service);
        const target = this.determineEdgeConnectorNodeByDepth(apiProvider);
        const edgeColor = this.options.apiEdgeColorFn(consumedApi);

        const nodeDefinition: ApiEdgeDefinition = this.doCreateEdgeDefinition(
          'api',
          source,
          target,
          edgeColor,
        );
        this.elementDefinitions.push(nodeDefinition);
      }
    }
  }

  private doAddSubscribingEventDependencies(service: ServiceNode): void {
    for (const subscribedEvent of service.subscribedEvents) {
      for (const eventPublisher of subscribedEvent.publishedBy) {
        const source = this.determineEdgeConnectorNodeByDepth(service);
        const target = this.determineEdgeConnectorNodeByDepth(eventPublisher);
        const edgeColor = this.options.eventEdgeColorFn(subscribedEvent);

        const nodeDefinition: EventEdgeDefinition = this.doCreateEdgeDefinition(
          'event',
          source,
          target,
          edgeColor,
        );
        this.elementDefinitions.push(nodeDefinition);
      }
    }
  }

  private doAddPublishingEventDependencies(service: ServiceNode): void {
    for (const publishedEvent of service.publishedEvents) {
      for (const eventSubscriber of publishedEvent.subscribedBy) {
        const source = this.determineEdgeConnectorNodeByDepth(eventSubscriber);
        const target = this.determineEdgeConnectorNodeByDepth(service);
        const edgeColor = this.options.eventEdgeColorFn(publishedEvent);

        const nodeDefinition: EventEdgeDefinition = this.doCreateEdgeDefinition(
          'event',
          source,
          target,
          edgeColor,
        );
        this.elementDefinitions.push(nodeDefinition);
      }
    }
  }

  private determineEdgeConnectorNodeByDepth(
    node: ServiceNode | RegularGroupNode,
  ): ServiceNode | RegularGroupNode {
    const depthLevel = getDepthLevel(node);
    if (depthLevel <= this.options.depth) {
      return node;
    }

    if (node.type === ServiceDocsTreeNodeType.Service) {
      if (node.group.type === ServiceDocsTreeNodeType.RootGroup) {
        throw new Error(
          `Could not determine edge connector for node with identifier ${this.getIdentifier(
            node,
          )}`,
        );
      }
      return this.determineEdgeConnectorNodeByDepth(node.group);
    }

    if (node.parent.type === ServiceDocsTreeNodeType.RootGroup) {
      throw new Error(
        `Could not determine edge connector for node with identifier ${this.getIdentifier(
          node,
        )}`,
      );
    }
    return this.determineEdgeConnectorNodeByDepth(node.parent);
  }

  private doCreateEdgeDefinition<Type extends 'api' | 'event'>(
    dependencyType: Type,
    source: ServiceNode | RegularGroupNode,
    target: ServiceNode | RegularGroupNode,
    edgeColor: string,
  ): MyEdgeDefinition<Type> {
    return {
      group: 'edges',
      data: {
        type: dependencyType,
        source: this.getIdentifier(source),
        target: this.getIdentifier(target),
      },
      style: {
        'line-color': edgeColor,
        'target-arrow-color': edgeColor,
      },
    };
  }

  private addGroup(group: RegularGroupNode): void {
    this.doAddGroup(group);
    for (const childGroup of Object.values(group.childGroups)) {
      this.addGroup(childGroup);
    }
    for (const childService of Object.values(group.services)) {
      this.addService(childService);
    }
  }

  private doAddGroup(group: RegularGroupNode): void {
    if (getDepthLevel(group) > this.options.depth) {
      return;
    }

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
