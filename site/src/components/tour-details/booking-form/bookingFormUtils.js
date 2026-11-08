import { format } from 'date-fns';

export const serializeDate = (value) => (value ? format(value, 'yyyy-MM-dd') : '');
