import React, { useMemo } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Bars3Icon, TrashIcon } from '@heroicons/react/24/outline';
import TypeaheadInput from '../../../shared/components/TypeaheadInput.jsx';
import { SortableItemRow } from './SortableItemRow.jsx';

export const CategoryItem = ({
    category,
    categoryIndex,
    t,
    resolveDisplayName,
    onUpdateCategoryField,
    onRemoveCategory,
    onAddItemToCategory,
    itemDraft, // getItemDraft(category.id)
    onUpdateDraftItem,
    onApplySuggestionToDraft,
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
        id: category.id,
        data: {
            type: 'category',
            category
        }
    });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 10 : 1,
        opacity: isDragging ? 0.5 : 1
    };

    const itemIds = useMemo(() => category.items.map((i) => i.id), [category.items]);

    return (
        <div
            ref={setNodeRef}
            style={style}
            className="ui-tile flex flex-col gap-4 border-l-4 border-l-brand bg-surface-elevated/80 p-4"
        >
            <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex flex-1 items-start gap-3">
                    {/* Category Drag Handle */}
                    <button
                        type="button"
                        {...attributes}
                        {...listeners}
                        className="mt-3 cursor-move text-text-muted hover:text-text-primary p-1 rounded"
                        aria-label={t('common.dragCategory', 'Drag to reorder category')}
                    >
                        <Bars3Icon className="h-6 w-6" />
                    </button>

                    <div className="flex flex-1 flex-col gap-3">
                        <input
                            value={resolveDisplayName(
                                category.name,
                                { index: categoryIndex + 1 },
                                'defaults.untitled_category'
                            )}
                            onChange={(event) =>
                                onUpdateCategoryField(category.id, 'name', event.target.value)
                            }
                            className="ui-input px-3 py-2 text-lg font-semibold"
                        />
                        <textarea
                            value={category.notes}
                            onChange={(event) =>
                                onUpdateCategoryField(category.id, 'notes', event.target.value)
                            }
                            placeholder={t(
                                'categories.notes.placeholder',
                                'Category notes or rental references'
                            )}
                            rows={2}
                            className="ui-textarea px-3 py-2"
                        />
                    </div>
                </div>

                <div className="flex flex-wrap items-start gap-2">
                    <button
                        type="button"
                        onClick={() => onRemoveCategory(category.id)}
                        className="ui-button ui-button-danger px-3 py-2 text-xs uppercase tracking-wide"
                    >
                        {t('categories.actions.remove', 'Remove category')}
                    </button>
                </div>
            </div>

            <form
                onSubmit={(event) => onAddItemToCategory(event, category.id)}
                className="ui-panel grid gap-3 bg-surface-base/90 p-3 md:grid-cols-[3fr_2fr_auto]"
            >
                <div className="flex items-center gap-2">
                    <input
                        type="number"
                        min="1"
                        value={itemDraft?.quantity || 1}
                        onChange={(event) =>
                            onUpdateDraftItem(category.id, 'quantity', event.target.value)
                        }
                        className="ui-input w-20"
                    />
                    <span className="text-sm font-semibold text-text-muted">×</span>
                    <div className="min-w-0 flex-1">
                        <TypeaheadInput
                            value={itemDraft?.name || ''}
                            onChange={(value) => onUpdateDraftItem(category.id, 'name', value)}
                            onSelectSuggestion={(suggestion) =>
                                onApplySuggestionToDraft(category.id, suggestion)
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
                    value={itemDraft?.details || ''}
                    onChange={(event) =>
                        onUpdateDraftItem(category.id, 'details', event.target.value)
                    }
                    placeholder={t('items.fields.details', 'Details / notes')}
                    className="ui-input px-3 py-2"
                />
                <button type="submit" className="ui-button ui-button-primary text-xs">
                    {t('items.actions.add', 'Add')}
                </button>
            </form>

            <div className="flex flex-col gap-3 min-h-[50px]">
                <SortableContext items={itemIds} strategy={verticalListSortingStrategy}>
                    {category.items.length === 0 ? (
                        <div className="rounded-lg border border-dashed border-surface-sunken bg-surface-muted/70 px-4 py-4 text-center text-xs text-text-muted">
                            {t('items.empty', 'No items yet. Add the first item above.')}
                        </div>
                    ) : (
                        category.items.map((item, itemIndex) => (
                            <SortableItemRow
                                key={item.id}
                                item={item}
                                index={itemIndex}
                                categoryId={category.id}
                                t={t}
                                resolveDisplayName={resolveDisplayName}
                                itemSuggestions={itemSuggestions}
                                onUpdateItemField={onUpdateItemField}
                                onApplySuggestionToItem={onApplySuggestionToItem}
                                onRemoveItem={onRemoveItem}
                            />
                        ))
                    )}
                </SortableContext>
            </div>
        </div>
    );
};
