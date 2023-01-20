import { Alert, List } from '@mui/material';
import React from 'react';

import { useServiceDocsServiceContext } from '../../../services/service-docs-service';

import {
  ResponsibleWithServiceDocs,
  SingleResponsible,
} from './single-responsible';

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
            <SingleResponsible
              key={singleResponsible.responsibleName}
              responsible={singleResponsible}
            />
          ))}
        </List>
      )}
    </React.Fragment>
  );
};

interface Controller {
  responsibles: ResponsibleWithServiceDocs[];
}
function useController(): Controller {
  const serviceDocsService = useServiceDocsServiceContext();

  const responsibles = React.useMemo((): ResponsibleWithServiceDocs[] => {
    const responsiblesByName: Record<string, ResponsibleWithServiceDocs> = {};

    for (const singleServiceDoc of serviceDocsService.serviceDocs) {
      if (!singleServiceDoc.responsibles) {
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
    result.sort((a, b) => {
      return a.responsibleName.localeCompare(b.responsibleName);
    });

    return result;
  }, [serviceDocsService.serviceDocs]);

  return {
    responsibles: responsibles,
  };
}
