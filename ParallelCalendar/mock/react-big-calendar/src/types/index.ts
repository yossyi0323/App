export interface DomainEvent {
    id: number;
    title: string;
    start: Date;
    end: Date;
    realDate: Date;
    type: string;
    description?: string; // Markdown Note
}

// export interface CalendarViewModel {
//     resourceId: string;
// }

export type CalendarViewModel<T> = T & {
    start: Date;
    end: Date;
    resourceId: string;
}
