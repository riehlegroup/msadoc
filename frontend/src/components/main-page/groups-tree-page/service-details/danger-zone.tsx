import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
} from '@mui/material';
import React from 'react';

import { useServiceDocsHttpServiceContext } from '../../../../services/http';
import { useSnackbarServiceContext } from '../../../../services/snackbar-service';
import { ServiceNode } from '../../service-docs-tree';
import { useServiceDocsServiceContext } from '../../services/service-docs-service';

enum ViewState {
  Default,
  ConfirmServiceDocDeletion,
  IsDeletingServiceDoc,
  ErrorDeletingServiceDoc,
}

interface Props {
  correspondingService: ServiceNode;
}
export const DangerZone: React.FC<Props> = (props) => {
  const controller = useController(props);

  return (
    <React.Fragment>
      <Typography
        variant="h4"
        sx={{ color: (theme) => theme.palette.error.main }}
      >
        Danger Zone
      </Typography>

      <Box sx={{ marginTop: 2 }}>
        <Button
          variant="contained"
          color="error"
          onClick={(): void =>
            controller.setViewState(ViewState.ConfirmServiceDocDeletion)
          }
        >
          Delete Service Doc
        </Button>
      </Box>

      {(controller.state.viewState === ViewState.ConfirmServiceDocDeletion ||
        controller.state.viewState === ViewState.IsDeletingServiceDoc ||
        controller.state.viewState === ViewState.ErrorDeletingServiceDoc) && (
        <Dialog
          maxWidth="sm"
          open
          fullWidth
          onClose={(): void => controller.setViewState(ViewState.Default)}
        >
          {controller.state.viewState ===
            ViewState.ConfirmServiceDocDeletion && (
            <React.Fragment>
              <DialogTitle>Delete Service Doc</DialogTitle>

              <DialogContent>
                <Alert severity="warning">
                  {`Do you really want to delete Service Doc "${props.correspondingService.name}"? This action cannot be undone.`}
                </Alert>
              </DialogContent>

              <DialogActions>
                <Button
                  color="inherit"
                  onClick={(): void =>
                    controller.setViewState(ViewState.Default)
                  }
                >
                  Close
                </Button>
                <Button
                  variant="contained"
                  color="error"
                  onClick={(): void => void controller.deleteServiceDoc()}
                >
                  Delete Service Doc
                </Button>
              </DialogActions>
            </React.Fragment>
          )}

          {controller.state.viewState === ViewState.IsDeletingServiceDoc && (
            <DialogContent>
              <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                <CircularProgress
                  sx={{ color: (theme) => theme.palette.grey[500] }}
                />
              </Box>
            </DialogContent>
          )}

          {controller.state.viewState === ViewState.ErrorDeletingServiceDoc && (
            <React.Fragment>
              <DialogContent>
                <Alert severity="error">
                  <Box
                    sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}
                  >
                    <Box>
                      An error has occurred while deleting the Service Doc.
                    </Box>

                    {/*
                      Technically, this is not ideal, because it it possible that the Service Doc got deleted,but the response did not reach us.
                      In this case, the user will see this message after every click on "try again".
                      However, this is such a rare edge case that we can probably just ignore it for now(especially since the user can close the dialog in other ways).
                    */}
                    <Box>
                      <Button
                        variant="contained"
                        color="error"
                        onClick={(): void => void controller.deleteServiceDoc()}
                      >
                        Try again
                      </Button>
                    </Box>
                  </Box>
                </Alert>
              </DialogContent>

              <DialogActions>
                <Button
                  color="inherit"
                  onClick={(): void =>
                    controller.setViewState(ViewState.Default)
                  }
                >
                  Close
                </Button>
              </DialogActions>
            </React.Fragment>
          )}
        </Dialog>
      )}
    </React.Fragment>
  );
};

interface State {
  viewState: ViewState;
}
interface Controller {
  state: State;

  setViewState: (viewState: ViewState) => void;

  deleteServiceDoc: () => Promise<void>;
}
function useController(props: Props): Controller {
  const serviceDocsService = useServiceDocsServiceContext();
  const serviceDocsHttpService = useServiceDocsHttpServiceContext();
  const snackbarService = useSnackbarServiceContext();

  const [state, setState] = React.useState<State>({
    viewState: ViewState.Default,
  });

  return {
    state: state,

    setViewState: (viewState): void => {
      setState((state) => ({ ...state, viewState: viewState }));
    },

    deleteServiceDoc: async (): Promise<void> => {
      setState((state) => ({
        ...state,
        viewState: ViewState.IsDeletingServiceDoc,
      }));

      const serviceDocDeletionResponse =
        await serviceDocsHttpService.deleteSingleServiceDoc(
          props.correspondingService.name,
        );
      if (serviceDocDeletionResponse.status !== 200) {
        setState((state) => ({
          ...state,
          viewState: ViewState.ErrorDeletingServiceDoc,
        }));
        return;
      }

      snackbarService.showSnackbar(
        `Service Doc "${props.correspondingService.name}" has been deleted`,
      );

      serviceDocsService.reloadServiceDocs();
    },
  };
}
