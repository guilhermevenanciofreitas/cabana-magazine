import React from 'react';
import { Input } from 'rsuite';

const Textarea = React.forwardRef((props, ref) => (
  <Input {...props} as="textarea" ref={ref} />
));

export default Textarea;
