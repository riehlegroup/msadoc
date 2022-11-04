import {
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import React from 'react';
import { generatePath, useNavigate } from 'react-router-dom';

import { Icons } from '../../../../icons';
import { GROUPS_TREE_ROUTES_ABS } from '../../../../routes';
import {
  MainNode,
  RegularGroupNode,
  ServiceDocsTreeNodeType,
  ServiceNode,
} from '../../service-docs-tree';
import { useSelectedTreeItem } from '../../utils/router-utils';
import { isGroupXDescendantOfGroupY } from '../../utils/service-docs-tree-utils';

import { ServiceItem } from './service-item';

interface Props {
  group: RegularGroupNode;

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
        ref={controller.buttonRef}
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
          {controller.state.isCollapsed ? (
            <Icons.ChevronRight />
          ) : (
            <Icons.ExpandMore />
          )}
        </ListItemIcon>
        <ListItemText primary={props.group.name} />
      </ListItemButton>

      {!controller.state.isCollapsed && (
        <React.Fragment>
          <List component="div" disablePadding>
            {controller.sortedChildGroups.map((childGroup) => (
              <GroupItem
                key={childGroup.identifier}
                group={childGroup}
                depth={props.depth + 1}
              />
            ))}
          </List>

          <List component="div" disablePadding>
            {controller.sortedServices.map((service) => (
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

  buttonRef: React.RefObject<HTMLDivElement>;

  sortedChildGroups: RegularGroupNode[];
  sortedServices: ServiceNode[];

  navigateToThisGroup: () => void;
  toggleIsCollapsed: () => void;
}
function useController(props: Props): Controller {
  const navigate = useNavigate();
  const selectedTreeItem = useSelectedTreeItem();

  const buttonRef = React.useRef<HTMLDivElement>(null);

  const [state, setState] = React.useState<State>({
    isCollapsed: true,
  });

  const isSelected = ((): boolean => {
    if (
      !selectedTreeItem ||
      selectedTreeItem.type !== ServiceDocsTreeNodeType.RegularGroup
    ) {
      return false;
    }
    if (selectedTreeItem.identifier !== props.group.identifier) {
      return false;
    }
    return true;
  })();

  // Whenever the item gets selected, scroll it into our viewport.
  React.useEffect(() => {
    if (!isSelected || !buttonRef.current) {
      return;
    }

    buttonRef.current.scrollIntoView({ behavior: 'smooth' });
  }, [isSelected]);

  // Automatically un-collapse this group if a child tree item gets selected using the Router.
  React.useEffect(() => {
    if (!selectedTreeItem) {
      return;
    }
    if (!isXDescendantOfY({ x: selectedTreeItem, y: props.group })) {
      return;
    }
    setState((state) => ({ ...state, isCollapsed: false }));
  }, [props.group, selectedTreeItem]);

  const sortedChildGroups = React.useMemo((): RegularGroupNode[] => {
    const result = Object.values(props.group.childGroups);

    sortGroupsInPlace(result);

    return result;
  }, [props.group.childGroups]);

  const sortedServices = React.useMemo((): ServiceNode[] => {
    const result = [...props.group.services];

    sortServicesInPlace(result);

    return result;
  }, [props.group.services]);

  return {
    state: state,

    isSelected: isSelected,

    buttonRef: buttonRef,

    sortedChildGroups: sortedChildGroups,
    sortedServices: sortedServices,

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

/**
 * Is `x` a descendant (i.e. child, or child of child, or ...) of `y`?
 */
function isXDescendantOfY(params: { x: MainNode; y: MainNode }): boolean {
  // The root group cannot be a child of anyone.
  if (params.x.type === ServiceDocsTreeNodeType.RootGroup) {
    return false;
  }

  // A service cannot be the parent of anyone.
  if (params.y.type === ServiceDocsTreeNodeType.Service) {
    return false;
  }

  // The root group is the parent of everyone.
  if (params.y.type === ServiceDocsTreeNodeType.RootGroup) {
    return false;
  }

  if (params.x.type === ServiceDocsTreeNodeType.Service) {
    // A service belonging to the root group is, of course, only the descendant of the root group. But we have already covered the case where y=RootGroup before.
    if (params.x.group.type === ServiceDocsTreeNodeType.RootGroup) {
      return false;
    }

    if (params.x.group === params.y) {
      return true;
    }
    return isGroupXDescendantOfGroupY({
      xGroup: params.x.group,
      yGroup: params.y,
    });
  }

  return isGroupXDescendantOfGroupY({
    xGroup: params.x,
    yGroup: params.y,
  });
}

/**
 * Sort the given Services by their name.
 * This function sorts in-place, i.e. it directly modifies the given array.
 */
function sortServicesInPlace(services: ServiceNode[]): void {
  services.sort((a, b) => {
    return a.name.localeCompare(b.name);
  });
}

/**
 * Sort the given Groups by their name.
 * This function sorts in-place, i.e. it directly modifies the given array.
 */
function sortGroupsInPlace(groups: RegularGroupNode[]): void {
  groups.sort((a, b) => {
    return a.name.localeCompare(b.name);
  });
}
