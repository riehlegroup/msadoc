import { Box, Slider } from '@mui/material';
import React from 'react';

interface Props {
  maxDepth: number;
  onChange: (newValue: number) => void;
}

export const DepthSlider: React.FC<Props> = (props) => {
  const controller = useController(props);

  const handleDepthChange = (event: Event, value: number | number[]): void => {
    if (typeof value === 'number') {
      controller.setState({ ...controller.state, selectedDepth: value });
      props.onChange(value);
    }
  };

  return (
    <Box
      sx={{
        width: '300px',
        marginLeft: 'auto',
        marginRight: 'auto',
        paddingTop: '1rem',
      }}
    >
      <Slider
        size="small"
        defaultValue={controller.state.maxDepth}
        min={1}
        max={controller.state.maxDepth}
        marks={controller.getSliderMarks()}
        step={1}
        onChange={handleDepthChange}
      />
    </Box>
  );
};

interface State {
  selectedDepth: number;
  maxDepth: number;
}

interface Controller {
  state: State;
  setState: (newState: State) => void;
  getSliderMarks(): Array<{ value: number; label: string }>;
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
    getSliderMarks: (): Array<{ value: number; label: string }> => {
      const graphDepthMarks = [];
      for (let i = 1; i < props.maxDepth; ++i) {
        graphDepthMarks.push({
          value: i,
          label: `${i}`,
        });
      }
      graphDepthMarks.push({
        value: props.maxDepth,
        label: `full depth`,
      });
      return graphDepthMarks;
    },
  };
}
