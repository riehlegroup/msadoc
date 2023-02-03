import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  InputAdornment,
  Paper,
  TextField,
} from '@mui/material';
import { Box } from '@mui/system';
import React from 'react';

import { Icons } from '../../../../icons';
import { merge } from '../../../../utils/merge';

import { FilterNode, FilterParseError } from './models';
import { parseFilterQuery } from './parse-query';
import { SyntaxDocumentation } from './syntax-documentation';

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
      <DialogTitle>Filter</DialogTitle>

      <DialogContent sx={{ width: '900px', maxWidth: '100%' }} dividers>
        {controller.state.filterParseError && (
          <Alert sx={{ marginBottom: 2 }} severity="error">
            {controller.state.filterParseError.errorMessages.length < 1 && (
              <span>The filter query is invalid.</span>
            )}

            {controller.state.filterParseError.errorMessages.length === 1 && (
              <span>
                {`The filter query is invalid: ${
                  controller.state.filterParseError.errorMessages[0] ?? ''
                }`}
              </span>
            )}
            {controller.state.filterParseError.errorMessages.length > 1 && (
              <React.Fragment>
                <span>The filter query is invalid.</span>

                <ul>
                  {controller.state.filterParseError.errorMessages.map(
                    (singleErrorMessage, index) => (
                      // eslint-disable-next-line react/no-array-index-key
                      <li key={index}>{singleErrorMessage}</li>
                    ),
                  )}
                </ul>
              </React.Fragment>
            )}
          </Alert>
        )}

        <Box>
          <form
            onSubmit={(e): void => {
              e.preventDefault();
              controller.applyOrRemoveFilter();
            }}
          >
            <TextField
              sx={{ width: '100%' }}
              label="Filter Query"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={(): void =>
                        controller.toggleShowSyntaxDocumentation()
                      }
                    >
                      <Icons.Help />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              value={controller.state.filterQuery}
              onChange={(e): void => controller.setFilterQuery(e.target.value)}
            />
          </form>
        </Box>

        {controller.state.showSyntaxDocumentation && (
          <Paper elevation={3} sx={{ padding: 3, marginTop: 3 }}>
            <SyntaxDocumentation />
          </Paper>
        )}
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

  filterParseError: FilterParseError | undefined;

  showSyntaxDocumentation: boolean;
}
interface Controller {
  state: State;

  setFilterQuery: (query: string) => void;

  applyOrRemoveFilter: () => void;

  toggleShowSyntaxDocumentation: () => void;
}
function useController(props: Props): Controller {
  const [state, setState] = React.useState<State>({
    filterQuery: props.currentRawFilterQuery ?? '',

    filterParseError: undefined,

    showSyntaxDocumentation: false,
  });

  return {
    state: state,

    setFilterQuery: (query): void => {
      setState((state) => merge(state, { filterQuery: query }));
    },

    applyOrRemoveFilter: (): void => {
      if (state.filterQuery.trim() === '') {
        props.removeFilter();
        return;
      }

      const filterQueryParseResult = parseFilterQuery(state.filterQuery);
      if (!filterQueryParseResult.success) {
        setState((state) =>
          merge(state, { filterParseError: filterQueryParseResult.error }),
        );
        return;
      }

      props.applyFilter(filterQueryParseResult.data, state.filterQuery);
    },

    toggleShowSyntaxDocumentation: (): void => {
      setState((state) =>
        merge(state, {
          showSyntaxDocumentation: !state.showSyntaxDocumentation,
        }),
      );
    },
  };
}
