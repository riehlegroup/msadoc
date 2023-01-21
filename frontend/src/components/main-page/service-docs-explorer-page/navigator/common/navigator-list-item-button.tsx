import { ListItemButton, ListItemIcon, ListItemText } from '@mui/material';
import React from 'react';

interface Props {
  icon: React.ReactElement;
  text: string;
  isSelected?: boolean;

  /**
   * Spacing that will be added to the left.
   * This is particularly useful to visualize tree structures or the like:
   * Use an indent level of 0 for the root element,
   * a level of 1 for the children of the root element,
   * a level of 2 for their children, and so on.
   */
  indent?: number;

  buttonRef?: React.RefObject<HTMLDivElement>;

  /**
   * Fired when the element is clicked.
   * If {@link onClickIcon} exists, then this function will not be called when the icon is clicked.
   */
  onClick: () => void;
  /**
   * Fired when the icon is clicked.
   */
  onClickIcon?: () => void;
}
/**
 * A {@link ListItemButton} to be used in our navigation.
 */
export const NavigatorListItemButton: React.FC<Props> = (props) => {
  return (
    <ListItemButton
      ref={props.buttonRef}
      sx={{
        pl: (props.indent ?? 0) * 3 + 2,
        background: (theme) =>
          props.isSelected === true ? theme.palette.primary.main : undefined,
        color: (theme) =>
          props.isSelected === true
            ? theme.palette.primary.contrastText
            : undefined,
        '&:hover': {
          background: (theme) =>
            props.isSelected === true ? theme.palette.primary.main : undefined,
          color: (theme) =>
            props.isSelected === true
              ? theme.palette.primary.contrastText
              : undefined,
        },
      }}
      onClick={(): void => props.onClick()}
    >
      {/* 
        In the following, we use "align-self: stretch" to improve the UX:
        The area where the user is able to click should be as large as possible so that the user does not accidentally click on the parent element.
      */}
      <ListItemIcon
        sx={{
          display: 'flex',
          alignSelf: 'stretch',
          alignItems: 'center',
          color: 'inherit',
        }}
        onClick={(e): void => {
          // No specific click listener for the icon? Then we want the event to bubble up.
          if (!props.onClickIcon) {
            return;
          }
          e.stopPropagation();
          props.onClickIcon();
        }}
      >
        {props.icon}
      </ListItemIcon>
      <ListItemText primary={props.text} />
    </ListItemButton>
  );
};
