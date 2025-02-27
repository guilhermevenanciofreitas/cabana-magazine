import React from 'react';
import { NavLink as BaseNavLink } from 'react-router-dom';

const NavLink = React.forwardRef(
  ({ to, children, ...rest }, ref) => {
    return (
      <BaseNavLink ref={ref} to={to} {...rest}>
        {children}
      </BaseNavLink>
    );
  }
);

export default NavLink;
