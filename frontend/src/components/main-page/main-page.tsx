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
import { GetServiceDocResponse } from 'msadoc-client';
import React from 'react';

import { ENVIRONMENT } from '../../env';
import { useServiceDocsHttpServiceContext } from '../../services/http';

import { DemoModeBanner } from './demo-mode-banner';
import { LeftMenu } from './left-menu';
import { MainPageRouter } from './router';
import { ServiceDocsServiceContextProvider } from './services/service-docs-service';

export const MainPage: React.FC = () => {
  const controller = useController();

  return (
    <React.Fragment>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
        }}
      >
        {ENVIRONMENT.REACT_APP_DEMO_MODE && (
          <Box>
            <DemoModeBanner />
          </Box>
        )}

        <Box
          sx={{
            display: 'flex',
            flexGrow: 1,
            // MinHeight: 0 prevents the element from growing larger than the parent, see https://stackoverflow.com/questions/36247140/why-dont-flex-items-shrink-past-content-size
            minHeight: 0,
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
              <Backdrop
                sx={{
                  color: '#ffffff',
                  position: 'absolute',
                  zIndex: (theme) => theme.zIndex.modal + 1,
                }}
                open
              >
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
                <MainPageRouter />
              </ServiceDocsServiceContextProvider>
            )}
          </Box>
        </Box>
      </Box>
    </React.Fragment>
  );
};

interface State {
  isLoading: boolean;
  error: boolean;
  serviceDocs: GetServiceDocResponse[] | undefined;
}
interface Controller {
  state: State;

  loadServiceDocs: () => Promise<void>;
}
function useController(): Controller {
  const serviceDocsHttpService = useServiceDocsHttpServiceContext();

  const [state, setState] = React.useState<State>({
    isLoading: true,
    error: false,
    serviceDocs: undefined,
  });

  async function loadServiceDocs(): Promise<void> {
    setState((state) => ({ ...state, isLoading: true, error: false }));
    const serviceDocsResponse =
      await serviceDocsHttpService.listAllServiceDocs();
    setState((state) => ({ ...state, isLoading: false }));

    if (serviceDocsResponse.status === 200) {
      setState((state) => ({
        ...state,
        error: false,
        serviceDocs: serviceDocsResponse.data.serviceDocs,
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
