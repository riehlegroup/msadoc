import { Alert, Box, Divider, IconButton, Tooltip } from '@mui/material';
import { GetServiceDocResponse } from 'msadoc-client';
import React from 'react';

import { Icons } from '../../../icons';
import { merge } from '../../../utils/merge';
import {
  ServiceDocsService,
  ServiceDocsServiceContextProvider,
  useServiceDocsServiceContext,
} from '../services/service-docs-service';

import { FilterDialog, FilterNode, applyFilter } from './filter';
import { Navigator } from './navigator';
import { ServiceDocsExplorerPageRouter } from './router';
import { SearchDialog } from './search';

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
              <Tooltip title="Find Service">
                <IconButton
                  onClick={(): void => controller.setShowSearchDialog(true)}
                >
                  <Icons.Search />
                </IconButton>
              </Tooltip>

              <Tooltip title="Filter Services">
                <IconButton
                  onClick={(): void => controller.setShowFilterDialog(true)}
                >
                  <Icons.FilterAlt />
                </IconButton>
              </Tooltip>
            </Box>

            <Divider />

            <Box sx={{ overflow: 'hidden', minWidth: 0, flexGrow: 1 }}>
              {controller.state.rawFilterQuery !== undefined && (
                <Alert severity="info">The filter is active</Alert>
              )}

              {controller.rawFilteredServiceDocs.length > 0 ? (
                <Navigator />
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

        {controller.state.showSearchDialog && (
          <SearchDialog
            close={(): void => controller.setShowSearchDialog(false)}
          />
        )}
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

  showSearchDialog: boolean;
  showFilterDialog: boolean;
}
interface Controller {
  state: State;

  mainContentRef: React.RefObject<HTMLDivElement>;
  scrollMainContentToTop: () => void;

  originalServiceDocsService: ServiceDocsService;

  rawFilteredServiceDocs: GetServiceDocResponse[];

  setShowSearchDialog: (show: boolean) => void;
  setShowFilterDialog: (show: boolean) => void;
  applyFilter: (filter: FilterNode, rawFilterQuery: string) => void;
  removeFilter: () => void;
}
function useController(): Controller {
  const serviceDocsService = useServiceDocsServiceContext();

  const [state, setState] = React.useState<State>({
    filter: undefined,
    rawFilterQuery: undefined,
    showSearchDialog: false,
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

    setShowSearchDialog: (show): void => {
      setState((state) => merge(state, { showSearchDialog: show }));
    },
    setShowFilterDialog: (show): void => {
      setState((state) => merge(state, { showFilterDialog: show }));
    },
    applyFilter: (filter, rawFilterQuery): void => {
      setState((state) =>
        merge(state, { filter: filter, rawFilterQuery: rawFilterQuery }),
      );
    },
    removeFilter: (): void => {
      setState((state) =>
        merge(state, { filter: undefined, rawFilterQuery: undefined }),
      );
    },
  };
}
