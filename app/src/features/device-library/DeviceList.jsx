import { PencilSquareIcon, TrashIcon } from '@heroicons/react/24/outline';

export default function DeviceList({ t, items, onEdit, onDelete, emptyMessage }) {
    if (!items || items.length === 0) {
        return (
            <div className="rounded-lg border border-dashed border-surface-sunken bg-surface-muted/70 px-4 py-6 text-center text-sm text-text-muted">
                {emptyMessage ||
                    t('library.empty', 'Your device library is empty. Add items to track them globally.')}
            </div>
        );
    }

    return (
        <div className="overflow-hidden rounded-xl border border-surface-sunken">
            <div className="grid gap-3 border-b border-surface-sunken bg-surface-muted/70 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-text-muted md:grid-cols-[2fr_1fr_2fr_auto]">
                <span>{t('library.item', 'Item')}</span>
                <span>{t('library.category', 'Category')}</span>
                <span>{t('library.details', 'Details')}</span>
                <span className="text-right">{t('general.actions', 'Actions')}</span>
            </div>
            <div className="divide-y divide-surface-sunken bg-surface-base/80">
                {items.map((item) => {
                    const quantityValue = Number.isFinite(Number(item.quantity))
                        ? Number(item.quantity)
                        : 1;
                    const categoryLabel = item.category || t('library.category.empty', 'Uncategorized');
                    const detailsLabel = item.details || t('library.details.empty', 'No details yet.');
                    const dateLabel = item.dateAdded
                        ? new Date(item.dateAdded).toLocaleDateString()
                        : t('library.dateAdded.empty', 'Date unavailable');

                    return (
                        <div
                            key={item.id}
                            className="grid gap-3 px-4 py-3 text-sm text-text-secondary md:grid-cols-[2fr_1fr_2fr_auto]"
                        >
                            <div className="flex flex-col gap-1">
                                <span className="font-semibold text-text-primary">{item.name}</span>
                                <span className="text-xs text-text-muted">
                                    {t('library.quantity', 'Qty')} {quantityValue}
                                </span>
                            </div>
                            <div className="text-sm text-text-secondary">{categoryLabel}</div>
                            <div className="flex flex-col gap-1 text-sm text-text-secondary">
                                <span>{detailsLabel}</span>
                                <span className="text-xs text-text-muted">
                                    {t('library.dateAdded', 'Added {date}', { date: dateLabel })}
                                </span>
                            </div>
                            <div className="flex items-center justify-end gap-2">
                                <button
                                    type="button"
                                    onClick={() => onEdit(item)}
                                    className="ui-button ui-button-outline px-2 py-1 text-xs"
                                    aria-label={t('general.edit', 'Edit')}
                                >
                                    <PencilSquareIcon className="h-4 w-4" aria-hidden="true" />
                                </button>
                                <button
                                    type="button"
                                    onClick={() => onDelete(item.id)}
                                    className="ui-button ui-button-danger px-2 py-1 text-xs"
                                    aria-label={t('general.delete', 'Delete')}
                                >
                                    <TrashIcon className="h-4 w-4" aria-hidden="true" />
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
