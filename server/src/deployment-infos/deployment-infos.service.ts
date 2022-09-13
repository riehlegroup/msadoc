import { Injectable } from '@nestjs/common';
import { DeploymentDocModel } from '../deployment-docs/deployment-docs.service';

import * as k8s from '@kubernetes/client-node';
import { GetDeploymentInfoResponse } from './deployment-info.dto';

type DeploymentInfoModel = GetDeploymentInfoResponse;

@Injectable()
export class DeploymentInfosService {
  async getDeploymentInfo(
    deploymentDoc: DeploymentDocModel,
  ): Promise<DeploymentInfoModel> {
    const k8sApi = this.connect(deploymentDoc);

    const pods = await k8sApi.listPodForAllNamespaces(
      undefined,
      undefined,
      undefined,
      deploymentDoc.kubernetesLabels?.join(','),
    );
    return {
      pods: pods.body.items.map((x) => x.kind ?? 'pod'), // @TODO
      deployments: [],
      endponts: [],
      services: [],
    };
  }

  private connect(deploymentDoc: DeploymentDocModel): k8s.CoreV1Api {
    const cluster: k8s.Cluster = {
      name: `${deploymentDoc.name}-cluster`,
      server: deploymentDoc.kubernetesUrl,
      skipTLSVerify: false,
      caData: 'todo', // @TODO
    };

    const user: k8s.User = {
      name: deploymentDoc.kubernetesUser,
      password: deploymentDoc.kubernetesPassword,
      certData: 'todo', // @TODO
      keyData: 'todo', // @TODO
    };

    const context: k8s.Context = {
      name: `${deploymentDoc.name}-${deploymentDoc.kubernetesUser}-context`,
      user: user.name,
      cluster: cluster.name,
    };

    const kc = new k8s.KubeConfig();
    kc.loadFromOptions({
      clusters: [cluster],
      users: [user],
      contexts: [context],
      currentContext: context.name,
    });
    return kc.makeApiClient(k8s.CoreV1Api);
  }
}
