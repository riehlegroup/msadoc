import { Injectable, InternalServerErrorException } from '@nestjs/common';
import {
  ServiceDocModel,
  ServiceDocsService,
} from '../service-docs/service-docs.service';
import { GetServiceGroupResponse } from './service-group.dto';

export type GroupModel = GetServiceGroupResponse;

@Injectable()
export class ServiceGroupsService {
  constructor(private serviceDocsService: ServiceDocsService) {}

  async getAllGroupsHierarchical(): Promise<GroupModel> {
    const allServiceDocs = await this.serviceDocsService.getAll();

    const hierarchyBuilder = new GroupHierarchyBuilder();
    return hierarchyBuilder.build(allServiceDocs);
  }
}

export class GroupHierarchyBuilder {
  rootGroup: GroupModel = {
    name: 'root',
    groups: [],
    services: [],
  };

  build(serviceDocs: ServiceDocModel[]): GroupModel {
    const groupHandles = this.getAllGroupNames(serviceDocs);
    this.createGroupHierarchy(groupHandles);
    this.addServicesToHierarchy(serviceDocs);
    return this.rootGroup;
  }

  private getAllGroupNames(serviceDocs: ServiceDocModel[]): string[] {
    const allGroupsHandles: string[] = [];
    serviceDocs.map((doc) =>
      doc.group === undefined ? undefined : allGroupsHandles.push(doc.group),
    );
    return allGroupsHandles;
  }

  private createGroupHierarchy(groupHandles: string[]): void {
    for (const groupHandle of groupHandles) {
      this.addGroupsOnPath(groupHandle);
    }
  }

  private addServicesToHierarchy(serviceDocs: ServiceDocModel[]): void {
    for (const serviceDoc of serviceDocs) {
      const groupName = serviceDoc.group;
      if (groupName === undefined) {
        this.rootGroup.services.push(serviceDoc.name);
      } else {
        this.addServiceToHierarchy(groupName, serviceDoc.name);
      }
    }
  }

  private addGroupsOnPath(groupHandle: string): void {
    const pathParts = groupHandle.split('.');
    let currentGroup = this.rootGroup;
    for (let i = 0; i < pathParts.length; ++i) {
      let nextGroup = currentGroup.groups.find((x) => x.name === pathParts[i]);
      if (nextGroup === undefined) {
        nextGroup = {
          name: pathParts[i],
          groups: [],
          services: [],
        };
        currentGroup.groups.push(nextGroup);
      }
      currentGroup = nextGroup;
    }
  }

  private getGroupFromHierarchy(groupHandle: string): GroupModel | undefined {
    const pathParts = groupHandle.split('.');

    let currentGroup: GroupModel | undefined = this.rootGroup;
    for (let i = 0; i < pathParts.length; ++i) {
      currentGroup = currentGroup.groups.find((x) => x.name === pathParts[i]);
      if (currentGroup === undefined) {
        return undefined;
      }
    }
    return currentGroup;
  }

  private addServiceToHierarchy(
    groupHandle: string,
    serviceName: string,
  ): void {
    const group = this.getGroupFromHierarchy(groupHandle);
    if (group === undefined) {
      throw new InternalServerErrorException(
        'Cannot add service to non-existing group',
      );
    }
    group.services.push(serviceName);
  }
}
