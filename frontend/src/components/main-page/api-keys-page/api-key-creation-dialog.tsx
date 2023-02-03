import {
  Alert,
  AlertTitle,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TextField,
} from '@mui/material';
import { CreateApiKeyResponseDto } from 'msadoc-client';
import React from 'react';

import { Icons } from '../../../icons';
import { useApiKeysHttpServiceContext } from '../../../services/http/api-keys';
import { useSnackbarServiceContext } from '../../../services/snackbar-service';
import { merge } from '../../../utils/merge';

enum ViewMode {
  AskForKeyName,
  IsCreatingKey,
  ErrorCreatingKey,
  AfterCreateKey,
}

interface Props {
  close: () => void;
  afterCreateApiKey: () => void;
}
export const ApiKeyCreationDialog: React.FC<Props> = (props) => {
  const controller = useController(props);

  return (
    <React.Fragment>
      <Dialog maxWidth="sm" open fullWidth onClose={(): void => props.close()}>
        {controller.state.viewMode === ViewMode.AskForKeyName && (
          <React.Fragment>
            <DialogTitle>Create API Key</DialogTitle>

            <DialogContent>
              <DialogContentText>
                Define a name for your API key so that you can later distinguish
                it from the other available API keys.
              </DialogContentText>

              <TextField
                label="Key Name"
                value={controller.state.keyName}
                sx={{ width: '100%', marginTop: 2 }}
                onChange={(e): void => controller.setKeyName(e.target.value)}
              />
            </DialogContent>

            <DialogActions>
              <Button color="inherit" onClick={(): void => props.close()}>
                Close
              </Button>
              <Button
                variant="contained"
                disabled={controller.state.keyName.trim() === ''}
                onClick={(): void => void controller.createApiKey()}
              >
                Create Key
              </Button>
            </DialogActions>
          </React.Fragment>
        )}

        {controller.state.viewMode === ViewMode.IsCreatingKey && (
          <DialogContent>
            <Box sx={{ display: 'flex', justifyContent: 'center' }}>
              <CircularProgress
                sx={{ color: (theme) => theme.palette.grey[500] }}
              />
            </Box>
          </DialogContent>
        )}

        {controller.state.viewMode === ViewMode.ErrorCreatingKey && (
          <React.Fragment>
            <DialogContent>
              <Alert severity="error">
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Box>An error has occurred while creating the API key.</Box>

                  {/* 
                    Technically, this is not ideal, because it it possible that the key got created, but the response did not reach us.
                    In this case, the user will press "try again" and create another key.
                    However, this is such a rare edge case that we can probably just ignore it for now.
                  */}
                  <Box>
                    <Button
                      variant="contained"
                      color="error"
                      onClick={(): void => void controller.createApiKey()}
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

        {controller.state.viewMode === ViewMode.AfterCreateKey &&
          controller.state.keyDetails && (
            <React.Fragment>
              <DialogContent>
                <Alert severity="info">
                  The API Key has been created. Copy the key now - it will not
                  be possible to see the key later!
                </Alert>

                <Alert
                  severity="success"
                  icon={<Icons.Lock fontSize="inherit" />}
                  sx={{ marginTop: 3 }}
                  action={
                    <Button
                      color="inherit"
                      size="small"
                      onClick={(): void => controller.copyApiKeyToClipboard()}
                    >
                      Copy
                    </Button>
                  }
                >
                  <AlertTitle>Your API Key</AlertTitle>

                  <Box sx={{ wordBreak: 'break-all', userSelect: 'all' }}>
                    {controller.state.keyDetails.apiKey}
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
    </React.Fragment>
  );
};

interface State {
  viewMode: ViewMode;

  keyName: string;

  keyDetails: CreateApiKeyResponseDto | undefined;
}
interface Controller {
  state: State;

  setKeyName: (keyName: string) => void;

  createApiKey: () => Promise<void>;

  copyApiKeyToClipboard: () => void;
}
function useController(props: Props): Controller {
  const apiKeysHttpService = useApiKeysHttpServiceContext();
  const snackbarService = useSnackbarServiceContext();

  const [state, setState] = React.useState<State>({
    viewMode: ViewMode.AskForKeyName,

    keyName: '',

    keyDetails: undefined,
  });

  return {
    state: state,

    setKeyName: (keyName): void => {
      setState((state) => merge(state, { keyName: keyName }));
    },

    createApiKey: async (): Promise<void> => {
      setState((state) => merge(state, { viewMode: ViewMode.IsCreatingKey }));

      const keyCreationResponse = await apiKeysHttpService.createApiKey(
        state.keyName,
      );
      if (keyCreationResponse.status !== 201) {
        setState((state) =>
          merge(state, { viewMode: ViewMode.ErrorCreatingKey }),
        );
        return;
      }

      props.afterCreateApiKey();

      setState((state) =>
        merge(state, {
          viewMode: ViewMode.AfterCreateKey,
          keyDetails: keyCreationResponse.data,
        }),
      );
    },

    copyApiKeyToClipboard: (): void => {
      if (!state.keyDetails) {
        return;
      }

      void navigator.clipboard.writeText(state.keyDetails.apiKey);

      snackbarService.showSnackbar(
        'The API Key has been copied to your clipboard',
      );
    },
  };
}
