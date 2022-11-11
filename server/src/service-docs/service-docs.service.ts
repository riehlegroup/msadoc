import {
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GetServiceDocResponse } from './service-doc.dto';
import { ServiceDocOrm } from './service-doc.orm';

export function fromOrm(entity: ServiceDocOrm): ServiceDocModel {
  const storedExtensions = entity.extensions;
  const extensions: Record<string, ExtensionValueType> = {};
  for (const extensionKey of Object.keys(storedExtensions)) {
    extensions[extensionKey] = storedExtensions[extensionKey];
  }

  return {
    name: entity.name,
    group: entity.group ?? undefined,
    tags: entity.tags ?? undefined,
    repository: entity.repository ?? undefined,
    taskBoard: entity.taskBoard ?? undefined,
    consumedAPIs: entity.consumedAPIs ?? undefined,
    providedAPIs: entity.providedAPIs ?? undefined,
    subscribedEvents: entity.subscribedEvents ?? undefined,
    publishedEvents: entity.publishedEvents ?? undefined,
    developmentDocumentation: entity.developmentDocumentation ?? undefined,
    deploymentDocumentation: entity.deploymentDocumentation ?? undefined,
    apiDocumentation: entity.apiDocumentation ?? undefined,
    responsibles: entity.responsibles ?? undefined,
    responsibleTeam: entity.responsibleTeam ?? undefined,
    creationTimestamp: entity.creationTimestamp ?? undefined,
    updateTimestamp: entity.updateTimestamp,
    ...extensions,
  };
}

export function toOrm(
  model: ServiceDocModelWithoutTimestamps,
): Omit<ServiceDocOrm, 'creationTimestamp' | 'updateTimestamp'> {
  const extensionKeys = Object.keys(model).filter((key) =>
    key.startsWith('x-'),
  );
  const extensions: Record<string, ExtensionValueType> = {};
  for (const extensionKey of extensionKeys) {
    const extensionValue = (model as Record<string, unknown>)[extensionKey];
    if (!isExtensionValueType(extensionValue)) {
      throw new HttpException(
        `Extension field ${extensionKey} is not type string, number or boolean or their array types. Cannot parse!`,
        HttpStatus.BAD_REQUEST,
      );
    }
    extensions[extensionKey] = extensionValue;
  }

  return {
    name: model.name,
    group: model.group ?? null,
    tags: model.tags ?? null,
    repository: model.repository ?? null,
    taskBoard: model.taskBoard ?? null,
    consumedAPIs: model.consumedAPIs ?? null,
    providedAPIs: model.providedAPIs ?? null,
    subscribedEvents: model.subscribedEvents ?? null,
    publishedEvents: model.publishedEvents ?? null,
    developmentDocumentation: model.developmentDocumentation ?? null,
    deploymentDocumentation: model.deploymentDocumentation ?? null,
    apiDocumentation: model.apiDocumentation ?? null,
    responsibles: model.responsibles ?? null,
    responsibleTeam: model.responsibleTeam ?? null,
    extensions: extensions,
  };
}

export type ExtensionValueType =
  | ExtensionPrimitiveValueType
  | ExtensionPrimitiveValueType[];
export type ExtensionPrimitiveValueType = string | number | boolean;

export function isExtensionPrimitiveValueType(
  extensionValue: unknown,
): extensionValue is ExtensionPrimitiveValueType {
  return (
    typeof extensionValue === 'string' ||
    typeof extensionValue === 'number' ||
    typeof extensionValue === 'boolean'
  );
}

export function isExtensionValueType(
  extensionValue: unknown,
): extensionValue is ExtensionValueType {
  if (Array.isArray(extensionValue)) {
    for (const item of extensionValue) {
      if (!isExtensionPrimitiveValueType(item)) {
        return false;
      }
    }
  } else if (!isExtensionPrimitiveValueType(extensionValue)) {
    return false;
  }

  return true;
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
