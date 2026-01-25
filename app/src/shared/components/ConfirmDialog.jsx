
import React from 'react';

export default function ConfirmDialog({
    isOpen,
    title,
    message,
    onConfirm,
    onCancel,
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    isDestructive = false,
    t
}) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-surface-sunken/70 p-4 backdrop-blur-sm">
            <div className="ui-tile w-full max-w-md bg-surface-elevated/95 p-6 animate-in fade-in zoom-in-95 duration-200">
                <h3 className="text-lg font-semibold ui-heading mb-2">
                    {title}
                </h3>
                <p className="text-sm text-text-secondary mb-6">
                    {message}
                </p>
                <div className="flex flex-wrap justify-end gap-3">
                    <button
                        type="button"
                        onClick={onCancel}
                        className="ui-button ui-button-outline"
                    >
                        {cancelText}
                    </button>
                    <button
                        type="button"
                        onClick={onConfirm}
                        className={`ui-button ${isDestructive ? 'ui-button-danger' : 'ui-button-primary'}`}
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
}
