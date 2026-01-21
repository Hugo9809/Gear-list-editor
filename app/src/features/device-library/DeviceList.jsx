import { PencilSquareIcon, TrashIcon } from '@heroicons/react/24/outline';

export default function DeviceList({ t, items, onEdit, onDelete }) {
    if (!items || items.length === 0) {
        return (
            <div className="rounded-lg border border-dashed border-surface-sunken bg-surface-muted/70 px-4 py-6 text-center text-sm text-text-muted">
                {t('library.empty', 'Your device library is empty. Add items to track them globally.')}
            </div>
        );
    }

    return (
        <div className="grid gap-4 md:grid-cols-2">
            {items.map((item) => {
                const quantityValue = Number.isFinite(Number(item.quantity))
                    ? Number(item.quantity)
                    : 1;
                const quantityLabel = item.unit ? `${quantityValue} ${item.unit}` : `${quantityValue}`;
                const categoryLabel = item.category || t('library.category.empty', 'Uncategorized');
                const detailsLabel = item.details || t('library.details.empty', 'No details yet.');
                const dateLabel = item.dateAdded
                    ? new Date(item.dateAdded).toLocaleDateString()
                    : t('library.dateAdded.empty', 'Date unavailable');

                return (
                    <div key={item.id} className="ui-panel flex h-full flex-col gap-3 bg-surface-muted/60 p-4">
                        <div className="flex items-start justify-between gap-3">
                            <div>
                                <h3 className="text-base font-semibold ui-heading">{item.name}</h3>
                                <p className="text-xs text-text-secondary">{quantityLabel}</p>
                            </div>
                            <div className="flex gap-2">
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
                        <div className="flex flex-wrap gap-2 text-xs text-text-muted">
                            <span className="rounded-full border border-surface-sunken bg-surface-base/70 px-2 py-0.5">
                                {categoryLabel}
                            </span>
                            {item.unit ? (
                                <span className="rounded-full border border-surface-sunken bg-surface-base/70 px-2 py-0.5">
                                    {t('library.unit', 'Unit')}: {item.unit}
                                </span>
                            ) : null}
                        </div>
                        <p className="text-sm text-text-secondary">{detailsLabel}</p>
                        <p className="mt-auto text-xs text-text-muted">
                            {t('library.dateAdded', 'Added {date}', { date: dateLabel })}
                        </p>
                    </div>
                );
            })}
        </div>
    );
}
