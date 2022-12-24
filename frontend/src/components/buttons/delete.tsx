import { Button } from '@mantine/core';
import { MdDelete } from '@react-icons/all-files/md/MdDelete';
import React from 'react';

export default function DeleteButton(props: any) {
  return (
    <Button
      color="red"
      size="xs"
      leftIcon={<MdDelete size={20} />}
      style={{ marginLeft: 10 }}
      {...props}
    >
      {props.title}
    </Button>
  );
}
