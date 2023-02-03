import { Box, Dialog, Divider, IconButton, Tooltip } from '@mui/material';
import { ResponsiveSankey } from '@nivo/sankey';
import React from 'react';

import { Icons } from '../../../../../../icons';
import { merge } from '../../../../../../utils/merge';
import { MainNode } from '../../../../service-docs-tree';
import { useServiceDocsServiceContext } from '../../../../services/service-docs-service';

import {
  CustomSankeyLink,
  CustomSankeyNode,
  NodePosition,
  SankeyConfig,
  SankeyData,
  buildSankeyData,
} from './sankey-data';
import { SankeyLinkTooltip } from './sankey-link-tooltip';
import { VisualizationConfig } from './visualization-config';

interface Props {
  pivotNode: MainNode;

  close: () => void;
}
export const VisualizationModal: React.FC<Props> = (props) => {
  const controller = useController(props);

  return (
    <Dialog fullScreen open>
      <Box sx={{ height: '100%', overflow: 'hidden', display: 'flex' }}>
        <Box
          sx={{
            width: '300px',
            flexShrink: 0,
            display: 'flex',
            flexDirection: 'column',
            borderRight: (theme) => `1px solid ${theme.palette.grey[300]}`,
          }}
        >
          <Box sx={{ flexShrink: 0 }}>
            <Tooltip title="Close">
              <IconButton onClick={(): void => props.close()}>
                <Icons.Close />
              </IconButton>
            </Tooltip>

            <Divider />
          </Box>

          <Box sx={{ flexGrow: 1, overflowY: 'auto', padding: 2 }}>
            <VisualizationConfig
              sankeyConfig={controller.state.sankeyConfig}
              setSankeyConfig={(newSankeyConfig): void =>
                controller.setSankeyConfig(newSankeyConfig)
              }
            />
          </Box>
        </Box>

        <Box
          sx={{
            height: '100%',
            flexGrow: 1,
            overflowX: 'hidden',
            overflowY: 'auto',
            padding: 3,
          }}
        >
          {controller.sankeyData.nodes.length < 1 && (
            <Box
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                color: (theme) => theme.palette.grey[500],
              }}
            >
              <Box sx={{ fontSize: '3rem' }}>
                <Icons.AnalyticsOutlined fontSize="inherit" />
              </Box>

              <Box>No data to show</Box>
            </Box>
          )}

          {controller.sankeyData.nodes.length > 0 && (
            <Box
              sx={{
                width: '100%',
                /*
                  The diagram might include a lot of nodes.
                  To prevent the nodes from getting too small, we use a heuristic to increase the size of the "canvas".
                */
                height: `max(100%, ${
                  controller.sankeyData.nodes.length * 25
                }px)`,
              }}
            >
              <ResponsiveSankey<CustomSankeyNode, CustomSankeyLink>
                data={controller.sankeyData}
                colors={(node): string => node.customData.color}
                label={(node): string => node.customData.label}
                linkTooltip={SankeyLinkTooltip}
                align={(node, maxDepth): number =>
                  getNodeAlignment(node as SankeyNodeWithDepth, maxDepth)
                }
                enableLinkGradient
              />
            </Box>
          )}
        </Box>
      </Box>
    </Dialog>
  );
};

interface State {
  sankeyConfig: SankeyConfig;
}
interface Controller {
  state: State;

  sankeyData: SankeyData;

  setSankeyConfig: (newConfig: SankeyConfig) => void;
}
function useController(props: Props): Controller {
  const serviceDocsService = useServiceDocsServiceContext();

  const [state, setState] = React.useState<State>({
    sankeyConfig: {
      pivotNode: props.pivotNode,

      includeAPIs: true,
      includeEvents: true,

      includeUnrelatedEntries: true,
    },
  });

  const sankeyData = React.useMemo(
    () => buildSankeyData(serviceDocsService.groupsTree, state.sankeyConfig),
    [serviceDocsService.groupsTree, state.sankeyConfig],
  );

  return {
    state: state,

    sankeyData: sankeyData,

    setSankeyConfig: (newConfig): void => {
      setState((state) => merge(state, { sankeyConfig: newConfig }));
    },
  };
}

interface SankeyNodeWithDepth extends CustomSankeyNode {
  depth: number;
}
function getNodeAlignment(node: SankeyNodeWithDepth, maxDepth: number): number {
  // Important: It is possible that the diagram has less than 3 columns (e.g. if there are no source nodes). This makes it hard to determine where a particular node shall be positioned. To solve this issue for now, we simply use the node depth. This is probably not ideal (it could produce unexpected alignments). However, this should be fine for now given that most of our diagrams contain enough data to produce 3-column layouts. Also, please note that, for some reason, the total depth (i.e. maxDepth) is defined as "one plus the maximum node.depth". So we know that, for instance, maxDepth===2 means that we have 2 columns.

  if (maxDepth < 3) {
    return node.depth;
  }

  switch (node.customData.position) {
    case NodePosition.Left:
      return 0;
    case NodePosition.Middle:
      return 1;
    case NodePosition.Right:
      return 2;
  }
}
