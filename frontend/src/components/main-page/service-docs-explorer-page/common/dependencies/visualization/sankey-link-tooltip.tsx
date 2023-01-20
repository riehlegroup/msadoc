import { Paper } from '@mui/material';
import { SankeyLinkDatum } from '@nivo/sankey';
import React from 'react';

import {
  RegularGroupNode,
  ServiceDocsTreeNodeType,
  ServiceNode,
} from '../../../../service-docs-tree';
import { isGroupXDescendantOfGroupY } from '../../../../utils/service-docs-tree-utils';

import { CustomSankeyLink, CustomSankeyNode } from './sankey-data';

interface Props {
  link: SankeyLinkDatum<CustomSankeyNode, CustomSankeyLink>;
}
/**
 * The tooltip that is being shown when hovering a link in the Sankey Diagram.
 */
export const SankeyLinkTooltip: React.FC<Props> = (props) => {
  const controller = useController(props);

  return (
    <Paper
      elevation={1}
      sx={{
        background: '#ffffff',
        paddingX: 2,
        paddingY: 1,
        maxWidth: '500px',
      }}
    >
      {controller.tooltipText}
    </Paper>
  );
};

interface Controller {
  tooltipText: string;
}
function useController(props: Props): Controller {
  const tooltipText = ((): string => {
    const sourceNode = props.link.source.customData.correspondingTreeNode;
    const targetNode = props.link.target.customData.correspondingTreeNode;

    // API --> Service
    if (
      sourceNode.type === ServiceDocsTreeNodeType.API &&
      targetNode.type === ServiceDocsTreeNodeType.Service
    ) {
      return `Service "${sourceNode.name}" provides API "${targetNode.name}"`;
    }
    // Service --> API
    if (
      sourceNode.type === ServiceDocsTreeNodeType.Service &&
      targetNode.type === ServiceDocsTreeNodeType.API
    ) {
      return `Service "${sourceNode.name}" consumes API "${targetNode.name}"`;
    }
    // Service --> Event
    if (
      sourceNode.type === ServiceDocsTreeNodeType.Service &&
      targetNode.type === ServiceDocsTreeNodeType.Event
    ) {
      return `Service "${sourceNode.name}" publishes event "${targetNode.name}"`;
    }
    // Event --> Service
    if (
      sourceNode.type === ServiceDocsTreeNodeType.Event &&
      targetNode.type === ServiceDocsTreeNodeType.Service
    ) {
      return `Service "${targetNode.name}" subscribes to event "${sourceNode.name}"`;
    }

    // API --> Group
    if (
      sourceNode.type === ServiceDocsTreeNodeType.API &&
      targetNode.type === ServiceDocsTreeNodeType.RegularGroup
    ) {
      const relatedServices = findServicesRelatedToGroup(
        sourceNode.providedBy,
        targetNode,
      );
      const formattedGroupName = formatGroupNameForTooltip(
        targetNode,
        relatedServices,
      );
      return `Group ${formattedGroupName} provides API "${sourceNode.name}"`;
    }
    // Group --> API
    if (
      sourceNode.type === ServiceDocsTreeNodeType.RegularGroup &&
      targetNode.type === ServiceDocsTreeNodeType.API
    ) {
      const relatedServices = findServicesRelatedToGroup(
        targetNode.consumedBy,
        sourceNode,
      );
      const formattedGroupName = formatGroupNameForTooltip(
        sourceNode,
        relatedServices,
      );
      return `Group ${formattedGroupName} consumes API "${targetNode.name}"`;
    }
    // Group --> Event
    if (
      sourceNode.type === ServiceDocsTreeNodeType.RegularGroup &&
      targetNode.type === ServiceDocsTreeNodeType.Event
    ) {
      const relatedServices = findServicesRelatedToGroup(
        targetNode.publishedBy,
        sourceNode,
      );
      const formattedGroupName = formatGroupNameForTooltip(
        sourceNode,
        relatedServices,
      );
      return `Group ${formattedGroupName} publishes event "${targetNode.name}"`;
    }
    // Event --> Group
    if (
      sourceNode.type === ServiceDocsTreeNodeType.Event &&
      targetNode.type === ServiceDocsTreeNodeType.RegularGroup
    ) {
      const relatedServices = findServicesRelatedToGroup(
        sourceNode.subscribedBy,
        targetNode,
      );
      const formattedGroupName = formatGroupNameForTooltip(
        targetNode,
        relatedServices,
      );
      return `Group ${formattedGroupName} subscribes to event "${sourceNode.name}"`;
    }

    console.warn(
      'Found an unhandled combination of source and target node type',
      props.link,
    );
    // A fallback, which should actually never be returned. We use this to be extra safe in case a new combination of source and target node type gets introduced in the future.
    return `${props.link.source.label} > ${props.link.target.label}`;
  })();

  return {
    tooltipText: tooltipText,
  };
}

/**
 * Build a string like one of the following:
 *
 * ``` txt
 * "some.group.identifier" (service "some-service")
 * "some.group.identifier" (services "some-service" and "another-service")
 * "some.group.identifier" (services "some-service, "another-service" and "yet-another-service")
 * ```
 */
function formatGroupNameForTooltip(
  group: RegularGroupNode,
  relatedServices: ServiceNode[],
): string {
  const serviceNamesWithQuotes: string[] = [];
  for (const singleService of relatedServices) {
    serviceNamesWithQuotes.push(`"${singleService.name}"`);
  }

  if (serviceNamesWithQuotes.length < 1) {
    console.error(
      'Found no services for the given group. This should not happen.',
      group,
    );
    return '';
  }

  let servicesString: string;
  if (serviceNamesWithQuotes.length === 1) {
    servicesString = `service ${serviceNamesWithQuotes[0] ?? ''}`;
  } else {
    const allServicesExceptForLast = serviceNamesWithQuotes.slice(0, -1);
    const lastService = serviceNamesWithQuotes.at(-1) ?? '';

    servicesString = `services ${allServicesExceptForLast.join(
      ',',
    )} and ${lastService}`;
  }

  return `"${group.identifier}" (${servicesString})`;
}

/**
 * From the given array of services, return these services that are related to the provided group (i.e. return the services that either directly belong to the group, or belong to one of the descendants of the provided group).
 */
function findServicesRelatedToGroup(
  services: ServiceNode[],
  group: RegularGroupNode,
): ServiceNode[] {
  return services.filter((singleService) => {
    if (singleService.group.type === ServiceDocsTreeNodeType.RootGroup) {
      return false;
    }
    if (singleService.group === group) {
      return true;
    }
    if (
      isGroupXDescendantOfGroupY({ xGroup: singleService.group, yGroup: group })
    ) {
      return true;
    }

    return false;
  });
}
