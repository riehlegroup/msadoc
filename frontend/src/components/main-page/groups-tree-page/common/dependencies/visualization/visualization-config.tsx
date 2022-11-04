import {
  Box,
  Checkbox,
  FormControl,
  FormControlLabel,
  FormGroup,
  FormHelperText,
  FormLabel,
} from '@mui/material';
import React from 'react';

import { ServiceDocsTreeNodeType } from '../../../../service-docs-tree';

import { SankeyConfig } from './sankey-data';

interface Props {
  sankeyConfig: SankeyConfig;

  setSankeyConfig: (newSankeyConfig: SankeyConfig) => void;
}
export const VisualizationConfig: React.FC<Props> = (props) => {
  return (
    <Box>
      <FormControl>
        <FormLabel>APIs and Events</FormLabel>

        <FormGroup>
          <FormControlLabel
            control={
              <Checkbox
                checked={props.sankeyConfig.includeAPIs}
                onChange={(e): void =>
                  props.setSankeyConfig({
                    ...props.sankeyConfig,
                    includeAPIs: e.target.checked,
                  })
                }
              />
            }
            label="Include APIs"
          />

          <FormControlLabel
            control={
              <Checkbox
                checked={props.sankeyConfig.includeEvents}
                onChange={(e): void =>
                  props.setSankeyConfig({
                    ...props.sankeyConfig,
                    includeEvents: e.target.checked,
                  })
                }
              />
            }
            label="Include Events"
          />
        </FormGroup>
      </FormControl>

      {props.sankeyConfig.pivotNode.type !==
        ServiceDocsTreeNodeType.RootGroup && (
        <FormControl sx={{ marginTop: 3 }}>
          <FormLabel>Unrelated entries</FormLabel>

          <FormControlLabel
            control={
              <Checkbox
                checked={props.sankeyConfig.includeUnrelatedEntries}
                onChange={(e): void =>
                  props.setSankeyConfig({
                    ...props.sankeyConfig,
                    includeUnrelatedEntries: e.target.checked,
                  })
                }
              />
            }
            label="Include unrelated entries"
          />

          <FormHelperText>
            {props.sankeyConfig.pivotNode.type ===
              ServiceDocsTreeNodeType.Service &&
              `Should entries be included that are not directly related to service "${props.sankeyConfig.pivotNode.name}"?`}

            {props.sankeyConfig.pivotNode.type ===
              ServiceDocsTreeNodeType.RegularGroup &&
              `Should entries be included that are not directly related to group "${props.sankeyConfig.pivotNode.identifier}"?`}
          </FormHelperText>
        </FormControl>
      )}
    </Box>
  );
};
