import { useEffect, useMemo, useRef, useState } from 'react';
import {
    ArrowDownTrayIcon,
    ArrowPathIcon,
    ArrowUpTrayIcon,
    PlusIcon
} from '@heroicons/react/24/outline';
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
        deleteLibraryItem,
        exportLibrary,
        importLibrary,
        resetLibrary
    } = useDeviceLibrary({ deviceLibrary, setDeviceLibrary, t, setStatus });

    const [editingItem, setEditingItem] = useState(null);
    const [isAdding, setIsAdding] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeCategory, setActiveCategory] = useState('all');
    const fileInputRef = useRef(null);

    const libraryStats = useMemo(() => {
        const categories = new Set();
        let latestTimestamp = null;
        let totalQuantity = 0;

        libraryItems.forEach((item) => {
            if (item.category) {
                categories.add(item.category);
            }
            const timestamp = Date.parse(item.dateAdded || '');
            if (Number.isFinite(timestamp)) {
                latestTimestamp = latestTimestamp === null ? timestamp : Math.max(latestTimestamp, timestamp);
            }
            const quantity = Number(item.quantity);
            totalQuantity += Number.isFinite(quantity) ? quantity : 0;
        });

        return {
            itemCount: libraryItems.length,
            categoryCount: categories.size,
            totalQuantity,
            lastAdded: latestTimestamp ? new Date(latestTimestamp).toLocaleDateString() : null
        };
    }, [libraryItems]);

    const categoryOptions = useMemo(() => {
        const categories = new Set();
        libraryItems.forEach((item) => {
            if (item.category) {
                categories.add(item.category);
            }
        });
        return Array.from(categories).sort((a, b) => a.localeCompare(b));
    }, [libraryItems]);

    useEffect(() => {
        if (activeCategory === 'all') {
            return;
        }
        const matchedCategory = categoryOptions.find(
            (category) => category.toLowerCase() === activeCategory.toLowerCase()
        );
        if (!matchedCategory) {
            setActiveCategory('all');
        } else if (matchedCategory !== activeCategory) {
            setActiveCategory(matchedCategory);
        }
    }, [activeCategory, categoryOptions]);

    const filteredItems = useMemo(() => {
        const normalizedQuery = searchQuery.trim().toLowerCase();
        const normalizedCategory = activeCategory.toLowerCase();
        return libraryItems.filter((item) => {
            const itemCategory = (item.category || '').toLowerCase();
            if (normalizedCategory !== 'all' && itemCategory !== normalizedCategory) {
                return false;
            }
            if (!normalizedQuery) {
                return true;
            }
            const haystack = [item.name, item.category, item.details]
                .filter(Boolean)
                .join(' ')
                .toLowerCase();
            return haystack.includes(normalizedQuery);
        });
    }, [activeCategory, libraryItems, searchQuery]);

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

    const handleExport = () => {
        const { json, fileName } = exportLibrary();
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        link.remove();
        URL.revokeObjectURL(url);
        setStatus(t('status.libraryExported', 'Device library export downloaded.'));
    };

    const handleImport = (event) => {
        const file = event.target.files?.[0];
        if (!file) {
            return;
        }
        const reader = new FileReader();
        reader.onload = () => {
            importLibrary(reader.result);
        };
        reader.readAsText(file);
        event.target.value = '';
    };

    const handleReset = () => {
        const confirmed = window.confirm(
            t(
                'library.resetConfirm',
                'Resetting the device library will remove all global items. Project gear lists are not affected.'
            )
        );
        if (!confirmed) {
            return;
        }
        resetLibrary();
        setEditingItem(null);
        setIsAdding(false);
    };

    return (
        <section className="ui-tile bg-surface-elevated/60 p-6">
            <input
                ref={fileInputRef}
                type="file"
                accept="application/json"
                onChange={handleImport}
                className="hidden"
            />
            <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="max-w-2xl">
                    <h2 className="text-xl font-semibold ui-heading">
                        {t('library.title', 'Device library')}
                    </h2>
                    <p className="text-sm text-text-secondary">
                        {t(
                            'library.description',
                            'Manage your global database of gear items, and keep project additions synced automatically.'
                        )}
                    </p>
                </div>
                <div className="flex flex-wrap gap-2">
                    <button
                        type="button"
                        onClick={() => setIsAdding(true)}
                        className="ui-button ui-button-primary gap-2"
                    >
                        <PlusIcon className="h-4 w-4" aria-hidden="true" />
                        {t('library.addItem', 'Add item')}
                    </button>
                    <button type="button" onClick={handleExport} className="ui-button ui-button-outline gap-2">
                        <ArrowDownTrayIcon className="h-4 w-4" aria-hidden="true" />
                        {t('library.export', 'Export library')}
                    </button>
                    <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="ui-button ui-button-outline gap-2"
                    >
                        <ArrowUpTrayIcon className="h-4 w-4" aria-hidden="true" />
                        {t('library.import', 'Import library')}
                    </button>
                    <button type="button" onClick={handleReset} className="ui-button ui-button-danger gap-2">
                        <ArrowPathIcon className="h-4 w-4" aria-hidden="true" />
                        {t('library.reset', 'Factory reset')}
                    </button>
                </div>
            </div>
            <p className="mt-3 text-xs text-text-muted">
                {t(
                    'library.helper',
                    'Items added in projects appear here automatically. Imports merge into the current library without overwriting existing items.'
                )}
            </p>

            <div className="mt-6 grid gap-4 md:grid-cols-3">
                <div className="ui-panel bg-surface-muted/60 p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-text-muted">
                        {t('library.stats.items', 'Library items')}
                    </p>
                    <p className="text-2xl font-semibold ui-heading">{libraryStats.itemCount}</p>
                    <p className="text-xs text-text-secondary">
                        {libraryStats.lastAdded
                            ? t('library.stats.lastAdded', 'Last added {date}', {
                                date: libraryStats.lastAdded
                            })
                            : t('library.stats.lastAddedEmpty', 'No items yet')}
                    </p>
                </div>
                <div className="ui-panel bg-surface-muted/60 p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-text-muted">
                        {t('library.stats.categories', 'Categories tracked')}
                    </p>
                    <p className="text-2xl font-semibold ui-heading">{libraryStats.categoryCount}</p>
                    <p className="text-xs text-text-secondary">
                        {t('library.stats.categoriesHelper', 'Use categories to group gear families.')}
                    </p>
                </div>
                <div className="ui-panel bg-surface-muted/60 p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-text-muted">
                        {t('library.stats.quantities', 'Total quantity')}
                    </p>
                    <p className="text-2xl font-semibold ui-heading">{libraryStats.totalQuantity}</p>
                    <p className="text-xs text-text-secondary">
                        {t('library.stats.quantitiesHelper', 'Combined quantities across the library.')}
                    </p>
                </div>
            </div>

            <div className="mt-6 ui-panel bg-surface-muted/60 p-4">
                <div className="grid gap-4 md:grid-cols-[2fr_1fr_auto] md:items-end">
                    <label className="flex flex-col gap-2 text-xs uppercase tracking-wide text-text-secondary">
                        {t('library.search.label', 'Search library')}
                        <input
                            value={searchQuery}
                            onChange={(event) => setSearchQuery(event.target.value)}
                            placeholder={t('library.search.placeholder', 'Search gear, details, categories')}
                            className="ui-input"
                        />
                    </label>
                    <label className="flex flex-col gap-2 text-xs uppercase tracking-wide text-text-secondary">
                        {t('library.filter.label', 'Filter by category')}
                        <select
                            value={activeCategory}
                            onChange={(event) => setActiveCategory(event.target.value)}
                            className="ui-select"
                        >
                            <option value="all">{t('library.filter.all', 'All categories')}</option>
                            {categoryOptions.map((category) => (
                                <option key={category} value={category}>
                                    {category}
                                </option>
                            ))}
                        </select>
                    </label>
                    <div className="text-xs text-text-muted">
                        {t('library.results', 'Showing {count} of {total}', {
                            count: filteredItems.length,
                            total: libraryItems.length
                        })}
                    </div>
                </div>
            </div>

            <div className="mt-4 ui-panel bg-surface-base/80 p-4">
                <DeviceList
                    t={t}
                    items={filteredItems}
                    emptyMessage={
                        libraryItems.length === 0
                            ? t('library.empty', 'Your device library is empty. Add items to track them globally.')
                            : t('library.emptyFiltered', 'No items match these filters. Try adjusting the search.')
                    }
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
        </section>
    );
}
