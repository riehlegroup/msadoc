import { Box } from '@mui/material';
import React from 'react';

import { GroupsTreePageRouter } from './router';
import { Tree } from './tree';

export const GroupsTreePage: React.FC = () => {
  return (
    <Box sx={{ height: '100%', overflow: 'hidden', display: 'flex' }}>
      <Box
        sx={{
          height: '100%',
          overflow: 'auto',
          width: '300px',
          flexShrink: 0,
          background: (theme) => theme.palette.grey[100],
        }}
      >
        <Tree />
      </Box>

      <Box sx={{ height: '100%', overflow: 'auto', flexGrow: 1 }}>
        <GroupsTreePageRouter />
      </Box>
    </Box>
  );
};
