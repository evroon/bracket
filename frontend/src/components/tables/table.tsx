import React, { useState } from 'react';
import {
  Center,
  createStyles,
  Group,
  ScrollArea,
  Table,
  Text,
  UnstyledButton,
} from '@mantine/core';
import { HiSortAscending } from '@react-icons/all-files/hi/HiSortAscending';
import { HiSortDescending } from '@react-icons/all-files/hi/HiSortDescending';
import { MdSort } from '@react-icons/all-files/md/MdSort';
import { getItemColor } from '../util';

export const useStyles = createStyles((theme) => ({
  th: {
    padding: '0 !important',
  },

  control: {
    width: '100%',
    padding: `${theme.spacing.xs}px ${theme.spacing.md}px`,
    '&:hover': {
      backgroundColor: getItemColor(theme),
    },
  },

  icon: {
    width: 21,
    height: 21,
    borderRadius: 21,
  },
}));

export interface TableState {
  sortField: string;
  reversed: boolean;
  setReversed: any;
  setSortField: any;
}

export interface ThProps {
  children: React.ReactNode;
  state: TableState;
  field: string;
}

export const setSorting = (state: TableState, newSortField: string) => {
  if (newSortField === state.sortField) {
    state.setReversed(!state.reversed);
  } else {
    state.setSortField(newSortField);
  }
};

export const getTableState = () => {
  const [reversed, setReversed] = useState(false);
  const [sortField, setSortField] = useState('title');
  return {
    sortField,
    setSortField,
    reversed,
    setReversed,
  };
};

export function getSortIcon(sorted: boolean, reversed: boolean) {
  if (!sorted) return <MdSort />;
  if (reversed) return <HiSortAscending />;
  return <HiSortDescending />;
}

export function Th({ children, field, state }: ThProps) {
  const sorted = state.sortField === field;
  const onSort = () => setSorting(state, field);
  const { classes } = useStyles();

  return (
    <th className={classes.th}>
      <UnstyledButton onClick={onSort} className={classes.control}>
        <Group position="apart">
          <Text weight={500} size="sm">
            {children}
          </Text>
          <Center className={classes.icon}>{getSortIcon(sorted, state.reversed)}</Center>
        </Group>
      </UnstyledButton>
    </th>
  );
}

export default function TableLayout({ children }: any) {
  return (
    <>
      <ScrollArea>
        <Table
          horizontalSpacing="md"
          verticalSpacing="xs"
          striped
          highlightOnHover
          sx={{ tableLayout: 'fixed', minWidth: 700 }}
        >
          {children}
        </Table>
      </ScrollArea>
    </>
  );
}
