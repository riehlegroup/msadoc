import { GetServiceDocResponse } from 'msadoc-client';
import React from 'react';

import {
  RootGroupNode,
  ServiceNode,
  buildServiceDocsTree,
} from '../service-docs-tree';
import { extractAllServices } from '../utils/service-docs-tree-utils';

export interface ServiceDocsService {
  serviceDocs: ServiceNode[];
  groupsTree: RootGroupNode;

  reloadServiceDocs: () => void;
}
function useServiceDocsService(
  serviceDocs: GetServiceDocResponse[],
  reloadServiceDocs: () => void,
): ServiceDocsService {
  const groupsTree = React.useMemo(
    (): RootGroupNode => buildServiceDocsTree(serviceDocs),
    [serviceDocs],
  );

  const serviceDocsAsArray = React.useMemo(
    () => extractAllServices(groupsTree),
    [groupsTree],
  );

  return {
    serviceDocs: serviceDocsAsArray,
    groupsTree: groupsTree,

    reloadServiceDocs: reloadServiceDocs,
  };
}

const ServiceDocsServiceContext = React.createContext<
  ServiceDocsService | undefined
>(undefined);

interface Props {
  serviceDocs: GetServiceDocResponse[];
  reloadServiceDocs: () => void;
  children?: React.ReactNode;
}
export const ServiceDocsServiceContextProvider: React.FC<Props> = (props) => {
  const serviceDocsService = useServiceDocsService(
    props.serviceDocs,
    props.reloadServiceDocs,
  );

  return (
    <ServiceDocsServiceContext.Provider value={serviceDocsService}>
      {props.children}
    </ServiceDocsServiceContext.Provider>
  );
};

export const useServiceDocsServiceContext = (): ServiceDocsService => {
  const context = React.useContext(ServiceDocsServiceContext);
  if (!context) {
    throw Error(
      'Your component does not seem to be part of the ServiceDocsServiceContext!',
    );
  }

  return context;
};
