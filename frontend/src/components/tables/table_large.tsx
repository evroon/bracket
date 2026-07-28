import { ScrollArea, Table } from '@mantine/core';

export default function TableLayoutLarge({ children }: any) {
  return (
    <>
      <ScrollArea>
        <Table
          horizontalSpacing="md"
          verticalSpacing="xs"
          striped
          highlightOnHover
          style={{ fontSize: 'inherit' }}
        >
          {children}
        </Table>
      </ScrollArea>
    </>
  );
}
