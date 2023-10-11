import { ScrollArea, Table, createStyles } from '@mantine/core';
import React from 'react';

export const regularStyle = createStyles(() => ({
  table: {
    tbody: {
      tr: {
        td: {
          fontSize: '2rem',
          div: {
            fontSize: '1.5rem',
          },
        },
      },
    },
    thead: {
      tr: {
        th: {
          button: {
            fontSize: '1.5rem',
          },
          div: {
            fontSize: '1.5rem',
            marginLeft: '0.1rem',
            marginRight: '0.1rem',
          },
        },
      },
    },
  },
}));

export default function TableLayoutLarge({ children }: any) {
  const { classes } = regularStyle();

  return (
    <>
      <ScrollArea>
        <Table
          horizontalSpacing="md"
          verticalSpacing="xs"
          striped
          highlightOnHover
          className={classes.table}
        >
          {children}
        </Table>
      </ScrollArea>
    </>
  );
}
