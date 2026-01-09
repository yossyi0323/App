import { useMemo } from 'react';
import { useList, useDelete } from '@refinedev/core';
import { trpc } from '../providers/trpc';
import { Link } from 'react-router-dom';

export const DynamicList = () => {
    const { mutate: deleteMutate } = useDelete();

    // 1. Fetch Metadata
    const { data: metasData, isLoading: isLoadingMetas } = trpc.metas.list.useQuery();

    // 2. Fetch Data
    const { data: itemsData, isLoading: isLoadingItems } = useList({
        resource: 'items',
    });

    const columns = useMemo(() => {
        if (!metasData) return [];
        return metasData.map((meta: any) => ({
            key: meta.key,
            label: meta.label,
            render: (value: any) => {
                if (meta.dataType === 'DATE' && value) return new Date(value).toLocaleDateString();
                return value;
            },
        }));
    }, [metasData]);

    if (isLoadingMetas || isLoadingItems) return (
        <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-600"></div>
        </div>
    );

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Items</h1>
                    <p className="text-sm text-gray-500 mt-1">Manage your dynamic inventory</p>
                </div>
                <Link
                    to="create"
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-brand-600 hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500 transition-colors"
                >
                    + New Item
                </Link>
            </div>

            <div className="bg-white shadow-sm ring-1 ring-gray-900/5 rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                                {columns.map((col: any) => (
                                    <th key={col.key} scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        {col.label}
                                    </th>
                                ))}
                                <th scope="col" className="relative px-6 py-3">
                                    <span className="sr-only">Actions</span>
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {itemsData?.data.map((item: any) => (
                                <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">
                                        {item.id.slice(0, 8)}...
                                    </td>
                                    {columns.map((col: any) => (
                                        <td key={col.key} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {col.render(item[col.key])}
                                        </td>
                                    ))}
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <div className="flex justify-end gap-3">
                                            <Link
                                                to={`edit/${item.id}`}
                                                className="text-brand-600 hover:text-brand-900 font-medium"
                                            >
                                                Edit
                                            </Link>
                                            <button
                                                onClick={() => {
                                                    if (confirm('Are you sure?')) {
                                                        deleteMutate({
                                                            resource: 'items',
                                                            id: item.id,
                                                        });
                                                    }
                                                }}
                                                className="text-red-600 hover:text-red-900 font-medium"
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {itemsData?.data.length === 0 && (
                                <tr>
                                    <td colSpan={columns.length + 2} className="px-6 py-12 text-center text-gray-500">
                                        No items found. Create one to get started.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};
