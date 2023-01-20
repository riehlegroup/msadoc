import React from 'react';
import { generatePath, useNavigate } from 'react-router-dom';

import { Icons } from '../../../../../icons';
import { SERVICE_DOCS_EXPLORER_ROUTES_ABS } from '../../../../../routes';
import {
  ServiceDocsTreeNodeType,
  ServiceNode,
} from '../../../service-docs-tree';
import { useSelectedTreeItem } from '../../../utils/router-utils';

import { NavigatorListItemButton } from './navigator-list-item-button';

interface Props {
  service: ServiceNode;

  indent: number;
}
export const ServiceItem: React.FC<Props> = (props) => {
  const controller = useController(props);

  return (
    <NavigatorListItemButton
      icon={<Icons.CenterFocusStrongOutlined />}
      text={props.service.name}
      indent={props.indent}
      isSelected={controller.isSelected}
      buttonRef={controller.buttonRef}
      onClick={(): void => controller.navigateToThisService()}
    />
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
