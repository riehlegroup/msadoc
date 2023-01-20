import { ListItemButton, ListItemIcon, ListItemText } from '@mui/material';
import React from 'react';
import { generatePath, useNavigate } from 'react-router-dom';

import { Icons } from '../../../../../icons';
import { SERVICE_DOCS_EXPLORER_ROUTES_ABS } from '../../../../../routes';
import {
  ServiceDocsTreeNodeType,
  ServiceNode,
} from '../../../service-docs-tree';
import { useSelectedTreeItem } from '../../../utils/router-utils';

interface Props {
  service: ServiceNode;

  /**
   * How deep is this item in the tree?
   * This value is especially used to properly indent the item.
   */
  depth: number;
}
export const ServiceItem: React.FC<Props> = (props) => {
  const controller = useController(props);

  return (
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
      onClick={(): void => controller.navigateToThisService()}
    >
      <ListItemIcon sx={{ color: 'inherit' }}>
        <Icons.CenterFocusStrongOutlined />
      </ListItemIcon>
      <ListItemText primary={props.service.name} />
    </ListItemButton>
  );
};

interface Controller {
  isSelected: boolean;

  buttonRef: React.RefObject<HTMLDivElement>;

  navigateToThisService: () => void;
}
function useController(props: Props): Controller {
  const navigate = useNavigate();
  const selectedTreeItem = useSelectedTreeItem();

  const buttonRef = React.useRef<HTMLDivElement>(null);

  const isSelected = ((): boolean => {
    if (
      !selectedTreeItem ||
      selectedTreeItem.type !== ServiceDocsTreeNodeType.Service
    ) {
      return false;
    }
    if (selectedTreeItem.name !== props.service.name) {
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

  return {
    isSelected: isSelected,

    buttonRef: buttonRef,

    navigateToThisService: (): void => {
      navigate(
        generatePath(SERVICE_DOCS_EXPLORER_ROUTES_ABS.service, {
          service: props.service.name,
        }),
      );
    },
  };
}
