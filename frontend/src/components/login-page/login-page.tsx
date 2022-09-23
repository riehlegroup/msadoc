import { LoadingButton } from '@mui/lab';
import { Box, Stack, TextField, Typography } from '@mui/material';
import Grid from '@mui/material/Unstable_Grid2';
import React from 'react';
import { useNavigate } from 'react-router-dom';

import { APP_ROUTES } from '../../routes';
import { useHttpServiceContext } from '../../services/http-service';

enum ViewState {
  Default,
  IsLoading,
  WrongUsernameOrPassword,
  UnknownError,
}

export const LoginPage: React.FC = () => {
  const controller = useController();

  return (
    <React.Fragment>
      <Grid sx={{ height: '100%' }} container>
        <Grid
          xs={4}
          sx={{
            background: (theme) => theme.palette.primary.dark,
            padding: 2,
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <Box>
            <Box sx={{ position: 'relative' }}>
              <Typography
                variant="h3"
                sx={{
                  color: '#ffffff',
                  fontWeight: 700,
                  letterSpacing: '0.15em',
                  marginLeft: '1.5rem',
                }}
              >
                msadoc
              </Typography>

              {/* A semi-transparent highlight element. */}
              <Box
                sx={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  display: 'block',
                  width: '8rem',
                  height: '1.3rem',
                  background: 'rgba(255,255,255,0.2)',
                  pointerEvents: 'none',
                }}
              />
            </Box>

            <Box>
              <Typography
                variant="h5"
                sx={{
                  color: '#ffffff',
                  fontWeight: 300,
                  letterSpacing: '0.1em',
                  marginTop: '1rem',
                  marginLeft: '1.5rem',
                }}
              >
                Recentralize decentralized documentation!
              </Typography>
            </Box>
          </Box>
        </Grid>

        <Grid
          xs={8}
          sx={{
            padding: 4,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Box sx={{ width: '100%', maxWidth: '500px' }}>
            <form
              onSubmit={(e): void => {
                e.preventDefault();
                void controller.performLogin();
              }}
            >
              <Stack spacing={2}>
                <Typography variant="h4">Login</Typography>

                {controller.state.viewState ===
                  ViewState.WrongUsernameOrPassword && (
                  <Box
                    sx={{
                      color: (theme) => theme.palette.error.main,
                    }}
                  >
                    Wrong username or password
                  </Box>
                )}
                {controller.state.viewState === ViewState.UnknownError && (
                  <Box
                    sx={{
                      color: (theme) => theme.palette.error.main,
                    }}
                  >
                    Unknown error, please try again
                  </Box>
                )}

                <TextField
                  label="Username"
                  value={controller.state.username}
                  onChange={(e): void => controller.setUsername(e.target.value)}
                />
                <TextField
                  type="password"
                  label="Password"
                  value={controller.state.password}
                  onChange={(e): void => controller.setPassword(e.target.value)}
                />

                <LoadingButton
                  variant="contained"
                  loading={controller.state.viewState === ViewState.IsLoading}
                  type="submit"
                >
                  Login
                </LoadingButton>
              </Stack>
            </form>
          </Box>
        </Grid>
      </Grid>
    </React.Fragment>
  );
};

interface State {
  username: string;
  password: string;

  viewState: ViewState;
}
interface Controller {
  state: State;

  setUsername: (username: string) => void;
  setPassword: (password: string) => void;

  performLogin: () => Promise<void>;
}
function useController(): Controller {
  const [state, setState] = React.useState<State>({
    username: '',
    password: '',
    viewState: ViewState.Default,
  });

  const navigate = useNavigate();
  const httpService = useHttpServiceContext();

  return {
    state: state,

    setUsername: (username): void => {
      setState((state) => ({ ...state, username: username }));
    },
    setPassword: (password): void => {
      setState((state) => ({ ...state, password: password }));
    },
    performLogin: async (): Promise<void> => {
      setState((state) => ({ ...state, viewState: ViewState.IsLoading }));
      const loginResponse = await httpService.performLogin(
        state.username,
        state.password,
      );

      if (loginResponse.status === 200) {
        navigate(APP_ROUTES.main);
        return;
      }
      if (loginResponse.status === 401) {
        setState((state) => ({
          ...state,
          viewState: ViewState.WrongUsernameOrPassword,
        }));
        return;
      }
      setState((state) => ({ ...state, viewState: ViewState.UnknownError }));
    },
  };
}
