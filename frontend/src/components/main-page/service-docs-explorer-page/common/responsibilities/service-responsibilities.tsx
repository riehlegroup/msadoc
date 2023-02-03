import {
  Alert,
  Box,
  Chip,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
} from '@mui/material';
import React from 'react';
import { generatePath, useNavigate } from 'react-router-dom';

import { Icons } from '../../../../../icons';
import { SERVICE_DOCS_EXPLORER_ROUTES_ABS } from '../../../../../routes';
import { merge } from '../../../../../utils/merge';
import { ServiceNode } from '../../../service-docs-tree';

import { ResponsibleDetails } from './responsible-details';
import { TeamDetails } from './team-details';

interface Props {
  showResponsiblesFor: ServiceNode;
}
export const ServiceResponsibilities: React.FC<Props> = (props) => {
  const controller = useController(props);

  return (
    <React.Fragment>
      {props.showResponsiblesFor.responsibleTeam === undefined && (
        <Alert severity="info">No responsible team defined</Alert>
      )}

      {props.showResponsiblesFor.responsibleTeam !== undefined && (
        <List component="div">
          <ListItemButton
            component="div"
            divider
            onClick={(): void => {
              if (props.showResponsiblesFor.responsibleTeam === undefined) {
                return;
              }
              controller.setViewState({
                mode: 'show-team-details',
                team: props.showResponsiblesFor.responsibleTeam,
              });
            }}
          >
            <ListItemIcon>
              <Icons.Badge />
            </ListItemIcon>
            <ListItemText
              primary={props.showResponsiblesFor.responsibleTeam}
              secondary="Responsible team"
            />
          </ListItemButton>
        </List>
      )}

      <Typography variant="h5" component="div" sx={{ marginY: 2 }}>
        Responsibles
      </Typography>

      {controller.responsibles.length < 1 && (
        <Alert severity="info">No Responsibles defined</Alert>
      )}

      {controller.responsibles.length > 0 && (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
          {controller.responsibles.map((singleResponsible) => (
            <Chip
              key={singleResponsible}
              label={singleResponsible}
              onClick={(): void =>
                controller.setViewState({
                  mode: 'show-responsible-details',
                  responsible: singleResponsible,
                })
              }
            />
          ))}
        </Box>
      )}

      {controller.state.viewState.mode === 'show-team-details' && (
        <TeamDetails
          team={controller.state.viewState.team}
          currentServiceOrGroup={props.showResponsiblesFor}
          close={(): void => controller.setViewState({ mode: 'default' })}
          goToService={(serviceName: string): void => {
            controller.setViewState({ mode: 'default' });
            controller.goToService(serviceName);
          }}
        />
      )}

      {controller.state.viewState.mode === 'show-responsible-details' && (
        <ResponsibleDetails
          responsible={controller.state.viewState.responsible}
          currentServiceOrGroup={props.showResponsiblesFor}
          close={(): void => controller.setViewState({ mode: 'default' })}
          goToService={(serviceName: string): void => {
            controller.setViewState({ mode: 'default' });
            controller.goToService(serviceName);
          }}
        />
      )}
    </React.Fragment>
  );
};

type ViewState =
  | DefaultViewState
  | ShowTeamDetailsViewState
  | ShowResponsibleDetailsViewState;
interface DefaultViewState {
  mode: 'default';
}
interface ShowTeamDetailsViewState {
  mode: 'show-team-details';
  team: string;
}
interface ShowResponsibleDetailsViewState {
  mode: 'show-responsible-details';
  responsible: string;
}

interface State {
  viewState: ViewState;
}
interface Controller {
  state: State;

  responsibles: string[];

  setViewState: (viewState: ViewState) => void;

  goToService: (serviceName: string) => void;
}
function useController(props: Props): Controller {
  const navigate = useNavigate();

  const [state, setState] = React.useState<State>({
    viewState: {
      mode: 'default',
    },
  });

  const responsibles = React.useMemo((): string[] => {
    if (!props.showResponsiblesFor.responsibles) {
      return [];
    }

    const result = [...props.showResponsiblesFor.responsibles];
    result.sort((a, b) => {
      return a.localeCompare(b);
    });

    return result;
  }, [props.showResponsiblesFor]);

  return {
    state: state,

    responsibles: responsibles,

    setViewState: (viewState): void => {
      setState((state) => merge(state, { viewState: viewState }));
    },

    goToService: (serviceName: string): void => {
      navigate(
        generatePath(SERVICE_DOCS_EXPLORER_ROUTES_ABS.service, {
          service: serviceName,
        }),
      );
    },
  };
}
