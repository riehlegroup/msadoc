import { Divider, IconButton, Popover, Tooltip } from '@mui/material';
import { Box } from '@mui/system';
import React from 'react';

import { Icons } from '../../../../../icons';
import {
  RegularGroupNode,
  ServiceDocsTreeNodeType,
  ServiceNode,
  getGroupByIdentifier,
} from '../../../service-docs-tree';
import {
  ServiceDocsService,
  useServiceDocsServiceContext,
} from '../../../services/service-docs-service';

import {
  GROUP_PREFIX,
  MyEdgeData,
  NodeIdentifier,
  SERVICE_PREFIX,
} from './cytoscape-builder';

interface Props {
  edge: MyEdgeData;
  /**
   * The mouse event (e.g. click event) that triggered this Popover.
   */
  event: MouseEvent;

  close: () => void;
}
export const EdgeDetailsPopover: React.FC<Props> = (props) => {
  const controller = useController(props);

  return (
    <React.Fragment>
      {controller.sourceAndTargetNode && (
        <Popover
          anchorReference="anchorPosition"
          anchorPosition={{
            top: props.event.clientY,
            left: props.event.clientX,
          }}
          open
          onClose={(): void => props.close()}
        >
          <Box sx={{ display: 'flex', justifyContent: 'end' }}>
            <Box>
              <Tooltip title="Close">
                <IconButton onClick={(): void => props.close()}>
                  <Icons.Close />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>

          <Divider />

          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              paddingX: 4,
              paddingY: 2,
            }}
          >
            <Box>
              {controller.sourceAndTargetNode.sourceNode.type ===
              ServiceDocsTreeNodeType.RegularGroup
                ? controller.sourceAndTargetNode.sourceNode.identifier
                : controller.sourceAndTargetNode.sourceNode.name}
            </Box>

            <Box>
              {/* By default, the icon does not get perfectly centered. This can be fixed using display:block. */}
              <Icons.ArrowForward sx={{ display: 'block' }} />
            </Box>

            <Box>
              {controller.sourceAndTargetNode.targetNode.type ===
              ServiceDocsTreeNodeType.RegularGroup
                ? controller.sourceAndTargetNode.targetNode.identifier
                : controller.sourceAndTargetNode.targetNode.name}
            </Box>
          </Box>
        </Popover>
      )}
    </React.Fragment>
  );
};

interface SourceAndTargetNode {
  sourceNode: RegularGroupNode | ServiceNode;
  targetNode: RegularGroupNode | ServiceNode;
}

interface Controller {
  sourceAndTargetNode: SourceAndTargetNode | undefined;
}
function useController(props: Props): Controller {
  const serviceDocsService = useServiceDocsServiceContext();

  const sourceAndTargetNode = React.useMemo(():
    | SourceAndTargetNode
    | undefined => {
    const parsedSourceIdentifier = parseNodeIdentifier(props.edge.source);
    const parsedTargetIdentifier = parseNodeIdentifier(props.edge.target);

    const sourceNode = findNode(parsedSourceIdentifier, serviceDocsService);
    const targetNode = findNode(parsedTargetIdentifier, serviceDocsService);

    if (!sourceNode || !targetNode) {
      return undefined;
    }

    return {
      sourceNode: sourceNode,
      targetNode: targetNode,
    };
  }, [props.edge.source, props.edge.target, serviceDocsService]);

  return {
    sourceAndTargetNode: sourceAndTargetNode,
  };
}

interface ParsedNodeIdentifier {
  type: 'service' | 'group';
  actualIdentifier: string;
}
function parseNodeIdentifier(
  nodeIdentifier: NodeIdentifier,
): ParsedNodeIdentifier {
  if (nodeIdentifier.startsWith(SERVICE_PREFIX)) {
    // This only replaces the first occurrence of the string.
    const actualIdentifier = nodeIdentifier.replace(SERVICE_PREFIX, '');

    return {
      type: 'service',
      actualIdentifier: actualIdentifier,
    };
  }

  if (nodeIdentifier.startsWith(GROUP_PREFIX)) {
    // This only replaces the first occurrence of the string.
    const actualIdentifier = nodeIdentifier.replace(GROUP_PREFIX, '');

    return {
      type: 'group',
      actualIdentifier: actualIdentifier,
    };
  }

  throw Error(
    `Tried to parse an invalid identifier. This should not happen. The identifier: "${nodeIdentifier}"`,
  );
}

function findNode(
  nodeIdentifier: ParsedNodeIdentifier,
  serviceDocsService: ServiceDocsService,
): RegularGroupNode | ServiceNode | undefined {
  if (nodeIdentifier.type === 'service') {
    return serviceDocsService.serviceDocs.find(
      (item) => item.name === nodeIdentifier.actualIdentifier,
    );
  }
  return getGroupByIdentifier(
    nodeIdentifier.actualIdentifier,
    serviceDocsService.groupsTree,
  );
}
