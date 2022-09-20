import React from 'react';

import { ListAllServiceDocs200ResponseData } from '../../models/api';
import { useHttpServiceContext } from '../../services/http-service';

import { MainPageRoutes } from './routes';
import { ServiceDocsServiceContextProvider } from './services/service-docs-service';

export const MainPage: React.FC = () => {
  const controller = useController();

  return (
    <React.Fragment>
      {controller.state.isLoading && <span>Loading</span>}
      {controller.state.error && <span>Error</span>}
      {!controller.state.isLoading &&
        !controller.state.error &&
        controller.state.serviceDocs && (
          <ServiceDocsServiceContextProvider
            serviceDocs={controller.state.serviceDocs}
          >
            <MainPageRoutes />
          </ServiceDocsServiceContextProvider>
        )}
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
  };
}
