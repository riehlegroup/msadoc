import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GetDeploymentDocResponse } from './deployment-doc.dto';
import { DeploymentDocOrm } from './deployment-doc.orm';

function fromOrm(entity: DeploymentDocOrm): DeploymentDocModel {
  // currently models are the same
  return {
    name: entity.name,
    kubernetesUrl: entity.kubernetesUrl,
    kubernetesUser: entity.kubernetesUser,
    kubernetesPassword: entity.kubernetesPassword,
    kubernetesLabels: entity.kubernetesLabels ?? undefined,
    creationTimestamp: entity.creationTimestamp,
    updateTimestamp: entity.updateTimestamp,
  };
}

function toOrm(
  model: DeploymentDocModelWithoutTimestamps,
): Omit<DeploymentDocOrm, 'creationTimestamp' | 'updateTimestamp'> {
  return {
    name: model.name,
    kubernetesUrl: model.kubernetesUrl,
    kubernetesUser: model.kubernetesUser,
    kubernetesPassword: model.kubernetesPassword,
    kubernetesLabels: model.kubernetesLabels ?? null,
  };
}

export type DeploymentDocModel = GetDeploymentDocResponse;
export type DeploymentDocModelWithoutTimestamps = Omit<
  DeploymentDocModel,
  'creationTimestamp' | 'updateTimestamp'
>;

@Injectable()
export class DeploymentDocsService {
  constructor(
    @InjectRepository(DeploymentDocOrm)
    private repository: Repository<DeploymentDocOrm>,
  ) {}

  async create(
    doc: DeploymentDocModelWithoutTimestamps,
  ): Promise<DeploymentDocModel> {
    const docOrm = toOrm(doc);
    await this.repository.save(docOrm);
    return this.getByName(doc.name); // otherwise not all timestamps might be returned
  }

  async getAll(): Promise<DeploymentDocModel[]> {
    const allEntities = await this.repository.find();
    return allEntities.map((x) => fromOrm(x));
  }

  async getByName(name: string): Promise<DeploymentDocModel> {
    const results = await this.repository.findBy({ name: name });
    if (results.length === 0) {
      throw new NotFoundException(
        `Could not find ServiceDoc with name "${name}"`,
      );
    }
    return fromOrm(results[0]);
  }

  async delete(serviceName: string): Promise<DeploymentDocModel> {
    const toBeDeleted = await this.getByName(serviceName);
    await this.repository.delete({ name: serviceName });
    return toBeDeleted;
  }

  async deleteAll(): Promise<void> {
    await this.repository.delete({});
  }
}
