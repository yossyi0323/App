import moment from 'moment';

export const ResourceHeader = ({ label, resource }: any) => {
    if (!resource) return null;
    const isPlan = resource.id.includes('plan');
    const dateLabel = moment(resource.date).format('M/D (ddd)');
    return (
        <div className="flex flex-col items-center justify-center w-full">
            <div className="resource-header-date">{dateLabel}</div>
            <div className={`resource-header-label ${isPlan ? 'label-plan' : 'label-do'}`}>{label}</div>
        </div>
    );
};
