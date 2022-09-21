import {
  Backdrop,
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  CircularProgress,
  Typography,
} from '@mui/material';
import React from 'react';

import { ListAllServiceDocs200ResponseData } from '../../models/api';
import { useHttpServiceContext } from '../../services/http-service';

import { LeftMenu } from './left-menu';
import { MainPageRoutes } from './routes';
import { ServiceDocsServiceContextProvider } from './services/service-docs-service';

export const MainPage: React.FC = () => {
  const controller = useController();

  return (
    <React.Fragment>
      <Box
        sx={{
          display: 'flex',
          height: '100%',
        }}
      >
        <Box
          sx={{
            width: '70px',
            flexShrink: 0,
          }}
        >
          <LeftMenu
            reloadServiceDocs={(): void => void controller.loadServiceDocs()}
          />
        </Box>

        <Box sx={{ flexGrow: 1, overflow: 'hidden', position: 'relative' }}>
          {controller.state.isLoading && (
            <Backdrop sx={{ color: '#ffffff', position: 'absolute' }} open>
              <CircularProgress color="inherit" />
            </Backdrop>
          )}
          {controller.state.error && (
            <Backdrop sx={{ color: '#ffffff', position: 'absolute' }} open>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="h5">Error</Typography>

                  <Typography>
                    An error has occurred while loading the Service Docs.
                  </Typography>
                </CardContent>

                <CardActions>
                  <Button
                    onClick={(): void => void controller.loadServiceDocs()}
                  >
                    Try again
                  </Button>
                </CardActions>
              </Card>
            </Backdrop>
          )}

          {/* 
            When loading new Service Docs, we keep the following components as-is in order not to lose the component-internal state. 
            Otherwise, whenever the Service Docs are reloaded, the user would potentially have to redo all of the commands that lead him/her to the current state. 
          */}
          {controller.state.serviceDocs && (
            <ServiceDocsServiceContextProvider
              serviceDocs={controller.state.serviceDocs}
            >
              <MainPageRoutes />
            </ServiceDocsServiceContextProvider>
          )}
        </Box>
      </Box>
    </React.Fragment>
  );
};

interface State {
  isLoading: boolean;
  error: boolean;
  serviceDocs: ListAllServiceDocs200ResponseData | undefined;
}
interface Controller {
  state: State;

  loadServiceDocs: () => Promise<void>;
}
function useController(): Controller {
  const httpService = useHttpServiceContext();

  const [state, setState] = React.useState<State>({
    isLoading: true,
    error: false,
    serviceDocs: undefined,
  });

  async function loadServiceDocs(): Promise<void> {
    setState((state) => ({ ...state, isLoading: true, error: false }));
    const serviceDocs = await httpService.listAllServiceDocs();
    setState((state) => ({ ...state, isLoading: false }));

    if (serviceDocs.status === 200) {
      setState((state) => ({
        ...state,
        error: false,
        serviceDocs: serviceDocs.data,
      }));
      return;
    }

    setState((state) => ({ ...state, error: true }));
  }

  React.useEffect(() => {
    void loadServiceDocs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    state: state,

    loadServiceDocs: loadServiceDocs,
  };
}
