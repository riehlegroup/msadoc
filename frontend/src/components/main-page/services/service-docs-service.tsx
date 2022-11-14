import { GetServiceDocResponse } from 'msadoc-client';
import React from 'react';

import {
  RootGroupNode,
  ServiceNode,
  buildServiceDocsTree,
} from '../service-docs-tree';
import { extractAllServices } from '../utils/service-docs-tree-utils';

interface ServiceDocsService {
  serviceDocs: ServiceNode[];
  groupsTree: RootGroupNode;
}
function useServiceDocsService(
  serviceDocs: GetServiceDocResponse[],
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
  };
}

const AuthDataServiceContext = React.createContext<
  ServiceDocsService | undefined
>(undefined);

interface Props {
  serviceDocs: GetServiceDocResponse[];
  children?: React.ReactNode;
}
export const ServiceDocsServiceContextProvider: React.FC<Props> = (props) => {
  const serviceDocsService = useServiceDocsService(props.serviceDocs);

  return (
    <AuthDataServiceContext.Provider value={serviceDocsService}>
      {props.children}
    </AuthDataServiceContext.Provider>
  );
};

export const useServiceDocsServiceContext = (): ServiceDocsService => {
  const context = React.useContext(AuthDataServiceContext);
  if (!context) {
    throw Error(
      'Your component does not seem to be part of the ServiceDocsServiceContext!',
    );
  }

  return context;
};
