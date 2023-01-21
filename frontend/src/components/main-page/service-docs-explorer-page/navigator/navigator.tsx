import { Box, IconButton, Tooltip } from '@mui/material';
import { blue } from '@mui/material/colors';
import React from 'react';

import { Icons } from '../../../../icons';

import { GroupsTree } from './groups-tree';
import { Responsibles } from './responsibles';
import { Teams } from './teams';

enum NavigatorView {
  GroupsTree,
  Responsibles,
  Teams,
}

export const Navigator: React.FC = () => {
  const controller = useController();

  return (
    <Box
      sx={{
        height: '100%',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Box
        sx={{
          flexShrink: 0,
          background: blue[900],
          paddingX: 1,
          paddingY: 0.5,
          display: 'flex',
          gap: 1,
        }}
      >
        <TabButton
          icon={<Icons.AccountTree fontSize="inherit" />}
          title="Groups"
          isActive={controller.state.selectedView === NavigatorView.GroupsTree}
          onClick={(): void =>
            controller.setSelectedView(NavigatorView.GroupsTree)
          }
        />
        <TabButton
          icon={<Icons.Person fontSize="inherit" />}
          title="Responsibles"
          isActive={
            controller.state.selectedView === NavigatorView.Responsibles
          }
          onClick={(): void =>
            controller.setSelectedView(NavigatorView.Responsibles)
          }
        />
        <TabButton
          icon={<Icons.Groups fontSize="inherit" />}
          title="Teams"
          isActive={controller.state.selectedView === NavigatorView.Teams}
          onClick={(): void => controller.setSelectedView(NavigatorView.Teams)}
        />
      </Box>

      <Box sx={{ flexGrow: 1, overflow: 'auto' }}>
        {controller.state.selectedView === NavigatorView.GroupsTree && (
          <GroupsTree />
        )}
        {controller.state.selectedView === NavigatorView.Responsibles && (
          <Responsibles />
        )}
        {controller.state.selectedView === NavigatorView.Teams && <Teams />}
      </Box>
    </Box>
  );
};

interface State {
  selectedView: NavigatorView;
}
interface Controller {
  state: State;

  setSelectedView: (view: NavigatorView) => void;
}
function useController(): Controller {
  const [state, setState] = React.useState<State>({
    selectedView: NavigatorView.GroupsTree,
  });

  return {
    state: state,

    setSelectedView: (view): void => {
      setState((state) => ({ ...state, selectedView: view }));
    },
  };
}

interface TabButtonProps {
  icon: React.ReactElement;
  title: string;
  isActive: boolean;

  onClick: () => void;
}
const TabButton: React.FC<TabButtonProps> = (props) => {
  return (
    <Tooltip title={props.title} placement="top">
      <IconButton
        sx={{
          borderRadius: 2,
          paddingX: 2,
          paddingY: 0.5,
          color: props.isActive ? blue[50] : blue[300],
          background: props.isActive ? blue[600] : 'transparent',
          '&:hover': {
            color: blue[100],
            background: blue[700],
          },
        }}
        size="small"
        onClick={(): void => props.onClick()}
      >
        {props.icon}
      </IconButton>
    </Tooltip>
  );
};
