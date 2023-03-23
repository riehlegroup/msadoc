import { Box, IconButton, Stack, Tooltip } from '@mui/material';
import React from 'react';
import { useMatch, useNavigate } from 'react-router-dom';

import { Icons } from '../../icons';
import { MAIN_PAGE_ROUTES_ABS } from '../../routes';
import { useAuthDataServiceContext } from '../../services/auth-data-service';

interface Props {
  reloadServiceDocs: () => void;
}
export const LeftMenu: React.FC<Props> = (props) => {
  const controller = useController();

  return (
    <Box
      sx={{
        display: 'flex',
        height: '100%',
        flexDirection: 'column',
        justifyContent: 'space-between',
        background: (theme) => theme.palette.primary.dark,
      }}
    >
      <Stack sx={{ width: '100%' }}>
        <NavButtonWithRouterTarget
          routerTarget={MAIN_PAGE_ROUTES_ABS.serviceDocsExplorer}
          tooltipText="Service Docs Explorer"
        >
          <Icons.AccountTree fontSize="inherit" />
        </NavButtonWithRouterTarget>

        <NavButtonWithRouterTarget
          routerTarget={MAIN_PAGE_ROUTES_ABS.apiKeys}
          tooltipText="API Keys"
        >
          <Icons.Key fontSize="inherit" />
        </NavButtonWithRouterTarget>
      </Stack>
      <Box>
        <Stack sx={{ width: '100%' }}>
          <NavButton
            tooltipText="Reload Service Docs"
            onClick={(): void => props.reloadServiceDocs()}
          >
            <Icons.Refresh fontSize="inherit" />
          </NavButton>

          <NavButton
            tooltipText="Logout"
            onClick={(): void => controller.performLogout()}
          >
            <Icons.Logout fontSize="inherit" />
          </NavButton>
        </Stack>
      </Box>
    </Box>
  );
};

interface Controller {
  performLogout: () => void;
}
function useController(): Controller {
  const navigate = useNavigate();
  const authDataService = useAuthDataServiceContext();

  return {
    performLogout: (): void => {
      authDataService.deleteAccessAndRefreshToken();
      navigate('/');
    },
  };
}

interface NavButtonProps {
  tooltipText: string;
  children: React.ReactNode;
  highlight?: boolean;
  onClick?: () => void;
}
const NavButton: React.FC<NavButtonProps> = (props) => {
  return (
    <Tooltip title={props.tooltipText} placement="right">
      <IconButton
        size="large"
        sx={{
          width: '100%',
          height: '70px',
          borderRadius: 0,
          color: props.highlight === true ? '#ffffff' : 'rgba(255,255,255,0.5)',
          background:
            props.highlight === true ? 'rgba(255,255,255,0.2)' : 'none',
          '&:hover': {
            color:
              props.highlight === true ? '#ffffff' : 'rgba(255,255,255,0.8)',
            background:
              props.highlight === true ? 'rgba(255,255,255,0.2)' : 'none',
          },
        }}
        onClick={(): void => props.onClick?.()}
      >
        {props.children}
      </IconButton>
    </Tooltip>
  );
};

interface NavButtonWithRouterTargetProps
  extends Omit<NavButtonProps, 'highlight' | 'onClick'> {
  routerTarget: string;
}
const NavButtonWithRouterTarget: React.FC<NavButtonWithRouterTargetProps> = (
  props,
) => {
  const navigate = useNavigate();

  const isRouteMatching =
    useMatch({ path: props.routerTarget, end: false }) != null;

  return (
    <NavButton
      {...props}
      highlight={isRouteMatching}
      onClick={(): void => navigate(props.routerTarget)}
    />
  );
};
