import React from 'react';

import { ListAllServiceDocs200ResponseData } from '../../../models/api';
import { useServiceDocsServiceContext } from '../services/service-docs-service';

export const GroupsTreePage: React.FC = () => {
  const controller = useController();

  return <span>{JSON.stringify(controller.serviceDocs)}</span>;
};

interface Controller {
  serviceDocs: ListAllServiceDocs200ResponseData;
}
function useController(): Controller {
  const serviceDocsService = useServiceDocsServiceContext();

  return {
    serviceDocs: serviceDocsService.serviceDocs,
  };
}
