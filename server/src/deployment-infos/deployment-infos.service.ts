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

    return {
      pods: await this.getPods(k8sApi, deploymentDoc.kubernetesLabels),
      deployments: [],
      endponts: [],
      services: [],
    };
  }

  private connect(deploymentDoc: DeploymentDocModel): k8s.CoreV1Api {
    const cluster: k8s.Cluster = {
      name: `${deploymentDoc.name}-cluster`,
      server: deploymentDoc.kubernetesUrl,
      skipTLSVerify: deploymentDoc.kubernetesSkipTlsVerify ?? false,
      caData: deploymentDoc.kubernetesCa,
    };

    const user: k8s.User = {
      name: deploymentDoc.kubernetesUser,
      password: deploymentDoc.kubernetesPassword,
      certData: deploymentDoc.kubernetesUserCert,
      keyData: deploymentDoc.kubernetesUserKey,
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

  private async getPods(
    k8sApi: k8s.CoreV1Api,
    labels?: string[],
  ): Promise<PodInfo[]> {
    const pods = await k8sApi.listPodForAllNamespaces(
      undefined,
      undefined,
      undefined,
      labels?.join(','),
    );
    return pods.body.items.map((pod) => {
      const readyContainerCount = pod.status?.containerStatuses?.filter(
        (x) => x.ready === true,
      ).length;
      const allContainerCount = pod.status?.containerStatuses?.length;

      const creationTimestamp = pod.metadata?.creationTimestamp;

      return {
        namespace: pod.metadata?.namespace,
        name: pod.metadata?.name,
        status: pod.status?.phase,
        ready: `${readyContainerCount ?? '?'}/${allContainerCount ?? '?'}`,
        age:
          creationTimestamp === undefined
            ? undefined
            : this.calculateTimespanString(creationTimestamp, new Date()),
      };
    });
  }

  private calculateTimespanString(before: Date, after: Date): string {
    let diffMs = after.getTime() - before.getTime();

    const msInSecondsFactor = 1000;
    const msInMinutesFactor = 60 * msInSecondsFactor;
    const msInHoursFactor = 60 * msInMinutesFactor;
    const msInDaysFactor = 24 * msInHoursFactor;

    const days = Math.floor(diffMs / msInDaysFactor);
    diffMs = diffMs - days * msInDaysFactor;
    if (days > 0) {
      return `${days}d`;
    }

    const hours = Math.floor(diffMs / msInHoursFactor);
    diffMs = diffMs - hours * msInHoursFactor;
    if (hours > 0) {
      return `${hours}h`;
    }

    const minutes = Math.floor(diffMs / msInMinutesFactor);
    diffMs = diffMs - minutes * msInMinutesFactor;
    if (minutes > 0) {
      return `${minutes}m`;
    }

    const seconds = Math.floor(diffMs / msInSecondsFactor);
    diffMs = diffMs - seconds * msInSecondsFactor;
    return `${seconds}s`;
  }
}

interface PodInfo {
  namespace?: string;
  name?: string;
  status?: string;
  ready?: string;
  age?: string;
}
