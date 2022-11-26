import { Alert, Box, Chip, Typography } from '@mui/material';
import React from 'react';

export const SyntaxDocumentation: React.FC = () => {
  return (
    <React.Fragment>
      <Alert severity="info">
        Tip: An empty search query always matches all available Service Docs.
        Thus, to deactivate the filter, simply clear the query.
      </Alert>
      <Typography variant="h4" sx={{ marginY: 2 }}>
        Syntax Documentation
      </Typography>
      <Typography variant="h5">Basics</Typography>
      <Box>
        Filter queries are written using <Chip size="small" label="key:value" />{' '}
        pairs such as
        <Example example="tag:ImportantService" />
      </Box>
      <Box sx={{ marginY: 3 }}>
        Both keys and values are case-insensitive: For instance,
        <Example example="tag:importantservice" />
        and
        <Example example="TAG:ImportantService" />
        are equivalent.
      </Box>
      <Box sx={{ marginY: 3 }}>
        Even though this is considered an anti-pattern, values found in a
        Service Doc may include spaces. To search for a value using spaces,
        enclose the value in double quotes:
        <Example example='tag:"important service"' />
      </Box>
      <Typography variant="h5">Available keys</Typography>
      The following keys are available:
      <ul>
        <li>name</li>
        <li>tag</li>
        <li>group</li>
        <li>repository</li>
        <li>taskBoard</li>
        <li>providedAPI</li>
        <li>consumedAPI</li>
        <li>publishedEvent</li>
        <li>subscribedEvent</li>
        <li>developmentDocumentation</li>
        <li>deploymentDocumentation</li>
        <li>APIDocumentation</li>
        <li>responsibleTeam</li>
        <li>responsible</li>
      </ul>
      <Typography variant="h5">Wildcards</Typography>
      <Box>
        You can use wildcards to perform matching against substrings. For
        example,
        <Example example="name:*service" />
        will match all Service Docs having a name ending on {'"service"'}.
      </Box>
      <Box sx={{ marginY: 3 }}>
        Wildcards may appear multiple times, so you can write a query like
        <Example example="name:*important*service*" />
        if you want to match any service with a name containing the words{' '}
        {'"important"'} and {'"service"'} in this particular order.
      </Box>
      <Typography variant="h5">The empty value</Typography>
      There is one special value called <Chip size="small" label="%empty%" />.
      This value matches:
      <ul>
        <li>Undefined values</li>
        <li>
          Empty strings, if the corresponding element in the Service Doc is a
          string
        </li>
        <li>
          Empty arrays, if the corresponding element in the Service Doc is an
          array
        </li>
      </ul>
      <Box>
        For instance, to find all services where the development documentation
        has not been defined, you can use a query like
        <Example example="developmentDocumentation:%empty%" />
      </Box>
      <Box sx={{ marginY: 3 }}>
        If you want to find all services where no Responsibles have been
        defined, use the following query:
        <Example example="responsible:%empty%" />
        <Alert severity="info">
          Please note that in this example, we match all Service Docs where the{' '}
          {'"responsibles"'} field either does not exist, or is an empty array.
          We do <b>NOT</b> match Service docs where one of the values in the{' '}
          {'"responsibles"'} array is the empty string.
        </Alert>
      </Box>
      <Typography variant="h5">Logical operators</Typography>
      <Box>
        The key-value pairs can be combined using the{' '}
        <Chip size="small" label="AND" /> operator. For example, you can use the
        query
        <Example example="name:important* AND tag:production" />
        to match all services where the name starts with {'"important"'} and a
        tag is {'"production"'}. A shorthand for this query is:
        <Example example="name:important* tag:production" />
      </Box>
      <Box sx={{ marginY: 3 }}>
        Similar to the <Chip size="small" label="AND" /> operator, there is the{' '}
        <Chip size="small" label="OR" /> operator to perform either-or matching.
        For example, the query
        <Example example="name:important* OR tag:production" />
        matches all services where either the name starts with {'"important"'},
        or a tag is {'"production"'}.
      </Box>
      <Box sx={{ marginY: 3 }}>
        To negate a subquery, use the <Chip size="small" label="NOT" />{' '}
        operator. For instance, the query
        <Example example="NOT tag:production" />
        will match all services that do not have the tag {'"production"'}.
      </Box>
      <Box sx={{ marginY: 3 }}>
        You can use an arbitrary number of nested subqueries:
        <Example example="(name:important* OR tag:production) AND NOT tag:stale" />
      </Box>
    </React.Fragment>
  );
};

interface ExampleProps {
  example: string;
}
const Example: React.FC<ExampleProps> = (props) => {
  return (
    <Box
      sx={{
        background: (theme) => theme.palette.grey[200],
        borderRadius: 2,
        paddingX: 2,
        paddingY: 1,
        marginY: 1,
      }}
    >
      <code>{props.example}</code>
    </Box>
  );
};
