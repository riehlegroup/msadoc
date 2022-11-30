import { EdgeDefinition, ElementDefinition, NodeDefinition } from 'cytoscape';

import {
  RegularGroupNode,
  RootGroupNode,
  ServiceDocsTreeNodeType,
  ServiceNode,
} from '../../service-docs-tree';

export interface ICyptoScapeBuilder {
  fromGroup(group: RegularGroupNode | RootGroupNode): ICyptoScapeBuilder;
  build(): ElementDefinition[];
}

export class CyptoScapeBuilder implements ICyptoScapeBuilder {
  elementDefinitions: ElementDefinition[] = [];

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
        label: `[Service] ${service.name}`,
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
          data: {
            source: this.getServiceIdentifier(service),
            target: this.getServiceIdentifier(apiProvider),
            label: `[API] ${service.name} consumes API from ${apiProvider.name}: ${consumedApi.name}`,
          },
        };
        this.elementDefinitions.push(nodeDefinition);
      }
    }

    for (const providedApi of service.providedAPIs) {
      for (const apiConsumer of providedApi.consumedBy) {
        const nodeDefinition: EdgeDefinition = {
          data: {
            source: this.getServiceIdentifier(apiConsumer),
            target: this.getServiceIdentifier(service),
            label: `[API] ${service.name} provides API to ${apiConsumer.name}: ${providedApi.name}`,
          },
        };
        this.elementDefinitions.push(nodeDefinition);
      }
    }

    for (const subscribedEvent of service.subscribedEvents) {
      for (const eventPublisher of subscribedEvent.publishedBy) {
        const nodeDefinition: EdgeDefinition = {
          data: {
            source: this.getServiceIdentifier(service),
            target: this.getServiceIdentifier(eventPublisher),
            label: `[Event] ${service.name} subscribes to ${eventPublisher.name}: ${subscribedEvent.name}`,
          },
        };
        this.elementDefinitions.push(nodeDefinition);
      }
    }

    for (const publishedEvent of service.publishedEvents) {
      for (const eventSubscriber of publishedEvent.subscribedBy) {
        const nodeDefinition: EdgeDefinition = {
          data: {
            target: this.getServiceIdentifier(service),
            source: this.getServiceIdentifier(eventSubscriber),
            label: `[Event] ${service.name} publishes to ${eventSubscriber.name}: ${publishedEvent.name}`,
          },
        };
        this.elementDefinitions.push(nodeDefinition);
      }
    }
  }

  private addGroup(group: RegularGroupNode): void {
    this.doAddGroup(group);
    // TODO: add aggregated dependencies
  }

  private doAddGroup(group: RegularGroupNode): void {
    const nodeDefinition: NodeDefinition = {
      data: { id: group.identifier, label: `[Group] ${group.name}` },
    };
    this.elementDefinitions.push(nodeDefinition);
  }

  build(): ElementDefinition[] {
    return this.elementDefinitions;
  }
}
