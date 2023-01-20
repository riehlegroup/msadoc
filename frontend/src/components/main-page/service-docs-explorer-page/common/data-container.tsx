import { Paper } from '@mui/material';
import React from 'react';

interface Props {
  children: React.ReactNode;
}
export const DataContainer: React.FC<Props> = (props) => {
  return (
    <Paper elevation={24} sx={{ padding: 4 }}>
      {props.children}
    </Paper>
  );
};
