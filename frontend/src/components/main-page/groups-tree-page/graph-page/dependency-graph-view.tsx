import { blue, green, grey, orange, red, yellow } from '@mui/material/colors';
import cytoscape, { ElementDefinition, Stylesheet } from 'cytoscape';
import cola from 'cytoscape-cola';
import React from 'react';
import CytoscapeComponent from 'react-cytoscapejs';

import {
  RegularGroupNode,
  RootGroupNode,
  ServiceDocsTreeNodeType,
} from '../../service-docs-tree';
import { useSelectedTreeItem } from '../../utils/router-utils';

import { CyptoScapeBuilder } from './cytoscape-builder';

export const DependencyGraph: React.FC = () => {
  const controller = useController();

  cytoscape.use(cola);
  const layout = {
    name: 'cola',
    nodeSpacing: (node: { data: (s: 'label') => string }): number => {
      return node.data('label').length * 5; // Adapt spacing to name length
    },
  };

  const styleSheets: Stylesheet[] = [
    {
      selector: 'node',
      style: {
        color: 'black',
        'background-color': 'data(backgroundColor)',
        label: 'data(label)',
        'font-size': 20,
      },
    },
    {
      selector: 'node:parent',
      style: {
        label: 'data(label)',
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
        'line-color': 'data(lineColor)',
        'curve-style': 'bezier',
        'target-arrow-shape': 'triangle',
        'target-arrow-color': 'data(lineColor)',
      },
    },
  ];

  return (
    <React.Fragment>
      <CytoscapeComponent
        elements={controller.state.cytoScapeElements}
        layout={layout}
        style={{ width: '100%', height: '100%' }}
        stylesheet={styleSheets}
      />
      ;
    </React.Fragment>
  );
};

interface State {
  selectedGroup: RegularGroupNode | RootGroupNode | undefined;
  cytoScapeElements: ElementDefinition[];
}
interface Controller {
  state: State;
}
function useController(): Controller {
  const selectedTreeItem = useSelectedTreeItem();

  let selectedGroup: RegularGroupNode | RootGroupNode | undefined = undefined;
  if (
    selectedTreeItem &&
    (selectedTreeItem.type === ServiceDocsTreeNodeType.RootGroup ||
      selectedTreeItem.type === ServiceDocsTreeNodeType.RegularGroup)
  ) {
    selectedGroup = selectedTreeItem;
  }

  let elements: ElementDefinition[] = [];
  if (selectedGroup !== undefined) {
    elements = new CyptoScapeBuilder({
      serviceBackgroundColorFn: () => red[600],
      groupBackgroundColorFn: getGroupColor,
      apiEdgeColorFn: () => yellow[600],
      eventEdgeColorFn: () => blue[300],
    })
      .fromGroup(selectedGroup)
      .build();
  }

  const [state, setState] = React.useState<State>({
    selectedGroup: selectedGroup,
    cytoScapeElements: elements,
  });

  return {
    state: state,
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
