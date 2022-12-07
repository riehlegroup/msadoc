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
      controller.setState({ ...controller.state, selectedDepth: value });
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
  selectedDepth: number;
  maxDepth: number;
}

interface Controller {
  state: State;
  setState: (newState: State) => void;
}

function useController(props: Props): Controller {
  const [state, setState] = React.useState<State>({
    selectedDepth: props.maxDepth,
    maxDepth: props.maxDepth,
  });

  React.useEffect(() => {
    setState((state) => ({ ...state, maxDepth: props.maxDepth }));
  }, [props.maxDepth]);

  return {
    state: state,
    setState: setState,
  };
}
