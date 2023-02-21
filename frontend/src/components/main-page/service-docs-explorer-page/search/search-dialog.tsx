import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  List,
  ListItemButton,
  ListItemText,
  TextField,
} from '@mui/material';
import React from 'react';
import { generatePath, useNavigate } from 'react-router-dom';

import { SERVICE_DOCS_EXPLORER_ROUTES_ABS } from '../../../../routes';
import { merge } from '../../../../utils/merge';
import { ServiceNode } from '../../service-docs-tree';
import { useServiceDocsServiceContext } from '../../services/service-docs-service';

interface Props {
  close: () => void;
}
export const SearchDialog: React.FC<Props> = (props) => {
  const controller = useController();

  return (
    <Dialog
      maxWidth={false}
      /* The following line moves the dialog to the top. */
      PaperProps={{ sx: { alignSelf: 'start' } }}
      open
      onClose={(): void => props.close()}
    >
      <DialogTitle>Find Service</DialogTitle>

      <DialogContent sx={{ width: '700px', maxWidth: '100%' }} dividers>
        <Box>
          <TextField
            sx={{ width: '100%' }}
            label="Service Name"
            value={controller.state.searchQuery}
            onChange={(e): void => controller.setSearchQuery(e.target.value)}
          />
        </Box>

        {controller.searchResults.length < 1 && (
          <Alert severity="info" sx={{ marginTop: 2 }}>
            No matching results
          </Alert>
        )}

        {controller.searchResults.length > 0 && (
          <Box sx={{ maxHeight: '300px', overflowY: 'scroll' }}>
            <List component="div">
              {controller.searchResults.map((searchResultItem) => (
                <ListItemButton
                  key={searchResultItem.serviceDoc.name}
                  onClick={(): void => {
                    controller.navigateToService(searchResultItem.serviceDoc);
                    props.close();
                  }}
                >
                  <ListItemText>
                    {searchResultItem.highlightNameRange ? (
                      <HighlightTextAtRange
                        text={searchResultItem.serviceDoc.name}
                        range={searchResultItem.highlightNameRange}
                      />
                    ) : (
                      <span>{searchResultItem.serviceDoc.name}</span>
                    )}
                  </ListItemText>
                </ListItemButton>
              ))}
            </List>
          </Box>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={(): void => props.close()}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};

interface SearchResultItem {
  serviceDoc: ServiceNode;

  /**
   * The range in the name of the Service Doc to highlight.
   *
   * The end of the range is exclusive: `[3,5]` highlights the characters at indexes 3 to 4.
   */
  highlightNameRange?: [number, number];
}
interface State {
  searchQuery: string;
}
interface Controller {
  state: State;

  searchResults: SearchResultItem[];

  setSearchQuery: (query: string) => void;
  navigateToService: (service: ServiceNode) => void;
}
function useController(): Controller {
  const navigate = useNavigate();
  const serviceDocsService = useServiceDocsServiceContext();

  const [state, setState] = React.useState<State>({
    searchQuery: '',
  });

  const searchResult = React.useMemo((): SearchResultItem[] => {
    const result: SearchResultItem[] = [];

    const preparedSearchQuery = state.searchQuery.trim().toLowerCase();

    for (const singleServiceDoc of serviceDocsService.serviceDocs) {
      // The search query is empty? Then we simply want to show all services.
      if (preparedSearchQuery === '') {
        result.push({ serviceDoc: singleServiceDoc });
        continue;
      }

      const index = singleServiceDoc.name
        .toLowerCase()
        .indexOf(preparedSearchQuery);
      if (index < 0) {
        continue;
      }

      result.push({
        serviceDoc: singleServiceDoc,
        highlightNameRange: [index, index + state.searchQuery.length],
      });
    }

    result.sort((a, b) => {
      return a.serviceDoc.name.localeCompare(b.serviceDoc.name);
    });

    return result;
  }, [serviceDocsService.serviceDocs, state.searchQuery]);

  return {
    state: state,

    searchResults: searchResult,

    setSearchQuery: (query): void => {
      setState((state) => merge(state, { searchQuery: query }));
    },
    navigateToService: (service): void => {
      navigate(
        generatePath(SERVICE_DOCS_EXPLORER_ROUTES_ABS.service, {
          service: service.name,
        }),
      );
    },
  };
}

interface HighlightTextAtRangeProps {
  text: string;

  /**
   * The range in the {@link text} to highlight.
   *
   * The end of the range is exclusive: `[3,5]` highlights the characters at indexes 3 to 4.
   */
  range: [number, number];
}
const HighlightTextAtRange: React.FC<HighlightTextAtRangeProps> = (props) => {
  const textBeforeRange = props.text.slice(0, props.range[0]);
  const textToHighlight = props.text.slice(props.range[0], props.range[1]);
  const textAfterRange = props.text.slice(props.range[1]);

  return (
    <span>
      <span>{textBeforeRange}</span>
      <span style={{ textDecoration: 'underline', fontWeight: 700 }}>
        {textToHighlight}
      </span>
      <span>{textAfterRange}</span>
    </span>
  );
};
