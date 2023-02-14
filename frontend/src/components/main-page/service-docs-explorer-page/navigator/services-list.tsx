import { List } from '@mui/material';
import React from 'react';

import { ServiceNode } from '../../service-docs-tree';
import { useServiceDocsServiceContext } from '../../services/service-docs-service';

import { ServiceItem } from './common/service-item';

export const ServicesList: React.FC = () => {
  const controller = useController();

  return (
    <List component="div" disablePadding>
      {controller.sortedServiceDocs.map((serviceDoc) => (
        <ServiceItem
          key={serviceDoc.name}
          service={serviceDoc}
          indent={0}
          autoScrollIntoView
        />
      ))}
    </List>
  );
};

interface Controller {
  sortedServiceDocs: ServiceNode[];
}
function useController(): Controller {
  const serviceDocsService = useServiceDocsServiceContext();

  const sortedServiceDocs = React.useMemo((): ServiceNode[] => {
    const result = [...serviceDocsService.serviceDocs];

    result.sort((a, b) => {
      return a.name.localeCompare(b.name);
    });

    return result;
  }, [serviceDocsService.serviceDocs]);

  return {
    sortedServiceDocs: sortedServiceDocs,
  };
}
