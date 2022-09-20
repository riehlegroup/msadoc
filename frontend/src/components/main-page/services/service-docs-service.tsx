import React from 'react';

import { ListAllServiceDocs200ResponseData } from '../../../models/api';

interface ServiceDocsService {
  serviceDocs: ListAllServiceDocs200ResponseData;
}
function useServiceDocsService(
  serviceDocs: ListAllServiceDocs200ResponseData,
): ServiceDocsService {
  return {
    serviceDocs: serviceDocs,
  };
}

const AuthDataServiceContext = React.createContext<
  ServiceDocsService | undefined
>(undefined);

interface Props {
  serviceDocs: ListAllServiceDocs200ResponseData;
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
