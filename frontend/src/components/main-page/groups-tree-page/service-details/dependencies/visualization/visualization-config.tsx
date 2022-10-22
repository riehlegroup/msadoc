import { Checkbox, FormControlLabel, FormGroup } from '@mui/material';
import React from 'react';

import { SankeyConfig } from './sankey-utils';

interface Props {
  sankeyConfig: SankeyConfig;

  setSankeyConfig: (newSankeyConfig: SankeyConfig) => void;
}
export const VisualizationConfig: React.FC<Props> = (props) => {
  return (
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
  );
};
