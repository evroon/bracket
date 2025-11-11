import type { ButtonProps, ElementProps } from '@mantine/core';
import { forwardRef } from 'react';
import { Link } from 'react-router';

interface MyButtonProps extends ButtonProps, ElementProps<'a', keyof ButtonProps> {}

const PreloadLink = forwardRef(function PreloadLink({ href, ...props }: MyButtonProps, ref) {
  // @ts-ignore
  return <Link to={href} ref={ref} {...props}></Link>;
});

export default PreloadLink;
