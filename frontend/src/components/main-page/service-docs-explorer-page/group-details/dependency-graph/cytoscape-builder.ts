import {
  EdgeDefinition,
  ElementDefinition,
  NodeDefinition,
  Stylesheet,
} from 'cytoscape';

import {
  APINode,
  EventNode,
  RegularGroupNode,
  RootGroupNode,
  ServiceDocsTreeNodeType,
  ServiceNode,
  getDepthLevel,
} from '../../../service-docs-tree';

export interface ICytoScapeBuilder {
  fromGroup(group: RegularGroupNode | RootGroupNode): ICytoScapeBuilder;
  build(): ElementDefinition[];
}

export const cyStyleSheets: Stylesheet[] = [
  {
    selector: 'node',
    style: {
      color: 'black',
      label: 'data(name)',
      'font-size': 20,
      'background-color': 'data(backgroundColor)',
    },
  },
  {
    selector: 'node[type = "group"]',
    style: {
      label: 'data(name)',
      shape: 'rectangle',
      'text-valign': 'top',
      'text-halign': 'center',
      'text-max-width': '100px',
      'text-margin-y': 30,
      'font-weight': 'bold',
      'padding-top': '50px',
    },
  },
  {
    selector: 'edge',
    style: {
      'curve-style': 'bezier',
      'target-arrow-shape': 'triangle',
      'line-color': 'data(lineColor)',
      'target-arrow-color': 'data(targetArrowColor)',
    },
  },
];

interface MyNodeDefinition extends NodeDefinition {
  group: 'nodes';
  data: {
    type: 'service' | 'group';
    id: string;
    name: string;
    parent?: string | undefined;

    backgroundColor: string;
  };
}
type ServiceNodeDefinition = MyNodeDefinition & { data: { type: 'service' } };
type GroupNodeDefinition = MyNodeDefinition & { data: { type: 'group' } };

interface MyEdgeDefinition extends EdgeDefinition {
  group: 'edges';
  data: {
    type: 'api' | 'event';
    source: string;
    target: string;

    lineColor: string;
    targetArrowColor: string;
  };
}

interface CytoScapeBuilderOptions {
  depth: number;
  apiEdgeColorFn: (apiNode: APINode) => string;
  eventEdgeColorFn: (eventNode: EventNode) => string;
  serviceBackgroundColorFn: (groupNode: ServiceNode) => string;
  groupBackgroundColorFn: (groupNode: RegularGroupNode) => string;
}

export class CytoScapeBuilder implements ICytoScapeBuilder {
  elementDefinitions: ElementDefinition[] = [];

  constructor(private options: CytoScapeBuilderOptions) {}

  fromGroup(group: RootGroupNode): CytoScapeBuilder {
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

        backgroundColor: this.options.serviceBackgroundColorFn(service),
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
    this.addProvidingApiDependencies(service);
    this.addConsumingApiDependencies(service);
    this.addPublishingEventDependencies(service);
    this.addSubscribingEventDependencies(service);
  }

  private addProvidingApiDependencies(service: ServiceNode): void {
    for (const providedApi of service.providedAPIs) {
      for (const apiConsumer of providedApi.consumedBy) {
        const source = this.determineEdgeConnectorNodeByDepth(apiConsumer);
        const target = this.determineEdgeConnectorNodeByDepth(service);
        const edgeColor = this.options.apiEdgeColorFn(providedApi);

        this.doAddEdgeDefinition('api', source, target, edgeColor);
      }
    }
  }

  private addConsumingApiDependencies(service: ServiceNode): void {
    for (const consumedApi of service.consumedAPIs) {
      for (const apiProvider of consumedApi.providedBy) {
        const source = this.determineEdgeConnectorNodeByDepth(service);
        const target = this.determineEdgeConnectorNodeByDepth(apiProvider);
        const edgeColor = this.options.apiEdgeColorFn(consumedApi);

        this.doAddEdgeDefinition('api', source, target, edgeColor);
      }
    }
  }

  private addSubscribingEventDependencies(service: ServiceNode): void {
    for (const subscribedEvent of service.subscribedEvents) {
      for (const eventPublisher of subscribedEvent.publishedBy) {
        const source = this.determineEdgeConnectorNodeByDepth(service);
        const target = this.determineEdgeConnectorNodeByDepth(eventPublisher);
        const edgeColor = this.options.eventEdgeColorFn(subscribedEvent);

        this.doAddEdgeDefinition('event', source, target, edgeColor);
      }
    }
  }

  private addPublishingEventDependencies(service: ServiceNode): void {
    for (const publishedEvent of service.publishedEvents) {
      for (const eventSubscriber of publishedEvent.subscribedBy) {
        const source = this.determineEdgeConnectorNodeByDepth(eventSubscriber);
        const target = this.determineEdgeConnectorNodeByDepth(service);
        const edgeColor = this.options.eventEdgeColorFn(publishedEvent);

        this.doAddEdgeDefinition('event', source, target, edgeColor);
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

  private doAddEdgeDefinition<Type extends 'api' | 'event'>(
    dependencyType: Type,
    source: ServiceNode | RegularGroupNode,
    target: ServiceNode | RegularGroupNode,
    edgeColor: string,
  ): void {
    if (source === target) {
      return;
    }

    const edge: MyEdgeDefinition = {
      group: 'edges',
      data: {
        type: dependencyType,
        source: this.getIdentifier(source),
        target: this.getIdentifier(target),

        lineColor: edgeColor,
        targetArrowColor: edgeColor,
      },
    };
    this.elementDefinitions.push(edge);
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
