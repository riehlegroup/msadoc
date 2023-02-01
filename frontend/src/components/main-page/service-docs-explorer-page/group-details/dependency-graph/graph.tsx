import { Box, Button } from '@mui/material';
import { blue, grey, red, yellow } from '@mui/material/colors';
import cytoscape, { ElementDefinition } from 'cytoscape';
import cola from 'cytoscape-cola';
import React from 'react';
import CytoscapeComponent from 'react-cytoscapejs';

import {
  RegularGroupNode,
  RootGroupNode,
  ServiceDocsTreeNodeType,
  getDepth,
} from '../../../service-docs-tree';
import { useServiceDocsServiceContext } from '../../../services/service-docs-service';

import { CytoScapeBuilder, cyStyleSheets } from './cytoscape-builder';
import { DepthSlider } from './depth-slider';

cytoscape.use(cola);

const cyLayout = {
  name: 'cola',
  nodeSpacing: (node: { data: (s: 'name') => string }): number => {
    return node.data('name').length * 5; // Adapt spacing to name length
  },
  fit: false,
  centerGraph: true,
} as cytoscape.LayoutOptions;

export enum GraphMode {
  Card,
  Large,
}
interface Props {
  mode: GraphMode;
}
export const Graph: React.FC<Props> = (props) => {
  const controller = useController(props);

  return (
    <React.Fragment>
      {props.mode === GraphMode.Large && (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'row',
            width: '100%',
          }}
        >
          <DepthSlider
            maxDepth={controller.maxGraphDepth}
            onChange={(newDepth: number): void =>
              controller.setState({ ...controller.state, graphDepth: newDepth })
            }
          />
          <Box
            sx={{
              height: 'auto',
              marginRight: 'auto',
              paddingTop: '1rem',
            }}
          >
            <Button
              variant="contained"
              onClick={(): void => {
                void controller.performDownload();
              }}
            >
              Download PNG
            </Button>
          </Box>
        </Box>
      )}

      <Box
        sx={{
          display: 'flex',
          height: '100%',
        }}
      >
        <CytoscapeComponent
          elements={controller.cyElements}
          layout={cyLayout}
          style={{ width: '100%', height: '100%' }}
          stylesheet={cyStyleSheets}
          cy={(cy): void => {
            controller.onRenderGraph(cy);
          }}
        />
      </Box>
    </React.Fragment>
  );
};

interface State {
  graphDepth: number;

  /**
   * Should the graph be re-layouted on the next render?
   * This is particularly useful when the rendered elements change, e.g. when nodes get removed/added.
   *
   * We use State for this because we want to actually trigger the Cytoscape component to update.
   */
  reLayoutGraphOnNextRender: boolean;
}

interface Controller {
  state: State;
  maxGraphDepth: number;
  cyElements: ElementDefinition[];
  onRenderGraph: (cy: cytoscape.Core) => void;
  setState: (newState: State) => void;
  performDownload: () => Promise<void>;
}
function useController(props: Props): Controller {
  const serviceDocsService = useServiceDocsServiceContext();

  const maxDepth = React.useMemo(
    () => getDepth(serviceDocsService.groupsTree),
    [serviceDocsService.groupsTree],
  );

  const cyRef = React.useRef<cytoscape.Core>();

  const [state, setState] = React.useState<State>({
    graphDepth: maxDepth,
    reLayoutGraphOnNextRender: false,
  });

  const elements = React.useMemo(
    () =>
      new CytoScapeBuilder({
        depth: state.graphDepth,
        serviceBackgroundColorFn: () => red[600],
        groupBackgroundColorFn: getGroupColor,
        apiEdgeColorFn: () => yellow[600],
        eventEdgeColorFn: () => blue[300],
      })
        .fromGroup(serviceDocsService.groupsTree)
        .build(),
    [serviceDocsService.groupsTree, state.graphDepth],
  );

  // Whenever the graph data change, we want to re-layout the graph to prevent nodes from overlapping too much.
  React.useEffect(() => {
    setState((state) => ({ ...state, reLayoutGraphOnNextRender: true }));
  }, [elements]);

  return {
    cyElements: elements,
    maxGraphDepth: maxDepth,
    state: state,
    setState: setState,
    onRenderGraph: (cy): void => {
      cyRef.current = cy;

      if (props.mode === GraphMode.Card) {
        cy.fit();
        cy.userZoomingEnabled(false);
        cy.autoungrabify(true);
        cy.autounselectify(true);
      }

      if (state.reLayoutGraphOnNextRender) {
        setState((state) => ({ ...state, reLayoutGraphOnNextRender: false }));

        // See https://github.com/plotly/react-cytoscapejs/issues/46
        const layout = cy.layout(cyLayout).run();

        layout.one('layoutstop', () => {
          if (props.mode === GraphMode.Card) {
            /*
               In our Card, the graph is sometimes not properly centered/zoomed when nodes got added/removed. 
               Calling `.fit()` when the layouting has finished seems to fix this issue.
            */
            cy.fit();
          }
        });
      }
    },
    performDownload: async (): Promise<void> => {
      if (cyRef.current === undefined) {
        return;
      }
      const pngBlob = await cyRef.current.png({
        output: 'blob-promise',
      });

      const fileName = 'msadoc-dependency-graph.png';
      const downloadLink = document.createElement('a');
      downloadLink.href = URL.createObjectURL(pngBlob);
      downloadLink.download = fileName;
      downloadLink.click();
    },
  };
}

function getGroupColor(group: RegularGroupNode): string {
  let currentGroup: RegularGroupNode | RootGroupNode = group;
  let distanceToRoot = 0;

  while (currentGroup.type !== ServiceDocsTreeNodeType.RootGroup) {
    currentGroup = currentGroup.parent;
    ++distanceToRoot;
  }

  switch (distanceToRoot) {
    case 0:
      return grey[100];
    case 1:
      return grey[200];
    case 2:
      return grey[300];
    case 3:
      return grey[400];
    case 4:
      return grey[500];
    case 5:
      return grey[600];
    case 6:
      return grey[700];
    case 7:
      return grey[800];
    default:
      return grey[900];
  }
}
