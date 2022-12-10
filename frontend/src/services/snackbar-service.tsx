import { Snackbar } from '@mui/material';
import React from 'react';

/**
 * The Snackbar Service makes it possible to create a Snackbar (i.e. a "Toast") in a programmatic way.
 *
 * Usage:
 *
 * ``` ts
 * function controller(): Controller {
 *   const snackbarService = useSnackbarService();
 *
 *   function doSomethingImportant(): void {
 *     snackbarService.showSnackbar('Hello World!');
 *   }
 * }
 * ```
 */
interface SnackbarService {
  /**
   * Show a Snackbar with the given message.
   * Please note that only one Snackbar can be displayed at a time.
   */
  showSnackbar: (message: string) => void;
}

interface SnackbarItem {
  message: string;
  uniqueKey: number;
}
interface InternalState {
  currentSnackbarItem: SnackbarItem | undefined;
}
interface InternalApi extends SnackbarService {
  internalState: InternalState;

  onSnackbarClose: () => void;
}

function useSnackbarService(): InternalApi {
  const [internalState, setInternalState] = React.useState<InternalState>({
    currentSnackbarItem: undefined,
  });

  return {
    showSnackbar: (message): void => {
      const snackbarItem: SnackbarItem = {
        message: message,
        uniqueKey: Math.random(),
      };
      setInternalState((internalState) => ({
        ...internalState,
        currentSnackbarItem: snackbarItem,
      }));
    },

    internalState: internalState,
    onSnackbarClose: (): void => {
      setInternalState((internalState) => ({
        ...internalState,
        currentSnackbarItem: undefined,
      }));
    },
  };
}

const SnackbarServiceContext = React.createContext<SnackbarService | undefined>(
  undefined,
);

interface Props {
  children?: React.ReactNode;
}
export const SnackbarServiceContextProvider: React.FC<Props> = (props) => {
  const snackbarService = useSnackbarService();

  return (
    <React.Fragment>
      <SnackbarServiceContext.Provider value={snackbarService}>
        {props.children}
      </SnackbarServiceContext.Provider>

      {snackbarService.internalState.currentSnackbarItem && (
        <Snackbar
          /*
            The Snackbar automatically hides after a fixed amount of time.
            The problem: If a new Snackbar is created (i.e. `showSnackbar()` is called a second time) while the first one is still visible,
            the timer would not reset, potentially making the Snackbar disappear after an unexpected short period of time.
            By using a unique `key`, we force React to unmount the first Snackbar and to mount the new Snackbar as a new instance, 
            making the timer get started fresh.
          */
          key={snackbarService.internalState.currentSnackbarItem.uniqueKey}
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
          autoHideDuration={5000}
          message={snackbarService.internalState.currentSnackbarItem.message}
          open
          onClose={(): void => snackbarService.onSnackbarClose()}
        />
      )}
    </React.Fragment>
  );
};

export const useSnackbarServiceContext = (): SnackbarService => {
  const context = React.useContext(SnackbarServiceContext);
  if (!context) {
    throw Error(
      'Your component does not seem to be part of the SnackbarServiceContext!',
    );
  }

  return context;
};
