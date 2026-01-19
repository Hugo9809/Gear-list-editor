import { useState } from 'react';
import { PlusIcon } from '@heroicons/react/24/outline';
import { useDeviceLibrary } from './useDeviceLibrary.js';
import DeviceList from './DeviceList.jsx';
import DeviceEditor from './DeviceEditor.jsx';

export default function DeviceLibraryPage({
    t,
    deviceLibrary,
    setDeviceLibrary,
    setStatus
}) {
    const {
        libraryItems,
        addLibraryItem,
        updateLibraryItem,
        deleteLibraryItem
    } = useDeviceLibrary({ deviceLibrary, setDeviceLibrary, t, setStatus });

    const [editingItem, setEditingItem] = useState(null);
    const [isAdding, setIsAdding] = useState(false);

    const handleSave = (draft) => {
        if (editingItem) {
            updateLibraryItem(editingItem.id, draft);
            setEditingItem(null);
        } else {
            addLibraryItem(draft);
            setIsAdding(false);
        }
    };

    const handleCancel = () => {
        setEditingItem(null);
        setIsAdding(false);
    };

    const handleDelete = (id) => {
        if (window.confirm(t('library.confirmDelete', 'Are you sure you want to delete this item?'))) {
            deleteLibraryItem(id);
        }
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="md:flex md:items-center md:justify-between mb-8">
                <div className="min-w-0 flex-1">
                    <h2 className="text-2xl font-bold leading-7 text-gray-900 dark:text-white sm:truncate sm:text-3xl sm:tracking-tight">
                        {t('library.title', 'Device Library')}
                    </h2>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        {t('library.description', 'Manage your global inventory of gear items.')}
                    </p>
                </div>
                <div className="mt-4 flex md:ml-4 md:mt-0">
                    <button
                        type="button"
                        onClick={() => setIsAdding(true)}
                        className="inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                    >
                        <PlusIcon className="-ml-0.5 mr-1.5 h-5 w-5" aria-hidden="true" />
                        {t('library.addItem', 'Add Item')}
                    </button>
                </div>
            </div>

            <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
                <DeviceList
                    t={t}
                    items={libraryItems}
                    onEdit={setEditingItem}
                    onDelete={handleDelete}
                />
            </div>

            {(isAdding || editingItem) && (
                <DeviceEditor
                    t={t}
                    item={editingItem}
                    onSave={handleSave}
                    onCancel={handleCancel}
                />
            )}
        </div>
    );
}
