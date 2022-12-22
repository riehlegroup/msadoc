import {
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import React from 'react';
import { useNavigate } from 'react-router-dom';

import { Icons } from '../../../../icons';
import { GROUPS_TREE_ROUTES_ABS } from '../../../../routes';
import {
  RegularGroupNode,
  RootGroupNode,
  ServiceDocsTreeNodeType,
  ServiceNode,
} from '../../service-docs-tree';
import { useSelectedTreeItem } from '../../utils/router-utils';
import {
  sortGroupsByName,
  sortServicesByName,
} from '../../utils/service-docs-tree-utils';

import { GroupItem } from './group-item';
import { ServiceItem } from './service-item';

interface Props {
  rootGroup: RootGroupNode;
}
export const RootItem: React.FC<Props> = (props) => {
  const controller = useController(props);

  return (
    <React.Fragment>
      <ListItemButton
        ref={controller.buttonRef}
        sx={{
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
        onClick={(): void => controller.navigateToRoot()}
      >
        <ListItemIcon sx={{ color: 'inherit' }}>
          <Icons.DatasetOutlined />
        </ListItemIcon>
        <ListItemText primary="Root" />
      </ListItemButton>

      <React.Fragment>
        <List component="div" disablePadding>
          {controller.sortedChildGroups.map((childGroup) => (
            <GroupItem
              key={childGroup.identifier}
              group={childGroup}
              depth={1}
            />
          ))}
        </List>

        <List component="div" disablePadding>
          {controller.sortedServices.map((service) => (
            <ServiceItem key={service.name} service={service} depth={1} />
          ))}
        </List>
      </React.Fragment>
    </React.Fragment>
  );
};

interface Controller {
  isSelected: boolean;

  buttonRef: React.RefObject<HTMLDivElement>;

  sortedChildGroups: RegularGroupNode[];
  sortedServices: ServiceNode[];

  navigateToRoot: () => void;
}
function useController(props: Props): Controller {
  const navigate = useNavigate();
  const selectedTreeItem = useSelectedTreeItem();

  const buttonRef = React.useRef<HTMLDivElement>(null);

  const isSelected = ((): boolean => {
    if (
      !selectedTreeItem ||
      selectedTreeItem.type !== ServiceDocsTreeNodeType.RootGroup
    ) {
      return false;
    }
    return true;
  })();

  // Whenever the item gets selected, scroll it into our viewport.
  React.useEffect(() => {
    if (!isSelected || !buttonRef.current) {
      return;
    }

    buttonRef.current.scrollIntoView({ block: 'nearest' });
  }, [isSelected]);

  const sortedChildGroups = React.useMemo((): RegularGroupNode[] => {
    return sortGroupsByName(Object.values(props.rootGroup.childGroups));
  }, [props.rootGroup.childGroups]);

  const sortedServices = React.useMemo((): ServiceNode[] => {
    return sortServicesByName(props.rootGroup.services);
  }, [props.rootGroup.services]);

  return {
    isSelected: isSelected,

    buttonRef: buttonRef,

    sortedChildGroups: sortedChildGroups,
    sortedServices: sortedServices,

    navigateToRoot: (): void => {
      navigate(GROUPS_TREE_ROUTES_ABS.root);
    },
  };
}
