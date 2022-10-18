/*
  Some icons of MUI have names that collide with other built-in components.
  An example is "Badge", which is both an icon and a MUI component.

  To solve this, we import all icons into a variable and from now on, only use icons from this new variable. For instance, to use the "Badge" icon, we now write `<Icons.Badge />`.
*/
// eslint-disable-next-line no-restricted-imports
export * as Icons from '@mui/icons-material';
