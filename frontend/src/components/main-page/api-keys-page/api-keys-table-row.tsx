import { Button, TableCell, TableRow } from '@mui/material';
import { GetApiKeyResponseDto } from 'msadoc-client';
import React from 'react';

import { ApiKeyDeletionDialog } from './api-key-deletion-dialog';

interface Props {
  apiKey: GetApiKeyResponseDto;

  reloadTable: () => void;
}
export const ApiKeysTableRow: React.FC<Props> = (props) => {
  const controller = useController(props);

  return (
    <React.Fragment>
      <TableRow>
        <TableCell>{props.apiKey.keyName}</TableCell>
        <TableCell>{controller.formattedCreationTimeStamp}</TableCell>
        <TableCell>
          <Button
            variant="contained"
            color="error"
            onClick={(): void => controller.setShowApiKeyDeletionDialog(true)}
          >
            Delete
          </Button>
        </TableCell>
      </TableRow>

      {controller.state.showApiKeyDeletionDialog && (
        <ApiKeyDeletionDialog
          apiKey={props.apiKey}
          close={(): void => controller.setShowApiKeyDeletionDialog(false)}
          afterDeleteApiKey={(): void => {
            controller.setShowApiKeyDeletionDialog(false);
            props.reloadTable();
          }}
        />
      )}
    </React.Fragment>
  );
};

interface State {
  showApiKeyDeletionDialog: boolean;
}
interface Controller {
  state: State;

  setShowApiKeyDeletionDialog: (show: boolean) => void;

  formattedCreationTimeStamp: string;
}
function useController(props: Props): Controller {
  const [state, setState] = React.useState<State>({
    showApiKeyDeletionDialog: false,
  });

  const formattedCreationTimeStamp = React.useMemo(() => {
    const date = new Date(props.apiKey.creationTimestamp);

    return date.toLocaleString();
  }, [props.apiKey.creationTimestamp]);

  return {
    state: state,

    setShowApiKeyDeletionDialog: (show): void => {
      setState((state) => ({ ...state, showApiKeyDeletionDialog: show }));
    },

    formattedCreationTimeStamp: formattedCreationTimeStamp,
  };
}
