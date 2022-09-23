import { Box } from '@mui/material';
import { GetServiceDocResponse } from 'msadoc-client';
import React from 'react';

import { useServiceDocsServiceContext } from '../services/service-docs-service';

export const GroupsTreePage: React.FC = () => {
  const controller = useController();

  return (
    <Box sx={{ height: '100%', overflowX: 'hidden', overflowY: 'auto' }}>
      {JSON.stringify(controller.serviceDocs)}
    </Box>
  );
};

interface Controller {
  serviceDocs: GetServiceDocResponse[];
}
function useController(): Controller {
  const serviceDocsService = useServiceDocsServiceContext();

  return {
    serviceDocs: serviceDocsService.serviceDocs,
  };
}
