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
    flow: { axis: 'y', minSeparation: 100 },
    nodeSpacing: () => 60,
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
        // Label: 'data(label)',
        'line-color': 'data(lineColor)',
        'curve-style': 'bezier',
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
      serviceBackgroundColorFn: () => '#F71735',
      groupBackgroundColorFn: getGroupColor,
      apiEdgeColorFn: () => '#41EAD4',
      eventEdgeColorFn: () => '#FF9F1C',
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
  const hex = Number.parseInt(`${Math.min(6 + distanceToRoot, 16)}`, 16);
  return '#' + `${hex}`.repeat(6);
}
