import { Alert, List } from '@mui/material';
import React from 'react';

import { ServiceNode } from '../../../service-docs-tree';
import { useServiceDocsServiceContext } from '../../../services/service-docs-service';

import { ResponsibleItem } from './responsible-item';

export const Responsibles: React.FC = () => {
  const controller = useController();

  return (
    <React.Fragment>
      {controller.responsibles.length < 1 && (
        <Alert severity="info">No Responsibles found</Alert>
      )}

      {controller.responsibles.length > 0 && (
        <List component="div" disablePadding>
          {controller.responsibles.map((singleResponsible) => (
            <ResponsibleItem
              key={singleResponsible.responsibleName ?? 'no-responsible'}
              responsibleName={singleResponsible.responsibleName}
              serviceDocs={singleResponsible.correspondingServiceDocs}
            />
          ))}
        </List>
      )}
    </React.Fragment>
  );
};

/**
 * Service Docs grouped by a particular Responsible.
 */
interface ResponsibleWithServiceDocs {
  responsibleName: string | undefined;
  correspondingServiceDocs: ServiceNode[];
}

interface Controller {
  responsibles: ResponsibleWithServiceDocs[];
}
function useController(): Controller {
  const serviceDocsService = useServiceDocsServiceContext();

  const responsibles = React.useMemo((): ResponsibleWithServiceDocs[] => {
    const result = groupServiceDocsByResponsibles(
      serviceDocsService.serviceDocs,
    );
    result.sort((a, b) => {
      // Move the element that contains the items without a Responsible to the end.
      if (a.responsibleName === undefined || b.responsibleName === undefined) {
        return 1;
      }

      return a.responsibleName.localeCompare(b.responsibleName);
    });

    return result;
  }, [serviceDocsService.serviceDocs]);

  return {
    responsibles: responsibles,
  };
}

function groupServiceDocsByResponsibles(
  serviceDocs: ServiceNode[],
): ResponsibleWithServiceDocs[] {
  const responsiblesByName: Record<string, ResponsibleWithServiceDocs> = {};
  const serviceDocsWithoutResponsible: ServiceNode[] = [];

  for (const singleServiceDoc of serviceDocs) {
    if (
      !singleServiceDoc.responsibles ||
      singleServiceDoc.responsibles.length < 1
    ) {
      serviceDocsWithoutResponsible.push(singleServiceDoc);
      continue;
    }

    for (const singleResponsible of singleServiceDoc.responsibles) {
      let mapEntry = responsiblesByName[singleResponsible];

      if (!mapEntry) {
        mapEntry = {
          responsibleName: singleResponsible,
          correspondingServiceDocs: [],
        };
        responsiblesByName[singleResponsible] = mapEntry;
      }

      mapEntry.correspondingServiceDocs.push(singleServiceDoc);
    }
  }

  const result = Object.values(responsiblesByName);

  if (serviceDocsWithoutResponsible.length > 0) {
    result.push({
      responsibleName: undefined,
      correspondingServiceDocs: serviceDocsWithoutResponsible,
    });
  }

  return result;
}
