import { Skeleton } from '@mantine/core';
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
