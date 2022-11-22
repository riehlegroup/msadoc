import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  TextField,
  Typography,
} from '@mui/material';
import { Box } from '@mui/system';
import React from 'react';

import { FilterNode } from './models';
import { parseFilterQuery } from './parse-query';

interface Props {
  currentRawFilterQuery: string | undefined;

  applyFilter: (filter: FilterNode, rawQuery: string) => void;
  removeFilter: () => void;
  close: () => void;
}
export const FilterDialog: React.FC<Props> = (props) => {
  const controller = useController(props);

  return (
    <Dialog maxWidth={false} open onClose={(): void => props.close()}>
      <DialogContent sx={{ width: '900px', maxWidth: '100%' }}>
        <Typography variant="h4">Filter</Typography>

        {controller.state.showInfoAboutInvalidFilterQuery && (
          <Alert sx={{ marginTop: 2 }} severity="error">
            The filter query is invalid.
          </Alert>
        )}

        <Box sx={{ marginTop: 2 }}>
          <form
            onSubmit={(e): void => {
              e.preventDefault();
              controller.applyOrRemoveFilter();
            }}
          >
            <TextField
              sx={{ width: '100%' }}
              label="Filter Query"
              value={controller.state.filterQuery}
              onChange={(e): void => controller.setFilterQuery(e.target.value)}
            />
          </form>
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={(): void => props.close()}>Cancel</Button>
        <Button
          variant="contained"
          onClick={(): void => controller.applyOrRemoveFilter()}
        >
          Apply Filter
        </Button>
      </DialogActions>
    </Dialog>
  );
};

interface State {
  filterQuery: string;

  showInfoAboutInvalidFilterQuery: boolean;
}
interface Controller {
  state: State;

  setFilterQuery: (query: string) => void;

  applyOrRemoveFilter: () => void;
}
function useController(props: Props): Controller {
  const [state, setState] = React.useState<State>({
    filterQuery: props.currentRawFilterQuery ?? '',

    showInfoAboutInvalidFilterQuery: false,
  });

  return {
    state: state,

    setFilterQuery: (query): void => {
      setState((state) => ({ ...state, filterQuery: query }));
    },

    applyOrRemoveFilter: (): void => {
      if (state.filterQuery.trim() === '') {
        props.removeFilter();
        return;
      }

      const filterQueryParseResult = parseFilterQuery(state.filterQuery);
      if (!filterQueryParseResult.success) {
        setState((state) => ({
          ...state,
          showInfoAboutInvalidFilterQuery: true,
        }));
        return;
      }

      props.applyFilter(filterQueryParseResult.data, state.filterQuery);
    },
  };
}
