import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import React from 'react';

import { ServiceNode } from '../../service-docs-tree';

interface Props {
  showExtensionFieldsFor: ServiceNode;
}
export const ExtensionFields: React.FC<Props> = (props) => {
  return (
    <React.Fragment>
      {props.showExtensionFieldsFor.extensions && (
        <React.Fragment>
          <Typography variant="h4">Extensions</Typography>

          <Table sx={{ tableLayout: 'fixed' }}>
            <TableHead>
              <TableRow>
                <TableCell>Key</TableCell>
                <TableCell>Value</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {Object.entries(props.showExtensionFieldsFor.extensions).map(
                ([key, value]) => (
                  <TableRow key={key}>
                    <TableCell>{key}</TableCell>

                    <TableCell>
                      {Array.isArray(value) && (
                        <React.Fragment>
                          {value.length < 1 && <i>{`(Empty array)`}</i>}

                          {value.length > 0 && (
                            <ul>
                              {value.map((singleArrayValue, index) => (
                                // eslint-disable-next-line react/no-array-index-key
                                <li key={index}>
                                  <PrimitiveValue value={singleArrayValue} />
                                </li>
                              ))}
                            </ul>
                          )}
                        </React.Fragment>
                      )}

                      {!Array.isArray(value) && (
                        <PrimitiveValue value={value} />
                      )}
                    </TableCell>
                  </TableRow>
                ),
              )}
            </TableBody>
          </Table>
        </React.Fragment>
      )}
    </React.Fragment>
  );
};

interface PrimitiveValueProps {
  value: string | number | boolean;
}
const PrimitiveValue: React.FC<PrimitiveValueProps> = (props) => {
  return (
    <span style={{ wordBreak: 'break-all' }}>
      {typeof props.value === 'string' && (
        <React.Fragment>
          {props.value.trim() === '' ? (
            <i>{`(Empty string)`}</i>
          ) : (
            <React.Fragment>{props.value}</React.Fragment>
          )}
        </React.Fragment>
      )}

      {typeof props.value === 'number' && (
        <React.Fragment>{props.value}</React.Fragment>
      )}

      {typeof props.value === 'boolean' && (
        <b>{props.value === true ? 'true' : 'false'}</b>
      )}
    </span>
  );
};
