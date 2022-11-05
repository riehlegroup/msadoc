import { Alert, Box, Chip, Typography } from '@mui/material';
import React from 'react';
import { generatePath, useNavigate } from 'react-router-dom';

import { GROUPS_TREE_ROUTES_ABS } from '../../../../../routes';
import { addMultipleItemsToSet } from '../../../../../utils/set';
import { MainNode, ServiceDocsTreeNodeType } from '../../../service-docs-tree';
import { extractAllServices } from '../../../utils/service-docs-tree-utils';

import { TagDetails } from './tag-details';

interface Props {
  showTagsFor: MainNode;
}
export const Tags: React.FC<Props> = (props) => {
  const controller = useController(props);

  return (
    <React.Fragment>
      <Typography variant="h3">
        {props.showTagsFor.type === ServiceDocsTreeNodeType.Service
          ? 'Tags'
          : 'Aggregated Tags'}
      </Typography>

      <Box sx={{ marginTop: 2 }}>
        {controller.tags.length < 1 && (
          <Alert severity="info">No Tags defined</Alert>
        )}

        {controller.tags.length > 0 && (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
            {controller.tags.map((singleTag) => (
              <Chip
                key={singleTag}
                label={singleTag}
                onClick={(): void =>
                  controller.showTagDialog({ tag: singleTag })
                }
              />
            ))}
          </Box>
        )}
      </Box>

      {controller.state.tagDialogData && (
        <TagDetails
          tag={controller.state.tagDialogData.tag}
          currentServiceOrGroup={props.showTagsFor}
          close={(): void => controller.hideTagDialog()}
          goToService={(serviceName: string): void => {
            controller.hideTagDialog();
            controller.goToService(serviceName);
          }}
        />
      )}
    </React.Fragment>
  );
};

interface TagDialogData {
  tag: string;
}

interface State {
  tagDialogData: TagDialogData | undefined;
}
interface Controller {
  state: State;

  tags: string[];

  showTagDialog: (data: TagDialogData) => void;
  hideTagDialog: () => void;

  goToService: (serviceName: string) => void;
}
function useController(props: Props): Controller {
  const navigate = useNavigate();

  const [state, setState] = React.useState<State>({
    tagDialogData: undefined,
  });

  const tags = React.useMemo((): string[] => {
    const allTags = new Set<string>();
    if (props.showTagsFor.type === ServiceDocsTreeNodeType.Service) {
      addMultipleItemsToSet(props.showTagsFor.tags ?? [], allTags);
    } else {
      const allServices = extractAllServices(props.showTagsFor);
      for (const singleService of allServices) {
        addMultipleItemsToSet(singleService.tags ?? [], allTags);
      }
    }

    const result = Array.from(allTags);
    result.sort((a, b) => {
      return a.localeCompare(b);
    });

    return result;
  }, [props.showTagsFor]);

  return {
    state: state,

    tags: tags,

    showTagDialog: (data): void => {
      setState((state) => ({ ...state, tagDialogData: data }));
    },
    hideTagDialog: (): void => {
      setState((state) => ({ ...state, tagDialogData: undefined }));
    },

    goToService: (serviceName: string): void => {
      navigate(
        generatePath(GROUPS_TREE_ROUTES_ABS.service, {
          service: serviceName,
        }),
      );
    },
  };
}
