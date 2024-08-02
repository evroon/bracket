import { format, parseISO } from 'date-fns';

export function BareDateTime({
  datetime,
  formatStr,
  datetimeAttr = datetime instanceof Date ? datetime.toISOString() : datetime.toString(),
}: {
  datetime: string | number | Date;
  datetimeAttr?: string;
  formatStr: string;
}) {
  return <time dateTime={datetimeAttr}>{format(datetime, formatStr)}</time>;
}

export function DateTime({ datetime }: { datetime: string }) {
  const date = parseISO(datetime);
  return <BareDateTime datetime={date} formatStr="d LLLL yyyy HH:mm" datetimeAttr={datetime} />;
}

export function Time({ datetime }: { datetime: string }) {
  const date = parseISO(datetime);
  return <BareDateTime datetime={date} formatStr="HH:mm" datetimeAttr={datetime} />;
}

export function formatTime(datetime: string) {
  return format(parseISO(datetime), 'HH:mm');
}
