import { Alert, Box, Divider, IconButton } from '@mui/material';
import { GetServiceDocResponse } from 'msadoc-client';
import React from 'react';

import { Icons } from '../../../icons';
import {
  ServiceDocsServiceContextProvider,
  useServiceDocsServiceContext,
} from '../services/service-docs-service';

import { FilterDialog, FilterNode, applyFilter } from './filter';
import { GroupsTreePageRouter } from './router';
import { Tree } from './tree';

export const GroupsTreePage: React.FC = () => {
  const controller = useController();

  return (
    <React.Fragment>
      {/*
        Here, we override the ServiceDocsService context with a new one that only contains the filtered services.
        This allows us to just "blindly" access the ServiceDocsService in the entire page without having to distinguish between "all services" and "filtered services".
      */}
      <ServiceDocsServiceContextProvider
        serviceDocs={controller.state.filteredServiceDocs}
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

              {controller.state.filteredServiceDocs.length > 0 ? (
                <Tree />
              ) : (
                <Alert severity="warning">No Service Docs found</Alert>
              )}
            </Box>
          </Box>

          <Box sx={{ height: '100%', overflow: 'auto', flexGrow: 1 }}>
            <GroupsTreePageRouter />
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
  filteredServiceDocs: GetServiceDocResponse[];
  rawFilterQuery: string | undefined;

  showFilterDialog: boolean;
}
interface Controller {
  state: State;

  setShowFilterDialog: (show: boolean) => void;
  applyFilter: (filter: FilterNode, rawQuery: string) => void;
  removeFilter: () => void;
}
function useController(): Controller {
  const serviceDocsService = useServiceDocsServiceContext();

  const [state, setState] = React.useState<State>(() => {
    const rawServiceDocs = serviceDocsService.serviceDocs.map(
      (singleServiceDoc) => singleServiceDoc.rawData,
    );

    return {
      filteredServiceDocs: rawServiceDocs,
      rawFilterQuery: undefined,
      showFilterDialog: false,
    };
  });

  return {
    state: state,

    setShowFilterDialog: (show): void => {
      setState((state) => ({ ...state, showFilterDialog: show }));
    },
    applyFilter: (filter, rawQuery): void => {
      const filteredServiceDocs = applyFilter(
        filter,
        serviceDocsService.serviceDocs,
      );
      const rawFilteredServiceDocs = filteredServiceDocs.map(
        (singleServiceDoc) => singleServiceDoc.rawData,
      );

      setState((state) => ({
        ...state,
        filteredServiceDocs: rawFilteredServiceDocs,
        rawFilterQuery: rawQuery,
      }));
    },

    removeFilter: (): void => {
      const allServiceDocs = serviceDocsService.serviceDocs.map(
        (singleServiceDoc) => singleServiceDoc.rawData,
      );

      setState((state) => ({
        ...state,
        filteredServiceDocs: allServiceDocs,
        rawFilterQuery: undefined,
      }));
    },
  };
}
