import { Center, Grid, Skeleton } from '@mantine/core';
import React from 'react';

export function GenericSkeleton() {
  return (
    <>
      <Skeleton height={75} radius="lg" mb="xl" />
      <Skeleton height={75} radius="lg" mb="xl" />
      <Skeleton height={75} radius="lg" mb="xl" />
    </>
  );
}

export function TableSkeletonTwoColumns() {
  return (
    <Center>
      <div style={{ minWidth: '1500px', marginTop: '2rem' }}>
        <Grid>
          <Grid.Col sm={6}>
            <Skeleton height={75} radius="lg" mb="xl" />
            <Skeleton height={75} radius="lg" mb="xl" />
            <Skeleton height={75} radius="lg" mb="xl" />
          </Grid.Col>
          <Grid.Col sm={6}>
            <Skeleton height={75} radius="lg" mb="xl" />
            <Skeleton height={75} radius="lg" mb="xl" />
            <Skeleton height={75} radius="lg" mb="xl" />
          </Grid.Col>
        </Grid>
      </div>
    </Center>
  );
}
