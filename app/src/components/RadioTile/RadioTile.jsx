import React, { useCallback } from 'react';
import classNames from 'classnames';
import { Stack } from 'rsuite';
import CheckIcon from '@rsuite/icons/Check';

const RadioTile = (props) => {
  const { icon, children, value, title, name, className, onChange, ...rest } = props;

  const checked = value === name;

  const handleChange = useCallback(
    (event) => {
      onChange?.(event.target.value, event);
    },
    [onChange]
  );

  const classes = classNames(className, 'rs-radio-tile', { checked });

  return (
    <Stack className={classes} {...rest} as="label" spacing={6}>
      {icon}
      <div>
        <input type="radio" value={name} checked={checked} onChange={handleChange} />
        <div className="rs-radio-tile-title">{title}</div>
        <div className="rs-radio-tile-content text-muted">{children}</div>
        <div className="rs-radio-tile-check">
          <CheckIcon />
        </div>
      </div>
    </Stack>
  );
};

export default RadioTile;
