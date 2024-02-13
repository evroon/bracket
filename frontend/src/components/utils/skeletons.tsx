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

export function TableSkeletonSingleColumn() {
  return (
    <>
      <Skeleton height="3rem" radius="md" mb="sm" />
      <Skeleton height="3rem" radius="md" mb="sm" />
      <Skeleton height="3rem" radius="md" mb="sm" />
    </>
  );
}

export function TableSkeletonTwoColumns() {
  return (
    <Center>
      <div style={{ minWidth: '1500px', marginTop: '2rem' }}>
        <Grid>
          <Grid.Col span={{ sm: 6 }}>
            <Skeleton height={75} radius="lg" mb="xl" />
            <Skeleton height={75} radius="lg" mb="xl" />
            <Skeleton height={75} radius="lg" mb="xl" />
          </Grid.Col>
          <Grid.Col span={{ sm: 6 }}>
            <Skeleton height={75} radius="lg" mb="xl" />
            <Skeleton height={75} radius="lg" mb="xl" />
            <Skeleton height={75} radius="lg" mb="xl" />
          </Grid.Col>
        </Grid>
      </div>
    </Center>
  );
}

export function TableSkeletonTwoColumnsSmall() {
  return (
    <div style={{ width: '48rem', marginTop: '2rem' }}>
      <Grid>
        <Grid.Col span={{ sm: 6 }}>
          <Skeleton height={125} radius="lg" mb="xl" />
          <Skeleton height={125} radius="lg" mb="xl" />
          <Skeleton height={125} radius="lg" mb="xl" />
        </Grid.Col>
        <Grid.Col span={{ sm: 6 }}>
          <Skeleton height={125} radius="lg" mb="xl" />
          <Skeleton height={125} radius="lg" mb="xl" />
          <Skeleton height={125} radius="lg" mb="xl" />
        </Grid.Col>
      </Grid>
    </div>
  );
}
