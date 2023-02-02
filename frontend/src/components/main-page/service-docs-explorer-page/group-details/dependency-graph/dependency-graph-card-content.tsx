import { Box, Button, Dialog, IconButton, Tooltip } from '@mui/material';
import React from 'react';

import { Icons } from '../../../../../icons';

import { Graph, GraphMode } from './graph';

export const DependencyGraphCardContent: React.FC = () => {
  const controller = useController();

  return (
    <React.Fragment>
      <Box>
        <Box sx={{ display: 'flex', justifyContent: 'right', marginBottom: 2 }}>
          <Tooltip title="Open Graph View">
            <Button
              variant="contained"
              onClick={(): void => controller.setShowModal(true)}
            >
              <Icons.OpenInFull />
            </Button>
          </Tooltip>
        </Box>

        <Box
          sx={{ height: '300px', overflow: 'hidden', pointerEvents: 'none' }}
        >
          <Graph mode={GraphMode.Card} />
        </Box>
      </Box>

      {controller.state.showModal && (
        <Dialog fullScreen open>
          <Box
            sx={{ position: 'relative', overflow: 'hidden', height: '100%' }}
          >
            <Tooltip title="Close Graph View">
              <IconButton
                sx={{ position: 'absolute', left: 0, top: 0 }}
                onClick={(): void => controller.setShowModal(false)}
              >
                <Icons.Close />
              </IconButton>
            </Tooltip>

            <Graph mode={GraphMode.Large} />
          </Box>
        </Dialog>
      )}
    </React.Fragment>
  );
};

interface State {
  showModal: boolean;
}
interface Controller {
  state: State;

  setShowModal: (show: boolean) => void;
}
function useController(): Controller {
  const [state, setState] = React.useState<State>({
    showModal: false,
  });

  return {
    state: state,

    setShowModal: (show): void => {
      setState((state) => ({ ...state, showModal: show }));
    },
  };
}
