import { Box } from '@mui/material';
import { blue, grey, red, yellow } from '@mui/material/colors';
import cytoscape, { ElementDefinition, Stylesheet } from 'cytoscape';
import cola from 'cytoscape-cola';
import React from 'react';
import CytoscapeComponent from 'react-cytoscapejs';

import {
  RegularGroupNode,
  RootGroupNode,
  ServiceDocsTreeNodeType,
  getDepth,
} from '../service-docs-tree';
import { useServiceDocsServiceContext } from '../services/service-docs-service';

import { CyptoScapeBuilder } from './cytoscape-builder';
import { DepthSlider } from './DepthSlider';

export const DependencyGraph: React.FC = () => {
  const controller = useController();
  console.log(controller.state);
  cytoscape.use(cola);
  const layout = {
    name: 'cola',
    nodeSpacing: (node: { data: (s: 'name') => string }): number => {
      return node.data('name').length * 5; // Adapt spacing to name length
    },
  };

  const styleSheets: Stylesheet[] = [
    {
      selector: 'node',
      style: {
        color: 'black',
        label: 'data(name)',
        'font-size': 20,
      },
    },
    {
      selector: 'node:parent',
      style: {
        label: 'data(name)',
        'text-valign': 'top',
        'text-halign': 'center',
        'text-max-width': '100px',
        'text-margin-y': 30,
        'font-weight': 'bold',
        'padding-top': '50px',
      },
    },
    {
      selector: 'edge',
      style: {
        'curve-style': 'bezier',
        'target-arrow-shape': 'triangle',
      },
    },
  ];

  return (
    <React.Fragment>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'row',
          width: '100%',
        }}
      >
        <DepthSlider
          maxDepth={controller.state.maxGraphDepth}
          onChange={controller.updateGraphDepth}
        />
      </Box>

      <Box
        sx={{
          display: 'flex',
          height: '100%',
        }}
      >
        <CytoscapeComponent
          elements={controller.cytoScapeElements}
          layout={layout}
          style={{ width: '100%', height: '100%' }}
          stylesheet={styleSheets}
        />
      </Box>
    </React.Fragment>
  );
};

interface State {
  graphDepth: number;
  maxGraphDepth: number;
}

interface Controller {
  state: State;
  cytoScapeElements: ElementDefinition[];
  updateGraphDepth: (newDepth: number) => void;
}
function useController(): Controller {
  const serviceDocsService = useServiceDocsServiceContext();

  const maxDepth = getDepth(serviceDocsService.groupsTree);

  const [state, setState] = React.useState<State>({
    graphDepth: maxDepth,
    maxGraphDepth: maxDepth,
  });

  const elements = React.useMemo(
    () =>
      new CyptoScapeBuilder({
        serviceBackgroundColorFn: () => red[600],
        groupBackgroundColorFn: getGroupColor,
        apiEdgeColorFn: () => yellow[600],
        eventEdgeColorFn: () => blue[300],
      })
        .fromGroup(serviceDocsService.groupsTree)
        .build(),
    [serviceDocsService.groupsTree],
  );

  return {
    cytoScapeElements: elements,
    state: state,
    updateGraphDepth: (newDepth: number): void => {
      setState({
        graphDepth: newDepth,
        maxGraphDepth: state.maxGraphDepth,
      });
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
