import { GetServiceDocResponse } from 'msadoc-client';
import React from 'react';

interface ServiceDocsService {
  serviceDocs: GetServiceDocResponse[];
}
function useServiceDocsService(
  serviceDocs: GetServiceDocResponse[],
): ServiceDocsService {
  return {
    serviceDocs: serviceDocs,
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
