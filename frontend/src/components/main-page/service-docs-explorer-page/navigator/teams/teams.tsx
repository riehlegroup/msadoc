import { Alert, List } from '@mui/material';
import React from 'react';

import { ServiceNode } from '../../../service-docs-tree';
import { useServiceDocsServiceContext } from '../../../services/service-docs-service';

import { TeamItem } from './team-item';

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
            <TeamItem
              key={singleTeam.teamName ?? 'no-team'}
              teamName={singleTeam.teamName}
              serviceDocs={singleTeam.correspondingServiceDocs}
            />
          ))}
        </List>
      )}
    </React.Fragment>
  );
};

/**
 * Service Docs grouped by a particular Team.
 */
interface TeamWithServiceDocs {
  teamName: string | undefined;
  correspondingServiceDocs: ServiceNode[];
}

interface Controller {
  teams: TeamWithServiceDocs[];
}
function useController(): Controller {
  const serviceDocsService = useServiceDocsServiceContext();

  const teams = React.useMemo((): TeamWithServiceDocs[] => {
    const result = groupServiceDocsByTeams(serviceDocsService.serviceDocs);
    result.sort((a, b) => {
      // Move the element that contains the items without a Team to the end.
      if (a.teamName === undefined || b.teamName === undefined) {
        return 1;
      }

      return a.teamName.localeCompare(b.teamName);
    });

    return result;
  }, [serviceDocsService.serviceDocs]);

  return {
    teams: teams,
  };
}

function groupServiceDocsByTeams(
  serviceDocs: ServiceNode[],
): TeamWithServiceDocs[] {
  const teamsByName: Record<string, TeamWithServiceDocs> = {};
  const serviceDocsWithoutTeam: ServiceNode[] = [];

  for (const singleServiceDoc of serviceDocs) {
    if (singleServiceDoc.responsibleTeam === undefined) {
      serviceDocsWithoutTeam.push(singleServiceDoc);
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

  if (serviceDocsWithoutTeam.length > 0) {
    result.push({
      teamName: undefined,
      correspondingServiceDocs: serviceDocsWithoutTeam,
    });
  }

  return result;
}
