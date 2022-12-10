import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from '@mui/material';
import { GetApiKeyResponseDto } from 'msadoc-client';
import React from 'react';

import { useApiKeysHttpServiceContext } from '../../../services/http/api-keys';
import { useSnackbarServiceContext } from '../../../services/snackbar-service';

enum ViewMode {
  ShowWarningMessage,
  IsDeletingKey,
  ErrorDeletingKey,
}

interface Props {
  apiKey: GetApiKeyResponseDto;

  close: () => void;
  afterDeleteApiKey: () => void;
}
export const ApiKeyDeletionDialog: React.FC<Props> = (props) => {
  const controller = useController(props);

  return (
    <Dialog maxWidth="sm" open fullWidth onClose={(): void => props.close()}>
      {controller.state.viewMode === ViewMode.ShowWarningMessage && (
        <React.Fragment>
          <DialogTitle>Delete API Key</DialogTitle>

          <DialogContent>
            <Alert severity="warning">
              {`Do you really want to delete API Key "${props.apiKey.keyName}"? This action cannot be undone.`}
            </Alert>
          </DialogContent>

          <DialogActions>
            <Button color="inherit" onClick={(): void => props.close()}>
              Close
            </Button>
            <Button
              variant="contained"
              color="error"
              onClick={(): void => void controller.deleteApiKey()}
            >
              Delete Key
            </Button>
          </DialogActions>
        </React.Fragment>
      )}

      {controller.state.viewMode === ViewMode.IsDeletingKey && (
        <DialogContent>
          <CircularProgress
            sx={{ color: (theme) => theme.palette.grey[500] }}
          />
        </DialogContent>
      )}

      {controller.state.viewMode === ViewMode.ErrorDeletingKey && (
        <React.Fragment>
          <DialogContent>
            <Alert severity="error">
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box>An error has occurred while deleting the API key.</Box>

                {/* 
                    Technically, this is not ideal, because it it possible that the key got deleted, but the response did not reach us.
                    In this case, the user will see this message after every click on "try again".
                    However, this is such a rare edge case that we can probably just ignore it for now (especially since the user can close the dialog in other ways).
                  */}
                <Box>
                  <Button
                    variant="contained"
                    color="error"
                    onClick={(): void => void controller.deleteApiKey()}
                  >
                    Try again
                  </Button>
                </Box>
              </Box>
            </Alert>
          </DialogContent>

          <DialogActions>
            <Button color="inherit" onClick={(): void => props.close()}>
              Close
            </Button>
          </DialogActions>
        </React.Fragment>
      )}
    </Dialog>
  );
};

interface State {
  viewMode: ViewMode;
}
interface Controller {
  state: State;

  deleteApiKey: () => Promise<void>;
}
function useController(props: Props): Controller {
  const apiKeysHttpService = useApiKeysHttpServiceContext();
  const snackbarService = useSnackbarServiceContext();

  const [state, setState] = React.useState<State>({
    viewMode: ViewMode.ShowWarningMessage,
  });

  return {
    state: state,

    deleteApiKey: async (): Promise<void> => {
      setState((state) => ({ ...state, viewMode: ViewMode.IsDeletingKey }));

      const keyDeletionResponse = await apiKeysHttpService.deleteSingleApiKey(
        props.apiKey.id,
      );
      if (keyDeletionResponse.status !== 200) {
        setState((state) => ({
          ...state,
          viewMode: ViewMode.ErrorDeletingKey,
        }));
        return;
      }

      snackbarService.showSnackbar(
        `API Key "${props.apiKey.keyName}" has been deleted`,
      );

      props.afterDeleteApiKey();
    },
  };
}
