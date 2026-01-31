import moment from 'moment';
import type { CalendarViewModel } from '../types';

export const Adapter = {
    toResourceId: (date: Date, type: string) => `${moment(date).format('YYYY-MM-DD')}_${type}`,

    parseResourceId: (resourceId: string) => {
        const [dateStr, type] = resourceId.split('_');
        return { date: moment(dateStr).toDate(), type: type };
    },

    toViewModel: <T>(
        event: T,
        baseDate: Date,
        getStart: (event: T) => Date,
        getEnd: (event: T) => Date,
        getRealDate: (event: T) => Date,
        getType: (event: T) => string,
    ): CalendarViewModel<T> => {
        const start = new Date(baseDate);
        const evStart = getStart(event);
        start.setHours(evStart.getHours(), evStart.getMinutes());
        const end = new Date(baseDate);
        const evEnd = getEnd(event);
        end.setHours(evEnd.getHours(), evEnd.getMinutes());
        const resourceId = Adapter.toResourceId(getRealDate(event), getType(event));
        return { ...event, start, end, resourceId };
    }
};
