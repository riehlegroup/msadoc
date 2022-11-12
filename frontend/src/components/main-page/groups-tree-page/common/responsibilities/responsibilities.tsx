import { Box, Typography } from '@mui/material';
import React from 'react';

import { MainNode, ServiceDocsTreeNodeType } from '../../../service-docs-tree';

import { GroupResponsibilities } from './group-responsibilities';
import { ServiceResponsibilities } from './service-responsibilities';

interface Props {
  showResponsibilitiesFor: MainNode;
}
export const Responsibilities: React.FC<Props> = (props) => {
  return (
    <React.Fragment>
      <Typography variant="h3">
        {props.showResponsibilitiesFor.type === ServiceDocsTreeNodeType.Service
          ? 'Responsibilities'
          : 'Aggregated Responsibilities'}
      </Typography>

      <Box sx={{ marginTop: 2 }}>
        {props.showResponsibilitiesFor.type ===
        ServiceDocsTreeNodeType.Service ? (
          <ServiceResponsibilities
            showResponsiblesFor={props.showResponsibilitiesFor}
          />
        ) : (
          <GroupResponsibilities
            showResponsiblesFor={props.showResponsibilitiesFor}
          />
        )}
      </Box>
    </React.Fragment>
  );
};
