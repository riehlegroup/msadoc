import { ListItemButton, ListItemIcon, ListItemText } from '@mui/material';
import React from 'react';
import { useNavigate } from 'react-router-dom';

import { Icons } from '../../../../icons';
import { GROUPS_TREE_ROUTES_ABS } from '../../../../routes';
import { useSelectedTreeItem } from '../../utils/router-utils';
import {
  ServiceDocsRootTreeItem,
  ServiceDocsTreeItemType,
} from '../../utils/service-docs-utils';

import { GroupItem } from './group-item';
import { ServiceItem } from './service-item';

interface Props {
  rootGroup: ServiceDocsRootTreeItem;
}
export const RootItem: React.FC<Props> = (props) => {
  const controller = useController();

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

      {Object.values(props.rootGroup.childGroups).map((childGroup) => (
        <GroupItem key={childGroup.identifier} group={childGroup} depth={1} />
      ))}

      {props.rootGroup.services.map((service) => (
        <ServiceItem key={service.name} service={service} depth={1} />
      ))}
    </React.Fragment>
  );
};

interface Controller {
  isSelected: boolean;

  buttonRef: React.RefObject<HTMLDivElement>;

  navigateToRoot: () => void;
}
function useController(): Controller {
  const navigate = useNavigate();
  const selectedTreeItem = useSelectedTreeItem();

  const buttonRef = React.useRef<HTMLDivElement>(null);

  const isSelected = ((): boolean => {
    if (
      !selectedTreeItem ||
      selectedTreeItem.treeItemType !== ServiceDocsTreeItemType.RootGroup
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

    buttonRef.current.scrollIntoView({ behavior: 'smooth' });
  }, [isSelected]);

  return {
    isSelected: isSelected,

    buttonRef: buttonRef,

    navigateToRoot: (): void => {
      navigate(GROUPS_TREE_ROUTES_ABS.root);
    },
  };
}
