import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GetServiceDocResponse } from './service-doc.dto';
import { ServiceDocOrm } from './service-doc.orm';

function fromOrm(entity: ServiceDocOrm): ServiceDocModel {
  // currently models are the same
  return {
    name: entity.name,
    tags: entity.tags ?? undefined,
    repository: entity.repository ?? undefined,
    taskBoard: entity.taskBoard ?? undefined,
    consumedAPIs: entity.consumedAPIs ?? undefined,
    providedAPIs: entity.providedAPIs ?? undefined,
    consumedEvents: entity.consumedEvents ?? undefined,
    producedEvents: entity.producedEvents ?? undefined,
    developmentDocumentation: entity.developmentDocumentation ?? undefined,
    deploymentDocumentation: entity.deploymentDocumentation ?? undefined,
    apiDocumentation: entity.apiDocumentation ?? undefined,
    responsibles: entity.responsibles ?? undefined,
    responsibleTeam: entity.responsibleTeam ?? undefined,
    creationTimestamp: entity.creationTimestamp ?? undefined,
    updateTimestamp: entity.updateTimestamp,
  };
}

function toOrm(
  model: ServiceDocModelWithoutTimestamps,
): Omit<ServiceDocOrm, 'creationTimestamp' | 'updateTimestamp'> {
  return {
    name: model.name,
    tags: model.tags ?? null,
    repository: model.repository ?? null,
    taskBoard: model.taskBoard ?? null,
    consumedAPIs: model.consumedAPIs ?? null,
    providedAPIs: model.providedAPIs ?? null,
    consumedEvents: model.consumedEvents ?? null,
    producedEvents: model.producedEvents ?? null,
    developmentDocumentation: model.developmentDocumentation ?? null,
    deploymentDocumentation: model.deploymentDocumentation ?? null,
    apiDocumentation: model.apiDocumentation ?? null,
    responsibles: model.responsibles ?? null,
    responsibleTeam: model.responsibleTeam ?? null,
  };
}

export type ServiceDocModel = GetServiceDocResponse;
export type ServiceDocModelWithoutTimestamps = Omit<
  ServiceDocModel,
  'creationTimestamp' | 'updateTimestamp'
>;

@Injectable()
export class ServiceDocsService {
  constructor(
    @InjectRepository(ServiceDocOrm)
    private repository: Repository<ServiceDocOrm>,
  ) {}

  async create(
    doc: ServiceDocModelWithoutTimestamps,
  ): Promise<ServiceDocModel> {
    const docOrm = toOrm(doc);
    await this.repository.save(docOrm);
    return this.getByName(doc.name); // otherwise not all timestamps might be returned
  }

  async getAll(): Promise<ServiceDocModel[]> {
    const allEntities = await this.repository.find();
    return allEntities.map((x) => fromOrm(x));
  }

  async getByName(serviceName: string): Promise<ServiceDocModel> {
    const results = await this.repository.findBy({ name: serviceName });
    if (results.length === 0) {
      throw new NotFoundException(
        `Could not find ServiceDoc with name "${serviceName}"`,
      );
    }
    return fromOrm(results[0]);
  }

  async delete(serviceName: string): Promise<ServiceDocModel> {
    const toBeDeleted = await this.getByName(serviceName);
    await this.repository.delete({ name: serviceName });
    return toBeDeleted;
  }

  async deleteAll(): Promise<void> {
    await this.repository.delete({});
  }
}
