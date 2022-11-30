import { ElementDefinition } from 'cytoscape';
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

  const layout = { name: 'breadthfirst' };

  return (
    <React.Fragment>
      <CytoscapeComponent
        elements={controller.state.cytoScapeElements}
        layout={layout}
        style={{ width: '100%', height: '100%' }}
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
    elements = new CyptoScapeBuilder().fromGroup(selectedGroup).build();
  }

  const [state, setState] = React.useState<State>({
    selectedGroup: selectedGroup,
    cytoScapeElements: elements,
  });

  return {
    state: state,
  };
}
