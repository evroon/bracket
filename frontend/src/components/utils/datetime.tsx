import { parseISO, format } from 'date-fns';

export default function DateTime({ datetime }: { datetime: string }) {
  const date = parseISO(datetime);
  return <time dateTime={datetime}>{format(date, 'd LLLL yyyy HH:SS')}</time>;
}
