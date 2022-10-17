import { GetServiceDocResponse } from 'msadoc-client';
import React from 'react';

import {
  ServiceDocsRootTreeItem,
  ServiceDocsServiceTreeItem,
  ServiceDocsTreeItemType,
  buildGroupsTree,
} from '../utils/service-docs-utils';

interface ServiceDocsService {
  serviceDocs: ServiceDocsServiceTreeItem[];
  groupsTree: ServiceDocsRootTreeItem;
}
function useServiceDocsService(
  serviceDocs: GetServiceDocResponse[],
): ServiceDocsService {
  const serviceDocsWithType =
    React.useMemo((): ServiceDocsServiceTreeItem[] => {
      const result: ServiceDocsServiceTreeItem[] = [];

      for (const singleServiceDoc of serviceDocs) {
        result.push({
          ...singleServiceDoc,
          treeItemType: ServiceDocsTreeItemType.Service,
        });
      }

      return result;
    }, [serviceDocs]);

  const groupsTree = React.useMemo(
    (): ServiceDocsRootTreeItem => buildGroupsTree(serviceDocsWithType),
    [serviceDocsWithType],
  );

  return {
    serviceDocs: serviceDocsWithType,
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
