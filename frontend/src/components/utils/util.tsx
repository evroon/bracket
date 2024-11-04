import HCaptcha from '@hcaptcha/react-hcaptcha';
import { Center } from '@mantine/core';
import { useRouter } from 'next/router';
import React from 'react';
import { SWRResponse } from 'swr';

import classes from '../../pages/create_account.module.css';

export function capitalize(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function getTodayAtMidnight() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

export function getDefaultTimeRange(selectMultipleDates: boolean) {
  const maxDate = getTodayAtMidnight();
  const minDate = getTodayAtMidnight();

  let offset = 1;
  if (minDate.getDay() === 0) {
    offset = 2;
  } else if (minDate.getDay() === 1) {
    offset = 3;
  }

  minDate.setDate(minDate.getDate() - offset);

  if (!selectMultipleDates) {
    maxDate.setDate(minDate.getDate());
  }

  return [minDate, maxDate];
}

export function getTournamentIdFromRouter() {
  const router = useRouter();
  const { id: idString }: any = router.query;
  const id = parseInt(idString, 10);
  const tournamentData = { id };
  return { id, tournamentData };
}

export function getStageItemIdFromRouter() {
  const router = useRouter();
  const { stage_item_id: idString }: any = router.query;
  return parseInt(idString, 10);
}

export function getTournamentEndpointFromRouter() {
  const router = useRouter();
  const { id }: any = router.query;
  return id;
}

export function responseIsValid(response: SWRResponse | null) {
  return response != null && response.data != null && response.data.data != null;
}

export function getBaseURL() {
  return typeof window !== 'undefined' && window.location.origin ? window.location.origin : '';
}

export const groupBy = (keys: any) => (array: any) =>
  array.reduce((objectsByKeyValue: any, obj: any) => {
    const value = keys.map((key: any) => obj[key]).join('-');
    // eslint-disable-next-line no-param-reassign
    objectsByKeyValue[value] = (objectsByKeyValue[value] || []).concat(obj);
    return objectsByKeyValue;
  }, {});

export function truncateString(input: string, length: number) {
  if (input.length > length + 3) {
    return `${input.slice(0, length)}...`;
  }
  return input;
}

export function HCaptchaInput({
  siteKey,
  setCaptchaToken,
}: {
  siteKey: string | undefined;
  setCaptchaToken: any;
}) {
  if (siteKey == null) return null;
  return (
    <Center className={classes.hcaptcha}>
      <HCaptcha sitekey={siteKey} onVerify={setCaptchaToken} theme="dark" />
    </Center>
  );
}

export interface Pagination {
  offset: number;
  limit: number;
  sort_by: string;
  sort_direction: 'asc' | 'desc';
}
