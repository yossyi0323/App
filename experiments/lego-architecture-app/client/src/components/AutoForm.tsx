import React from 'react';
import { useForm } from '@refinedev/core';
import { trpc } from '../providers/trpc';

export const AutoForm = () => {

    // Refine's useForm infers resource/action/id from the URL defaults if not provided.
    // We just need to handle the data loading for edit mode.
    const { onFinish, queryResult, formLoading, id } = useForm({
        redirect: 'list',
    });

    const record = queryResult?.data?.data;
    const { data: metasData, isLoading: metasLoading } = trpc.metas.list.useQuery();

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const data: Record<string, any> = {};

        formData.forEach((value, key) => {
            data[key] = value;
        });

        onFinish(data);
    };

    if (metasLoading || formLoading) return <div>Loading...</div>;
    if (!metasData) return <div>No metadata definition found.</div>;

    const isEdit = !!id;

    return (
        <div className="p-6 max-w-lg mx-auto bg-white shadow-md rounded">
            <h2 className="text-xl mb-4">{isEdit ? 'Edit Item' : 'New Item'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
                {metasData.map((meta: any) => {
                    const defaultValue = record ? record[meta.key] : '';

                    return (
                        <div key={meta.key} className="flex flex-col">
                            <label className="mb-1 font-semibold">{meta.label}</label>
                            {meta.dataType === 'SELECT' ? (
                                <select
                                    name={meta.key}
                                    className="p-2 border rounded"
                                    defaultValue={defaultValue}
                                >
                                    {(meta.options as any[])?.map((opt: any) => (
                                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                                    ))}
                                </select>
                            ) : (
                                <input
                                    name={meta.key}
                                    type={meta.dataType === 'NUMBER' ? 'number' : meta.dataType === 'DATE' ? 'date' : 'text'}
                                    required={meta.isRequired}
                                    className="p-2 border rounded"
                                    defaultValue={meta.dataType === 'DATE' && defaultValue ? String(defaultValue).split('T')[0] : defaultValue}
                                />
                            )}
                        </div>
                    );
                })}

                <button type="submit" disabled={formLoading} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50">
                    {formLoading ? 'Saving...' : 'Save'}
                </button>
            </form>
        </div>
    );
};
