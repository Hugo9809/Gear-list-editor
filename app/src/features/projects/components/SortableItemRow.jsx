import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import TypeaheadInput from '../../../shared/components/TypeaheadInput.jsx';
import { Bars3Icon, TrashIcon } from '@heroicons/react/24/outline';

export const SortableItemRow = ({
    item,
    index,
    categoryId,
    t,
    resolveDisplayName,
    itemSuggestions,
    onUpdateItemField,
    onApplySuggestionToItem,
    onRemoveItem
}) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({
        id: item.id,
        data: {
            type: 'item',
            item,
            categoryId
        }
    });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 10 : 1,
        opacity: isDragging ? 0.5 : 1
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className="ui-panel grid gap-3 bg-surface-muted/70 p-3 md:grid-cols-[3fr_2fr_auto] items-center"
        >
            <div className="flex items-center gap-2">
                {/* Drag Handle */}
                <button
                    type="button"
                    {...attributes}
                    {...listeners}
                    className="cursor-move text-text-muted hover:text-text-primary p-1 rounded"
                    aria-label={t('common.drag', 'Drag to reorder')}
                >
                    <Bars3Icon className="h-5 w-5" />
                </button>

                <input
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(event) =>
                        onUpdateItemField(categoryId, item.id, 'quantity', event.target.value)
                    }
                    className="ui-input w-20"
                />
                <span className="text-sm font-semibold text-text-muted">×</span>
                <div className="min-w-0 flex-1">
                    <TypeaheadInput
                        value={resolveDisplayName(
                            item.name,
                            { index: index + 1 },
                            'defaults.untitled_item'
                        )}
                        onChange={(value) => onUpdateItemField(categoryId, item.id, 'name', value)}
                        onSelectSuggestion={(suggestion) =>
                            onApplySuggestionToItem(categoryId, item.id, suggestion)
                        }
                        suggestions={itemSuggestions}
                        placeholder={t('items.fields.name', 'Item name')}
                        label={t('items.fields.name', 'Item name')}
                        detailsFallback={t('items.suggestion.detailsFallback')}
                        inputClassName="ui-input px-3 py-2"
                    />
                </div>
            </div>
            <input
                value={item.details}
                onChange={(event) =>
                    onUpdateItemField(categoryId, item.id, 'details', event.target.value)
                }
                placeholder={t('items.fields.details', 'Details / notes')}
                className="ui-input px-3 py-2"
            />
            <div className="flex flex-col items-end gap-2">
                <button
                    type="button"
                    onClick={() => onRemoveItem(categoryId, item.id)}
                    className="text-text-secondary hover:text-status-error p-2 rounded transition-colors"
                    title={t('items.actions.remove', 'Remove')}
                >
                    <TrashIcon className="h-5 w-5" />
                </button>
            </div>
        </div>
    );
};
