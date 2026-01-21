import { useState, useEffect } from 'react';

export default function DeviceEditor({ t, item, onSave, onCancel }) {
    const [draft, setDraft] = useState({
        name: '',
        quantity: 1,
        category: '',
        details: ''
    });

    // Use key to reset state when item changes, or update state if item changes
    useEffect(() => {
        // Logic to sync internal state if item prop changes externally
        const target = item || {
            name: '',
            quantity: 1,
            category: '',
            details: ''
        };

        setDraft(prev => { // eslint-disable-line react-hooks/set-state-in-effect
            // Only update if actually changed to avoid loop
            if (JSON.stringify(prev) !== JSON.stringify(target)) {
                return {
                    name: target.name || '',
                    quantity: target.quantity || 1,
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-surface-sunken/70 p-4 backdrop-blur-sm">
            <div className="ui-tile w-full max-w-lg bg-surface-elevated/95 p-6">
                <div className="flex flex-col gap-2">
                    <h3 className="text-lg font-semibold ui-heading">
                        {item ? t('library.editItem', 'Edit item') : t('library.addItem', 'Add new item')}
                    </h3>
                    <p className="text-sm text-text-secondary">
                        {t(
                            'library.editor.helper',
                            'Update the global library so new projects can reuse consistent gear details.'
                        )}
                    </p>
                </div>
                <form onSubmit={handleSubmit} className="mt-4 space-y-4">
                    <label className="flex flex-col gap-2 text-sm text-text-secondary">
                        {t('item.name', 'Item name')}
                        <input
                            type="text"
                            name="name"
                            id="name"
                            required
                            value={draft.name}
                            onChange={handleChange}
                            className="ui-input ui-input-lg"
                        />
                    </label>

                    <label className="flex flex-col gap-2 text-sm text-text-secondary">
                        {t('item.quantity', 'Quantity')}
                        <input
                            type="number"
                            name="quantity"
                            id="quantity"
                            min="1"
                            value={draft.quantity}
                            onChange={handleChange}
                            className="ui-input"
                        />
                    </label>

                    <label className="flex flex-col gap-2 text-sm text-text-secondary">
                        {t('library.category', 'Category')}
                        <input
                            type="text"
                            name="category"
                            id="category"
                            value={draft.category}
                            onChange={handleChange}
                            placeholder={t('library.categoryPlaceholder', 'Camera, lighting, audio')}
                            className="ui-input"
                        />
                    </label>

                    <label className="flex flex-col gap-2 text-sm text-text-secondary">
                        {t('item.details', 'Details')}
                        <textarea
                            name="details"
                            id="details"
                            rows="3"
                            value={draft.details}
                            onChange={handleChange}
                            placeholder={t('library.detailsPlaceholder', 'Lens type, kit notes, or rental info')}
                            className="ui-textarea"
                        />
                    </label>

                    <div className="mt-6 flex flex-wrap justify-end gap-3">
                        <button type="button" onClick={onCancel} className="ui-button ui-button-outline">
                            {t('general.cancel', 'Cancel')}
                        </button>
                        <button type="submit" className="ui-button ui-button-primary">
                            {t('general.save', 'Save')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
