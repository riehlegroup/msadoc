import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Link,
} from '@mui/material';
import { red } from '@mui/material/colors';
import React from 'react';

import { Icons } from '../../icons';

export const DemoModeBanner: React.FC = () => {
  const controller = useController();

  return (
    <Box
      sx={{
        background: red[700],
        color: '#ffffff',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 1,
      }}
    >
      <Box>Demo Mode</Box>

      <IconButton
        size="small"
        color="inherit"
        onClick={(): void => controller.setShowInfoDialog(true)}
      >
        <Icons.Help fontSize="inherit" />
      </IconButton>

      {controller.state.showInfoDialog && (
        <Dialog open onClose={(): void => controller.setShowInfoDialog(false)}>
          <DialogTitle>Demo Mode</DialogTitle>

          <DialogContent>
            <Box>
              You are browsing this website in demo mode. All data shown here
              are examples, interactions do not trigger any real calls to a
              server.
            </Box>

            <Box sx={{ marginTop: 3 }}>
              Visit our{' '}
              <Link href="https://github.com/osrgroup/msadoc" target="_blank">
                GitHub page
              </Link>{' '}
              to learn more about <b>msadoc</b>.
            </Box>
          </DialogContent>

          <DialogActions>
            <Button onClick={(): void => controller.setShowInfoDialog(false)}>
              Close
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </Box>
  );
};

interface State {
  showInfoDialog: boolean;
}
interface Controller {
  state: State;

  setShowInfoDialog: (show: boolean) => void;
}
function useController(): Controller {
  const [state, setState] = React.useState<State>({
    showInfoDialog: false,
  });

  return {
    state: state,

    setShowInfoDialog: (show): void => {
      setState((state) => ({ ...state, showInfoDialog: show }));
    },
  };
}
