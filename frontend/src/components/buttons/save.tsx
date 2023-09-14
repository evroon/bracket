import { Button } from '@mantine/core';

export default function SaveButton(props: any) {
  return (
    <Button
      color="green"
      size="md"
      style={{ marginBottom: 10, marginRight: 10, marginLeft: 10 }}
      {...props}
    >
      {props.title}
    </Button>
  );
}
