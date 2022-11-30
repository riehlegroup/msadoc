import React from 'react';
import CytoscapeComponent from 'react-cytoscapejs';

import {
  RegularGroupNode,
  RootGroupNode,
  ServiceDocsTreeNodeType,
} from '../../service-docs-tree';
import { useSelectedTreeItem } from '../../utils/router-utils';

export const DependencyGraph: React.FC = () => {
  const controller = useController();

  const elements = [
    { data: { id: 'one', label: 'Node 1' }, position: { x: 0, y: 0 } },
    { data: { id: 'two', label: 'Node 2' }, position: { x: 100, y: 0 } },
    {
      data: { source: 'one', target: 'two', label: 'Edge from Node1 to Node2' },
    },
  ];

  return (
    <React.Fragment>
      <CytoscapeComponent
        elements={elements}
        style={{ width: '100%', height: '100%' }}
      />
      ;
    </React.Fragment>
  );
};

interface State {
  selectedGroup: RegularGroupNode | RootGroupNode | undefined;
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

  const [state, setState] = React.useState<State>({
    selectedGroup: selectedGroup,
  });

  return {
    state: state,
  };
}
