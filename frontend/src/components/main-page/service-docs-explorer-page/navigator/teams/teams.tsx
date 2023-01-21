import { Alert, List } from '@mui/material';
import React from 'react';

import { useServiceDocsServiceContext } from '../../../services/service-docs-service';

import { SingleTeam, TeamWithServiceDocs } from './single-team';

export const Teams: React.FC = () => {
  const controller = useController();

  return (
    <React.Fragment>
      {controller.teams.length < 1 && (
        <Alert severity="info">No teams found</Alert>
      )}

      {controller.teams.length > 0 && (
        <List component="div" disablePadding>
          {controller.teams.map((singleTeam) => (
            <SingleTeam key={singleTeam.teamName} team={singleTeam} />
          ))}
        </List>
      )}
    </React.Fragment>
  );
};

interface Controller {
  teams: TeamWithServiceDocs[];
}
function useController(): Controller {
  const serviceDocsService = useServiceDocsServiceContext();

  const teams = React.useMemo((): TeamWithServiceDocs[] => {
    const teamsByName: Record<string, TeamWithServiceDocs> = {};

    for (const singleServiceDoc of serviceDocsService.serviceDocs) {
      if (singleServiceDoc.responsibleTeam === undefined) {
        continue;
      }

      let mapEntry = teamsByName[singleServiceDoc.responsibleTeam];

      if (!mapEntry) {
        mapEntry = {
          teamName: singleServiceDoc.responsibleTeam,
          correspondingServiceDocs: [],
        };
        teamsByName[singleServiceDoc.responsibleTeam] = mapEntry;
      }

      mapEntry.correspondingServiceDocs.push(singleServiceDoc);
    }

    const result = Object.values(teamsByName);
    result.sort((a, b) => {
      return a.teamName.localeCompare(b.teamName);
    });

    return result;
  }, [serviceDocsService.serviceDocs]);

  return {
    teams: teams,
  };
}
