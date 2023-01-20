import { Alert, Box, Divider, IconButton } from '@mui/material';
import { GetServiceDocResponse } from 'msadoc-client';
import React from 'react';

import { Icons } from '../../../icons';
import {
  ServiceDocsService,
  ServiceDocsServiceContextProvider,
  useServiceDocsServiceContext,
} from '../services/service-docs-service';

import { FilterDialog, FilterNode, applyFilter } from './filter';
import { ServiceDocsExplorerPageRouter } from './router';
import { Tree } from './tree';

export const ServiceDocsExplorerPage: React.FC = () => {
  const controller = useController();

  return (
    <React.Fragment>
      {/*
        Here, we override the ServiceDocsService context with a new one that only contains the filtered services.
        This allows us to just "blindly" access the ServiceDocsService in the entire page without having to distinguish between "all services" and "filtered services".
      */}
      <ServiceDocsServiceContextProvider
        serviceDocs={controller.rawFilteredServiceDocs}
        reloadServiceDocs={
          controller.originalServiceDocsService.reloadServiceDocs
        }
      >
        <Box sx={{ height: '100%', overflow: 'hidden', display: 'flex' }}>
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',

              height: '100%',
              overflow: 'hidden',
              width: '300px',
              flexShrink: 0,
              background: (theme) => theme.palette.grey[100],
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
              <IconButton
                onClick={(): void => controller.setShowFilterDialog(true)}
              >
                <Icons.FilterAlt />
              </IconButton>
            </Box>

            <Divider />

            <Box sx={{ overflow: 'auto', minWidth: 0, flexGrow: 1 }}>
              {controller.state.rawFilterQuery !== undefined && (
                <Alert severity="info">The filter is active</Alert>
              )}

              {controller.rawFilteredServiceDocs.length > 0 ? (
                <Tree />
              ) : (
                <Alert severity="warning">No Service Docs found</Alert>
              )}
            </Box>
          </Box>

          <Box
            ref={controller.mainContentRef}
            sx={{ height: '100%', overflow: 'auto', flexGrow: 1 }}
          >
            <ServiceDocsExplorerPageRouter
              onChangeTreeItem={(): void => controller.scrollMainContentToTop()}
            />
          </Box>
        </Box>
      </ServiceDocsServiceContextProvider>

      {controller.state.showFilterDialog && (
        <FilterDialog
          currentRawFilterQuery={controller.state.rawFilterQuery}
          applyFilter={(filter: FilterNode, rawQuery: string): void => {
            controller.applyFilter(filter, rawQuery);
            controller.setShowFilterDialog(false);
          }}
          removeFilter={(): void => {
            controller.removeFilter();
            controller.setShowFilterDialog(false);
          }}
          close={(): void => controller.setShowFilterDialog(false)}
        />
      )}
    </React.Fragment>
  );
};

interface State {
  filter: FilterNode | undefined;
  rawFilterQuery: string | undefined;

  showFilterDialog: boolean;
}
interface Controller {
  state: State;

  mainContentRef: React.RefObject<HTMLDivElement>;
  scrollMainContentToTop: () => void;

  originalServiceDocsService: ServiceDocsService;

  rawFilteredServiceDocs: GetServiceDocResponse[];

  setShowFilterDialog: (show: boolean) => void;
  applyFilter: (filter: FilterNode, rawFilterQuery: string) => void;
  removeFilter: () => void;
}
function useController(): Controller {
  const serviceDocsService = useServiceDocsServiceContext();

  const [state, setState] = React.useState<State>({
    filter: undefined,
    rawFilterQuery: undefined,
    showFilterDialog: false,
  });

  const rawFilteredServiceDocs = React.useMemo(() => {
    if (!state.filter) {
      const rawServiceDocs = serviceDocsService.serviceDocs.map(
        (singleServiceDoc) => singleServiceDoc.rawData,
      );
      return rawServiceDocs;
    }

    const filteredServiceDocs = applyFilter(
      state.filter,
      serviceDocsService.serviceDocs,
    );
    const rawFilteredServiceDocs = filteredServiceDocs.map(
      (singleServiceDoc) => singleServiceDoc.rawData,
    );

    return rawFilteredServiceDocs;
  }, [serviceDocsService.serviceDocs, state.filter]);

  const mainContentRef = React.useRef<HTMLDivElement>(null);

  return {
    state: state,

    mainContentRef: mainContentRef,
    scrollMainContentToTop: (): void => {
      mainContentRef.current?.scrollTo(0, 0);
    },

    originalServiceDocsService: serviceDocsService,

    rawFilteredServiceDocs: rawFilteredServiceDocs,

    setShowFilterDialog: (show): void => {
      setState((state) => ({ ...state, showFilterDialog: show }));
    },
    applyFilter: (filter, rawFilterQuery): void => {
      setState((state) => ({
        ...state,
        filter: filter,
        rawFilterQuery: rawFilterQuery,
      }));
    },
    removeFilter: (): void => {
      setState((state) => ({
        ...state,
        filter: undefined,
        rawFilterQuery: undefined,
      }));
    },
  };
}
