import { format, parseISO } from 'date-fns';

export function DateTime({ datetime }: { datetime: string }) {
  const date = parseISO(datetime);
  return <time dateTime={datetime}>{format(date, 'd LLLL yyyy HH:mm')}</time>;
}

export function Time({ datetime }: { datetime: string }) {
  const date = parseISO(datetime);
  return <time dateTime={datetime}>{format(date, 'HH:mm')}</time>;
}

export function formatTime(datetime: string) {
  return format(parseISO(datetime), 'HH:mm');
}

export function compareDateTime(datetime1: string, datetime2: string) {
  return parseISO(datetime1) > parseISO(datetime2);
}
