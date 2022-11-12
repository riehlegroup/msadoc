import { Alert, Box, Chip, Typography } from '@mui/material';
import React from 'react';
import { generatePath, useNavigate } from 'react-router-dom';

import { GROUPS_TREE_ROUTES_ABS } from '../../../../../routes';
import { addMultipleItemsToSet } from '../../../../../utils/set';
import { RegularGroupNode, RootGroupNode } from '../../../service-docs-tree';
import { extractAllServices } from '../../../utils/service-docs-tree-utils';

import { ResponsibleDetails } from './responsible-details';
import { TeamDetails } from './team-details';

interface Props {
  showResponsiblesFor: RegularGroupNode | RootGroupNode;
}
export const GroupResponsibilities: React.FC<Props> = (props) => {
  const controller = useController(props);

  return (
    <React.Fragment>
      <Typography variant="h5" component="div" sx={{ marginBottom: 2 }}>
        Responsible Teams
      </Typography>

      {controller.teams.length < 1 && (
        <Alert severity="info">No responsible teams defined</Alert>
      )}

      {controller.teams.length > 0 && (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
          {controller.teams.map((singleTeam) => (
            <Chip
              key={singleTeam}
              label={singleTeam}
              onClick={(): void =>
                controller.setViewState({
                  mode: 'show-team-details',
                  team: singleTeam,
                })
              }
            />
          ))}
        </Box>
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

  teams: string[];
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

  const [teams, responsibles] = React.useMemo((): [string[], string[]] => {
    const allTeams = new Set<string>();
    const allResponsibles = new Set<string>();

    const allServices = extractAllServices(props.showResponsiblesFor);
    for (const singleService of allServices) {
      if (singleService.responsibleTeam !== undefined) {
        allTeams.add(singleService.responsibleTeam);
      }

      addMultipleItemsToSet(singleService.responsibles ?? [], allResponsibles);
    }

    const sortedTeams = Array.from(allTeams);
    sortedTeams.sort((a, b) => {
      return a.localeCompare(b);
    });

    const sortedResponsibles = Array.from(allResponsibles);
    sortedResponsibles.sort((a, b) => {
      return a.localeCompare(b);
    });

    return [sortedTeams, sortedResponsibles];
  }, [props.showResponsiblesFor]);

  return {
    state: state,

    teams: teams,
    responsibles: responsibles,

    setViewState: (viewState): void => {
      setState((state) => ({ ...state, viewState: viewState }));
    },

    goToService: (serviceName: string): void => {
      navigate(
        generatePath(GROUPS_TREE_ROUTES_ABS.service, {
          service: serviceName,
        }),
      );
    },
  };
}
