import React from 'react';
import { useNavigate } from 'react-router-dom';

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
      <h3>Login Page</h3>

      {controller.state.viewState === ViewState.IsLoading && (
        <div>Loading...</div>
      )}
      {controller.state.viewState === ViewState.WrongUsernameOrPassword && (
        <div>Wrong username or password</div>
      )}
      {controller.state.viewState === ViewState.UnknownError && (
        <div>Unknown error, please try again</div>
      )}

      <input
        type="text"
        value={controller.state.username}
        onChange={(e): void => controller.setUsername(e.target.value)}
      />
      <input
        type="password"
        value={controller.state.password}
        onChange={(e): void => controller.setPassword(e.target.value)}
      />

      <button
        type="button"
        onClick={(): void => void controller.performLogin()}
      >
        Login
      </button>
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
        navigate('/main');
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
