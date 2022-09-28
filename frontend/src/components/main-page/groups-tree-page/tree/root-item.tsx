import { DatasetOutlined } from '@mui/icons-material';
import { ListItemButton, ListItemIcon, ListItemText } from '@mui/material';
import React from 'react';
import { useMatch, useNavigate } from 'react-router-dom';

import { GROUPS_TREE_ROUTES_ABS } from '../../../../routes';
import { ServiceDocsRootGroup } from '../../utils/service-docs-utils';

import { GroupItem } from './group-item';
import { ServiceItem } from './service-item';

interface Props {
  rootGroup: ServiceDocsRootGroup;
}
export const RootItem: React.FC<Props> = (props) => {
  const controller = useController();

  return (
    <React.Fragment>
      <ListItemButton
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
          <DatasetOutlined />
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

  navigateToRoot: () => void;
}
function useController(): Controller {
  const navigate = useNavigate();
  const routeMatch = useMatch(GROUPS_TREE_ROUTES_ABS.root);

  const isSelected = ((): boolean => {
    if (!routeMatch) {
      return false;
    }
    return true;
  })();

  return {
    isSelected: isSelected,

    navigateToRoot: (): void => {
      navigate(GROUPS_TREE_ROUTES_ABS.root);
    },
  };
}
