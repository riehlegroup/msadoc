import { Box, Slider } from '@mui/material';
import React from 'react';

interface Props {
  maxDepth: number;
  onChange: (newValue: number) => void;
}

export const DepthSlider: React.FC<Props> = (props) => {
  const controller = useController(props);

  const graphDepthMarks = [
    {
      value: props.maxDepth,
      label: `full depth`,
    },
  ];
  let i = 1;
  for (; i < props.maxDepth; ++i) {
    graphDepthMarks.push({
      value: i,
      label: `${i}`,
    });
  }

  const handleDepthChange = (event: Event, value: number | number[]): void => {
    if (typeof value === 'number') {
      controller.updateDepth(value);
      props.onChange(value);
    }
  };

  return (
    <React.Fragment>
      <Box width={300} marginLeft="auto" marginRight="auto" paddingTop="2em">
        <Slider
          size="small"
          defaultValue={props.maxDepth}
          min={1}
          max={props.maxDepth}
          aria-label="Small"
          marks={graphDepthMarks}
          step={1}
          onChange={handleDepthChange}
        />
      </Box>
    </React.Fragment>
  );
};

interface State {
  depth: number;
}

interface Controller {
  state: State;
  updateDepth: (newDepth: number) => void;
}

function useController(props: Props): Controller {
  const [state, setState] = React.useState<State>({
    depth: props.maxDepth,
  });

  return {
    state: state,
    updateDepth: (newDepth: number): void => {
      setState({
        depth: newDepth,
      });
    },
  };
}
