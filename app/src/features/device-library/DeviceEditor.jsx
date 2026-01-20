import { useState, useEffect } from 'react';

export default function DeviceEditor({ t, item, onSave, onCancel }) {
    const [draft, setDraft] = useState({
        name: '',
        quantity: 1,
        unit: '',
        category: '',
        details: ''
    });

    // Use key to reset state when item changes, or update state if item changes
    useEffect(() => {
        // Logic to sync internal state if item prop changes externally
        const target = item || {
            name: '',
            quantity: 1,
            unit: '',
            category: '',
            details: ''
        };

        setDraft(prev => { // eslint-disable-line react-hooks/set-state-in-effect
            // Only update if actually changed to avoid loop
            if (JSON.stringify(prev) !== JSON.stringify(target)) {
                return {
                    name: target.name || '',
                    quantity: target.quantity || 1,
                    unit: target.unit || '',
                    category: target.category || '',
                    details: target.details || ''
                };
            }
            return prev;
        });
    }, [item]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setDraft(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(draft);
    };

    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center p-4">
            <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6">
                <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-white mb-4">
                    {item ? t('library.editItem', 'Edit Item') : t('library.addItem', 'Add New Item')}
                </h3>
                <form onSubmit={handleSubmit}>
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                {t('item.name', 'Item Name')}
                            </label>
                            <input
                                type="text"
                                name="name"
                                id="name"
                                required
                                value={draft.name}
                                onChange={handleChange}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    {t('item.quantity', 'Quantity')}
                                </label>
                                <input
                                    type="number"
                                    name="quantity"
                                    id="quantity"
                                    min="1"
                                    value={draft.quantity}
                                    onChange={handleChange}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                />
                            </div>
                            <div>
                                <label htmlFor="unit" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    {t('item.unit', 'Unit')}
                                </label>
                                <input
                                    type="text"
                                    name="unit"
                                    id="unit"
                                    value={draft.unit}
                                    onChange={handleChange}
                                    placeholder="pcs, kg"
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="category" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                {t('library.category', 'Category')}
                            </label>
                            <input
                                type="text"
                                name="category"
                                id="category"
                                value={draft.category}
                                onChange={handleChange}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            />
                        </div>

                        <div>
                            <label htmlFor="details" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                {t('item.details', 'Details')}
                            </label>
                            <textarea
                                name="details"
                                id="details"
                                rows="3"
                                value={draft.details}
                                onChange={handleChange}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            />
                        </div>
                    </div>

                    <div className="mt-6 flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={onCancel}
                            className="inline-flex justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-base font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:text-sm dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-600"
                        >
                            {t('general.cancel', 'Cancel')}
                        </button>
                        <button
                            type="submit"
                            className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:text-sm"
                        >
                            {t('general.save', 'Save')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
