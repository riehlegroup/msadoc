import { GetServiceDocResponse } from 'msadoc-client';
import React from 'react';
import { useMatch } from 'react-router-dom';

import { GROUPS_TREE_ROUTES_ABS } from '../../../../routes';
import { useServiceDocsServiceContext } from '../../services/service-docs-service';

export const ServiceDetails: React.FC = () => {
  const controller = useController();

  return (
    <React.Fragment>
      Service Details {JSON.stringify(controller.service)}
    </React.Fragment>
  );
};

interface Controller {
  service: GetServiceDocResponse | undefined;
}
function useController(): Controller {
  const routerMatch = useMatch(GROUPS_TREE_ROUTES_ABS.service);

  const serviceDocsService = useServiceDocsServiceContext();

  const service = React.useMemo((): GetServiceDocResponse | undefined => {
    if (!routerMatch || routerMatch.params.service === undefined) {
      console.warn(
        'The service route was not matched. This should not happen.',
      );
      return undefined;
    }

    return serviceDocsService.serviceDocs.find((item) => {
      if (item.name !== routerMatch.params.service) {
        return false;
      }
      return true;
    });
  }, [routerMatch, serviceDocsService.serviceDocs]);

  return {
    service: service,
  };
}
