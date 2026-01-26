import React, { useRef, useState } from 'react';
import {
    DndContext,
    closestCorners,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragOverlay,
    defaultDropAnimationSideEffects
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy
} from '@dnd-kit/sortable';
import { CategoryItem } from './CategoryItem.jsx';
import { SortableItemRow } from './SortableItemRow.jsx';

export const CategoryList = ({
    projectId,
    categories,
    t,
    resolveDisplayName,
    onUpdateCategoryField,
    onRemoveCategory,
    onAddItemToCategory,
    getItemDraft,
    onUpdateDraftItem,
    onApplySuggestionToDraft,
    itemSuggestions,
    onUpdateItemField,
    onApplySuggestionToItem,
    onRemoveItem,
    reorderCategories,
    moveItem
}) => {
    const [activeId, setActiveId] = useState(null);
    const [activeType, setActiveType] = useState(null); // 'category' | 'item'
    const [activeItemData, setActiveItemData] = useState(null); // Snapshot for overlay
    const activeTypeRef = useRef(null);
    const activeContainerRef = useRef(null);
    const activeIndexRef = useRef(null);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8
            }
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates
        })
    );

    const getCategory = (id) => categories.find((c) => c.id === id);
    const findContainer = (id) => {
        if (categories.find((c) => c.id === id)) {
            return id;
        }
        return categories.find((c) => c.items.find((i) => i.id === id))?.id;
    };

    const getItemIndex = (categoryId, itemId) => {
        const category = getCategory(categoryId);
        if (!category) return -1;
        return category.items.findIndex((item) => item.id === itemId);
    };

    const handleDragStart = (event) => {
        const { active } = event;
        const { data } = active;
        const type = data.current?.type;
        setActiveId(active.id);
        setActiveType(type);
        activeTypeRef.current = type;
        if (type === 'item') {
            const containerId = findContainer(active.id);
            activeContainerRef.current = containerId;
            activeIndexRef.current = containerId ? getItemIndex(containerId, active.id) : -1;
            setActiveItemData(data.current.item);
        } else if (type === 'category') {
            activeContainerRef.current = null;
            activeIndexRef.current = null;
            setActiveItemData(data.current.category);
        }
    };

    const handleDragOver = () => {};

    const handleDragEnd = (event) => {
        const { active, over } = event;
        const type = activeTypeRef.current;
        const originContainer = activeContainerRef.current;
        const originIndex = activeIndexRef.current ?? -1;

        // Reset active
        setActiveId(null);
        setActiveType(null);
        setActiveItemData(null);
        activeTypeRef.current = null;
        activeContainerRef.current = null;
        activeIndexRef.current = null;

        if (!over) return;

        if (type === 'category') {
            if (active.id !== over.id) {
                const oldIndex = categories.findIndex((c) => c.id === active.id);
                const newIndex = categories.findIndex((c) => c.id === over.id);

                if (oldIndex < 0 || newIndex < 0) {
                    return;
                }

                // Reconstruct order array
                const reordered = arrayMove(categories, oldIndex, newIndex);
                reorderCategories(projectId, reordered.map(c => c.id));
            }
            return;
        }

        if (type === 'item') {
            const overId = over.id;
            const originContainerId = originContainer;
            const originItemIndex = originIndex;
            const overContainer = categories.find((c) => c.id === overId)
                ? overId
                : findContainer(overId);

            const targetContainer = overContainer || originContainerId;
            if (!targetContainer) return;

            const targetCategory = getCategory(targetContainer);
            if (!targetCategory) return;

            let targetIndex = targetCategory.items.length;
            const overIndex = targetCategory.items.findIndex((i) => i.id === overId);

            if (overIndex >= 0) {
                if (overId === active.id) {
                    targetIndex = overIndex;
                } else {
                    const isBelowOverItem =
                        active.rect.current.translated &&
                        active.rect.current.translated.top >
                        over.rect.top + over.rect.height / 2;
                    const modifier = isBelowOverItem ? 1 : 0;
                    targetIndex = overIndex + modifier;
                }
            }

            const activeContainer = originContainerId || findContainer(active.id);
            const currentIndex = activeContainer
                ? getItemIndex(activeContainer, active.id)
                : originItemIndex;

            const isSameContainer = activeContainer === targetContainer;
            const adjustedIndex =
                isSameContainer && currentIndex > -1 && targetIndex > currentIndex
                    ? targetIndex - 1
                    : targetIndex;
            const didMoveContainers = !isSameContainer;
            const didChangeIndex = currentIndex !== adjustedIndex;

            if (!didMoveContainers && !didChangeIndex) {
                return;
            }

            moveItem(
                projectId,
                active.id,
                activeContainer || targetContainer,
                targetContainer,
                adjustedIndex,
                { forceHistory: true }
            );
        }
    };

    const dropAnimation = {
        sideEffects: defaultDropAnimationSideEffects({
            styles: {
                active: {
                    opacity: '0.5',
                },
            },
        }),
    };

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragEnd={handleDragEnd}
        >
            <div className="flex flex-col gap-4">
                <SortableContext
                    items={categories.map((c) => c.id)}
                    strategy={verticalListSortingStrategy}
                >
                    {categories.map((category, index) => (
                        <CategoryItem
                            key={category.id}
                            category={category}
                            categoryIndex={index}
                            t={t}
                            resolveDisplayName={resolveDisplayName}
                            onUpdateCategoryField={onUpdateCategoryField}
                            onRemoveCategory={onRemoveCategory}
                            onAddItemToCategory={onAddItemToCategory}
                            itemDraft={getItemDraft(category.id)}
                            onUpdateDraftItem={onUpdateDraftItem}
                            onApplySuggestionToDraft={onApplySuggestionToDraft}
                            itemSuggestions={itemSuggestions}
                            onUpdateItemField={onUpdateItemField}
                            onApplySuggestionToItem={onApplySuggestionToItem}
                            onRemoveItem={onRemoveItem}
                        />
                    ))}
                </SortableContext>
            </div>

            <DragOverlay dropAnimation={dropAnimation}>
                {activeId && activeType === 'item' && activeItemData ? (
                    <SortableItemRow
                        item={activeItemData}
                        index={0}
                        categoryId="overlay"
                        t={t}
                        resolveDisplayName={resolveDisplayName}
                        itemSuggestions={itemSuggestions}
                        onUpdateItemField={() => { }}
                        onApplySuggestionToItem={() => { }}
                        onRemoveItem={() => { }}
                    />
                ) : activeId && activeType === 'category' && activeItemData ? (
                    <div className="ui-tile border-l-4 border-l-brand bg-surface-elevated/80 p-4 opacity-80">
                        {/* Simplified Category Preview */}
                        <div className="font-semibold text-lg">{activeItemData.name || t('defaults.untitled_category')}</div>
                    </div>
                ) : null}
            </DragOverlay>
        </DndContext>
    );
};
