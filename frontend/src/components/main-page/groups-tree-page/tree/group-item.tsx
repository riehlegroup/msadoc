import { ChevronRight, ExpandMore } from '@mui/icons-material';
import {
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import React from 'react';
import { generatePath, useMatch, useNavigate } from 'react-router-dom';

import { GROUPS_TREE_ROUTES_ABS } from '../../../../routes';
import { ServiceDocsGroup } from '../../utils/service-docs-utils';

import { ServiceItem } from './service-item';

interface Props {
  group: ServiceDocsGroup;

  /**
   * How deep is this item in the tree?
   * This value is especially used to properly indent the item.
   */
  depth: number;
}
export const GroupItem: React.FC<Props> = (props) => {
  const controller = useController(props);

  return (
    <React.Fragment>
      <ListItemButton
        sx={{
          pl: props.depth * 4,
          background: (theme) =>
            controller.isSelected ? theme.palette.primary.main : undefined,
          color: (theme) =>
            controller.isSelected
              ? theme.palette.primary.contrastText
              : undefined,
          '&:hover': {
            background: (theme) =>
              controller.isSelected ? theme.palette.primary.main : undefined,
            color: (theme) =>
              controller.isSelected
                ? theme.palette.primary.contrastText
                : undefined,
          },
        }}
        onClick={(): void => controller.navigateToThisGroup()}
      >
        {/* 
          In the following, we use "align-self: stretch" to improve the UX:
          The area where the user is able to click should be as large as possible so that the user does not accidentally click on the parent element.
        */}
        <ListItemIcon
          sx={{
            display: 'flex',
            alignSelf: 'stretch',
            alignItems: 'center',
            color: 'inherit',
          }}
          onMouseDown={(e): void => {
            // Disable the "ripple effect" on the button.
            e.stopPropagation();
          }}
          onClick={(e): void => {
            e.stopPropagation();
            controller.toggleIsCollapsed();
          }}
        >
          {controller.state.isCollapsed ? <ChevronRight /> : <ExpandMore />}
        </ListItemIcon>
        <ListItemText primary={props.group.name} />
      </ListItemButton>

      {!controller.state.isCollapsed && (
        <React.Fragment>
          <List disablePadding>
            {Object.values(props.group.childGroups).map((childGroup) => (
              <GroupItem
                key={childGroup.identifier}
                group={childGroup}
                depth={props.depth + 1}
              />
            ))}
          </List>

          <List component="div" disablePadding>
            {props.group.services.map((service) => (
              <ServiceItem
                key={service.name}
                service={service}
                depth={props.depth + 1}
              />
            ))}
          </List>
        </React.Fragment>
      )}
    </React.Fragment>
  );
};

interface State {
  isCollapsed: boolean;
}
interface Controller {
  state: State;

  isSelected: boolean;

  navigateToThisGroup: () => void;
  toggleIsCollapsed: () => void;
}
function useController(props: Props): Controller {
  const navigate = useNavigate();
  const routeMatch = useMatch(GROUPS_TREE_ROUTES_ABS.group);

  const [state, setState] = React.useState<State>({
    isCollapsed: true,
  });

  const isSelected = ((): boolean => {
    if (!routeMatch) {
      return false;
    }
    if (routeMatch.params.group !== props.group.identifier) {
      return false;
    }
    return true;
  })();

  return {
    state: state,

    isSelected: isSelected,

    navigateToThisGroup: (): void => {
      navigate(
        generatePath(GROUPS_TREE_ROUTES_ABS.group, {
          group: props.group.identifier,
        }),
      );
    },
    toggleIsCollapsed: (): void => {
      setState((state) => ({ ...state, isCollapsed: !state.isCollapsed }));
    },
  };
}
