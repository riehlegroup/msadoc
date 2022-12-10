import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import { GetApiKeyResponseDto } from 'msadoc-client';
import React from 'react';

import { useApiKeysHttpServiceContext } from '../../../services/http/api-keys';

import { ApiKeyCreationDialog } from './api-key-creation-dialog';
import { ApiKeysTableRow } from './api-keys-table-row';

enum KeysLoadingState {
  IsLoading,
  Error,
  HasLoadedKeys,
}

export const ApiKeysPage: React.FC = () => {
  const controller = useController();

  return (
    <React.Fragment>
      <Box
        sx={{
          paddingX: 8,
          paddingBottom: 10,
          paddingTop: 3,
          maxWidth: '800px',
          height: '100%',
          overflowY: 'auto',
        }}
      >
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Box>
            <Typography variant="h4">API Keys</Typography>
          </Box>
          <Box>
            <Button
              variant="contained"
              onClick={(): void => controller.setShowApiKeyCreationDialog(true)}
            >
              Create API Key
            </Button>
          </Box>
        </Box>

        <Box sx={{ marginTop: 3 }}>
          {controller.state.keysLoadingState === KeysLoadingState.IsLoading && (
            <CircularProgress
              sx={{ color: (theme) => theme.palette.grey[500] }}
            />
          )}

          {controller.state.keysLoadingState === KeysLoadingState.Error && (
            <Alert severity="error">
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box>
                  An error has occurred while loading the list of API keys.
                </Box>

                <Box>
                  <Button
                    variant="contained"
                    color="error"
                    onClick={(): void => void controller.loadApiKeys()}
                  >
                    Try again
                  </Button>
                </Box>
              </Box>
            </Alert>
          )}

          {controller.state.keysLoadingState ===
            KeysLoadingState.HasLoadedKeys &&
            controller.state.apiKeys && (
              <React.Fragment>
                {controller.state.apiKeys.length < 1 && (
                  <Alert severity="info">No API Keys</Alert>
                )}

                {controller.state.apiKeys.length > 0 && (
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Name</TableCell>
                          <TableCell>Created On</TableCell>
                          <TableCell>Actions</TableCell>
                        </TableRow>
                      </TableHead>

                      <TableBody>
                        {controller.state.apiKeys.map((singleApiKey) => (
                          <ApiKeysTableRow
                            key={singleApiKey.id}
                            apiKey={singleApiKey}
                            reloadTable={(): void =>
                              void controller.loadApiKeys()
                            }
                          />
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}
              </React.Fragment>
            )}
        </Box>
      </Box>

      {controller.state.showApiKeyCreationDialog && (
        <ApiKeyCreationDialog
          close={(): void => controller.setShowApiKeyCreationDialog(false)}
          afterCreateApiKey={(): void => void controller.loadApiKeys()}
        />
      )}
    </React.Fragment>
  );
};

interface State {
  showApiKeyCreationDialog: boolean;

  keysLoadingState: KeysLoadingState;

  apiKeys: GetApiKeyResponseDto[] | undefined;
}
interface Controller {
  state: State;

  setShowApiKeyCreationDialog: (show: boolean) => void;

  loadApiKeys: () => Promise<void>;
}
function useController(): Controller {
  const apiKeysHttpService = useApiKeysHttpServiceContext();

  const [state, setState] = React.useState<State>({
    showApiKeyCreationDialog: false,

    keysLoadingState: KeysLoadingState.IsLoading,

    apiKeys: undefined,
  });

  React.useEffect(() => {
    void loadApiKeys();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function loadApiKeys(): Promise<void> {
    setState((state) => ({
      ...state,
      keysLoadingState: KeysLoadingState.IsLoading,
      apiKeys: undefined,
    }));

    const apiKeysResponse = await apiKeysHttpService.listAllApiKeys();

    if (apiKeysResponse.status !== 200) {
      setState((state) => ({
        ...state,
        keysLoadingState: KeysLoadingState.Error,
      }));
      return;
    }

    setState((state) => ({
      ...state,
      keysLoadingState: KeysLoadingState.HasLoadedKeys,
      apiKeys: apiKeysResponse.data.apiKeys,
    }));
  }

  return {
    state: state,

    setShowApiKeyCreationDialog: (show): void => {
      setState((state) => ({ ...state, showApiKeyCreationDialog: show }));
    },

    loadApiKeys: loadApiKeys,
  };
}
