import {
  ConnectingNode,
  RegularGroupNode,
  RootGroupNode,
  ServiceDocsTreeNodeType,
  ServiceNode,
} from '../../../../service-docs-tree';
import {
  extractAllServices,
  getAllAPIsAndEvents,
  isGroupXDescendantOfGroupY,
} from '../../../../utils/service-docs-tree-utils';

export type RawLink = RawLinkFromServiceOrGroup | RawLinkToServiceOrGroup;

interface RawLinkFromServiceOrGroup {
  type: 'from-service-or-group';
  from: ServiceNode | RegularGroupNode;
  to: ConnectingNode;
}

interface RawLinkToServiceOrGroup {
  type: 'to-service-or-group';
  from: ConnectingNode;
  to: ServiceNode | RegularGroupNode;
}

type BuildConfig = IncludeAllServicesSeparately | BuildAroundGroup;
interface IncludeAllServicesSeparately {
  mode: 'include-all-services-separately';
}
interface BuildAroundGroup {
  mode: 'build-around-group';
  group: RegularGroupNode | RootGroupNode;
}

/**
 * There are two options to build the links, as specified in parameter {@link buildConfig}:
 * - {@link IncludeAllServicesSeparately} makes all services from the provided {@link rootGroup} get listed separately.
 * - {@link BuildAroundGroup} uses the "diagonal relatives" of the provided group to build the links (see {@link getDiagonalRelativesOfGroup}).
 */
export function buildRawLinks(
  rootGroup: RootGroupNode,
  buildConfig: BuildConfig,
): RawLink[] {
  const result: RawLink[] = [];

  let servicesAndGroups: Array<RegularGroupNode | ServiceNode>;
  if (buildConfig.mode === 'build-around-group') {
    servicesAndGroups = getDiagonalRelativesOfGroup(
      buildConfig.group,
      rootGroup,
    );
  } else {
    servicesAndGroups = extractAllServices(rootGroup);
  }

  for (const singleServiceOrGroup of servicesAndGroups) {
    const APIsAndEvents = getAllAPIsAndEvents(singleServiceOrGroup);

    /*
      The "natural" flow of Events if from producer to consumer:
      (SomePublisher) --> (Event) --> (SomeSubscriber)
    */
    for (const publishedEvent of APIsAndEvents.publishedEvents) {
      result.push({
        type: 'from-service-or-group',
        from: singleServiceOrGroup,
        to: publishedEvent,
      });
    }

    for (const subscribedEvent of APIsAndEvents.subscribedEvents) {
      result.push({
        type: 'to-service-or-group',
        from: subscribedEvent,
        to: singleServiceOrGroup,
      });
    }

    /*
      The "natural" flow of APIs is from consumer to provider:
      (SomeConsumer) --> (API) --> (SomeProducer)
    */
    for (const consumedAPI of APIsAndEvents.consumedAPIs) {
      result.push({
        type: 'from-service-or-group',
        from: singleServiceOrGroup,
        to: consumedAPI,
      });
    }

    for (const providedAPI of APIsAndEvents.providedAPIs) {
      result.push({
        type: 'to-service-or-group',
        from: providedAPI,
        to: singleServiceOrGroup,
      });
    }
  }

  return result;
}

/**
 * The "diagonal relatives" (or "diagonal neighbors") of a node are:
 * 1. The direct descendants of this node.
 * 2. The siblings of this node.
 * 3. Siblings of all ancestors of this node.
 *
 * Assume the following tree (for simplicity without distinction between groups and services):
 *
 * ```
 *              Root
 *         /     |       \
 *    A          B           C
 *  / | \      / | \       / | \
 * D  E  F    G  H  I     J  K  L
 * |  |  |    |  |  |     |  |  |
 * M  N  O    P  Q  R     S  T  U
 * ```
 *
 * The diagonal relatives of node A are D, E, F, B, and C.
 * Explanation:
 * - Rule 1 gives us D, E, and F.
 * - Rule 2 gives us B and C.
 * - Rule 3 does not give us any nodes.
 *
 * The diagonal relatives of node D are M, E, F, B, and C.
 * Explanation:
 * - Rule 1 gives us M.
 * - Rule 2 gives us E and F.
 * - Rule 3 gives us B and C.
 *
 *
 * Remarks:
 * - One could see this as having selected nodes A, B, and C, and then having "punched into A so that a dent has been formed". *
 * - We only take inner nodes into account, i.e. the computation is undefined for leaf nodes.
 * - In our Service Docs model, we have groups and services. Here, we say that the siblings of a group node X are all sibling groups of X, as well as all services directly owned by X.
 */
function getDiagonalRelativesOfGroup(
  targetGroup: RegularGroupNode | RootGroupNode,
  rootGroup: RootGroupNode,
): Array<RegularGroupNode | ServiceNode> {
  if (targetGroup.type === ServiceDocsTreeNodeType.RootGroup) {
    return [...Object.values(targetGroup.childGroups), ...targetGroup.services];
  }

  return getDiagonalRelativesOfGroupRec(targetGroup, rootGroup);
}

function getDiagonalRelativesOfGroupRec(
  targetGroup: RegularGroupNode,
  currentlyHandledGroup: RegularGroupNode | RootGroupNode,
): Array<RegularGroupNode | ServiceNode> {
  const result: Array<RegularGroupNode | ServiceNode> = [];

  if (currentlyHandledGroup === targetGroup) {
    result.push(...Object.values(currentlyHandledGroup.childGroups));
    result.push(...currentlyHandledGroup.services);

    return result;
  }

  // Are we currently visiting an ancestor of our target group? Then we want to collect everything "around" the currently visited group, and also visit our child groups.
  if (
    currentlyHandledGroup.type === ServiceDocsTreeNodeType.RootGroup ||
    isGroupXDescendantOfGroupY({
      xGroup: targetGroup,
      yGroup: currentlyHandledGroup,
    })
  ) {
    result.push(...currentlyHandledGroup.services);

    for (const singleChildGroup of Object.values(
      currentlyHandledGroup.childGroups,
    )) {
      const recResult = getDiagonalRelativesOfGroupRec(
        targetGroup,
        singleChildGroup,
      );
      result.push(...recResult);
    }

    return result;
  }

  // Neither visiting our target group, nor an ancestor of it.
  return [currentlyHandledGroup];
}
