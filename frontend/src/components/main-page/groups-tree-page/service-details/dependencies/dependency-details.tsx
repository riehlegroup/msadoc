import { Dialog, DialogContent, Typography } from '@mui/material';
import React from 'react';

import {
  ServiceDocsTreeAPINode,
  ServiceDocsTreeEventNode,
  ServiceDocsTreeNodeType,
  ServiceDocsTreeServiceNode,
} from '../../../service-docs-tree';

import { DependencyDetailsItem } from './dependency-details-item';

interface Props {
  dependency: ServiceDocsTreeAPINode | ServiceDocsTreeEventNode;

  currentService: ServiceDocsTreeServiceNode;

  close: () => void;
  goToService: (serviceName: string) => void;
}
export const DependencyDetails: React.FC<Props> = (props) => {
  return (
    <Dialog open onClose={(): void => props.close()}>
      <DialogContent sx={{ width: '500px' }}>
        <Typography variant="h4" sx={{ overflowWrap: 'anywhere' }}>
          {props.dependency.type === ServiceDocsTreeNodeType.API
            ? 'API Details'
            : 'Event Details'}
        </Typography>

        <Typography variant="subtitle1">
          {props.dependency.type === ServiceDocsTreeNodeType.API
            ? `API "${props.dependency.name}" has the following Providers and Consumers.`
            : `Event "${props.dependency.name}" has the following Producers and Consumers.`}
        </Typography>

        {props.dependency.type === ServiceDocsTreeNodeType.API && (
          <React.Fragment>
            <DependencyDetailsItem
              dependency={props.dependency}
              mode="providers"
              currentService={props.currentService}
              goToService={props.goToService}
            />
            <DependencyDetailsItem
              dependency={props.dependency}
              mode="consumers"
              currentService={props.currentService}
              goToService={props.goToService}
            />
          </React.Fragment>
        )}

        {props.dependency.type === ServiceDocsTreeNodeType.Event && (
          <React.Fragment>
            <DependencyDetailsItem
              dependency={props.dependency}
              mode="producers"
              currentService={props.currentService}
              goToService={props.goToService}
            />
            <DependencyDetailsItem
              dependency={props.dependency}
              mode="consumers"
              currentService={props.currentService}
              goToService={props.goToService}
            />
          </React.Fragment>
        )}
      </DialogContent>
    </Dialog>
  );
};
