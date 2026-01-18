import { useMemo, useRef, useState, useEffect } from 'react';

const STORAGE_KEY = 'gear-list-editor.data';
const BACKUP_KEY = 'gear-list-editor.backup';

const createId = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;
};

const emptyState = {
  items: [],
  notes: '',
  lastSaved: null
};

const safeParse = (value) => {
  if (!value) {
    return null;
  }
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
};

const normalizeItems = (items) => {
  if (!Array.isArray(items)) {
    return [];
  }
  return items
    .filter((item) => item && typeof item.name === 'string')
    .map((item) => ({
      id: createId(),
      name: item.name.trim(),
      quantity: Number.isFinite(Number(item.quantity)) ? Number(item.quantity) : 1
    }))
    .filter((item) => item.name.length > 0);
};

const loadStoredState = () => {
  const stored = safeParse(localStorage.getItem(STORAGE_KEY));
  if (!stored) {
    return emptyState;
  }
  return {
    items: normalizeItems(stored.items),
    notes: typeof stored.notes === 'string' ? stored.notes : '',
    lastSaved: stored.lastSaved || null
  };
};

export default function App() {
  const [items, setItems] = useState(() => loadStoredState().items);
  const [notes, setNotes] = useState(() => loadStoredState().notes);
  const [lastSaved, setLastSaved] = useState(() => loadStoredState().lastSaved);
  const [status, setStatus] = useState('');
  const fileInputRef = useRef(null);

  useEffect(() => {
    const payload = {
      items,
      notes,
      lastSaved: new Date().toISOString()
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    localStorage.setItem(BACKUP_KEY, JSON.stringify(payload));
    setLastSaved(payload.lastSaved);
  }, [items, notes]);

  const itemCount = useMemo(() => items.length, [items]);

  const addItem = (event) => {
    event.preventDefault();
    const formData = new FormData(event.target);
    const name = (formData.get('name') || '').toString().trim();
    const quantityValue = Number(formData.get('quantity'));
    const quantity = Number.isFinite(quantityValue) && quantityValue > 0 ? quantityValue : 1;

    if (!name) {
      setStatus('Please provide an item name before adding.');
      return;
    }

    setItems((prev) => [...prev, { id: createId(), name, quantity }]);
    event.target.reset();
    setStatus('Item added and saved locally.');
  };

  const updateItem = (id, field, value) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              [field]: field === 'quantity' ? Math.max(1, Number(value) || 1) : value
            }
          : item
      )
    );
    setStatus('Changes saved automatically.');
  };

  const removeItem = (id) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
    setStatus('Item removed. Data is still backed up locally.');
  };

  const downloadBackup = () => {
    const payload = {
      items,
      notes,
      lastSaved: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: 'application/json'
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `gear-list-backup-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    setStatus('Backup downloaded. Keep it somewhere safe.');
  };

  const restoreFromLocalBackup = () => {
    const backup = safeParse(localStorage.getItem(BACKUP_KEY));
    if (!backup) {
      setStatus('No local backup found yet.');
      return;
    }
    const restoredItems = normalizeItems(backup.items);
    const restoredNotes = typeof backup.notes === 'string' ? backup.notes : '';
    setItems(restoredItems);
    setNotes(restoredNotes);
    setStatus('Restored from the latest local backup.');
  };

  const handleImport = (event) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const imported = safeParse(reader.result);
      if (!imported) {
        setStatus('Import failed. Please choose a valid backup file.');
        return;
      }
      const importedItems = normalizeItems(imported.items);
      const importedNotes = typeof imported.notes === 'string' ? imported.notes : '';
      setItems((prev) => [...prev, ...importedItems]);
      if (importedNotes) {
        setNotes((prev) => `${prev}\n${importedNotes}`.trim());
      }
      setStatus('Import complete. Existing data was preserved.');
    };
    reader.readAsText(file);
    event.target.value = '';
  };

  const shareData = async () => {
    const payload = JSON.stringify({ items, notes, lastSaved }, null, 2);
    if (navigator.clipboard?.writeText) {
      try {
        await navigator.clipboard.writeText(payload);
        setStatus('Copied your gear list to the clipboard for sharing.');
        return;
      } catch {
        setStatus('Clipboard access was blocked. Use the download backup option instead.');
      }
    } else {
      setStatus('Clipboard sharing is not available. Use the download backup option instead.');
    }
  };

  const statusClasses = status
    ? 'border border-emerald-500/40 bg-emerald-500/10 text-emerald-200'
    : 'border border-slate-800 bg-slate-900/40 text-slate-400';

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-950 to-slate-900">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-6 py-10">
        <header className="flex flex-col gap-4">
          <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Gear List Editor</p>
          <div className="flex flex-col gap-4 rounded-2xl border border-slate-800 bg-slate-900/60 p-6 shadow-lg">
            <h1 className="text-3xl font-semibold text-white">Keep every item safe, synced, and backed up.</h1>
            <p className="max-w-3xl text-base text-slate-300">
              This offline-first workspace saves every edit automatically in your browser. Export a backup or
              restore from local storage any time to protect your data. No information leaves your device.
            </p>
            <div className="flex flex-wrap items-center gap-3 text-sm text-slate-400">
              <span className="rounded-full border border-slate-700 px-3 py-1">Autosave active</span>
              <span className="rounded-full border border-slate-700 px-3 py-1">Local backups enabled</span>
              <span className="rounded-full border border-slate-700 px-3 py-1">Share without external links</span>
            </div>
          </div>
        </header>

        <section className="grid gap-6 lg:grid-cols-[2fr_1fr]">
          <div className="flex flex-col gap-6">
            <form
              onSubmit={addItem}
              className="flex flex-col gap-4 rounded-2xl border border-slate-800 bg-slate-900/40 p-6"
            >
              <div className="flex flex-col gap-2">
                <h2 className="text-xl font-semibold text-white">Add new item</h2>
                <p className="text-sm text-slate-400">
                  Add gear quickly. Every change is saved instantly to avoid any loss.
                </p>
              </div>
              <div className="grid gap-4 md:grid-cols-[2fr_1fr]">
                <label className="flex flex-col gap-2 text-sm text-slate-300">
                  Item name
                  <input
                    name="name"
                    placeholder="e.g. Wireless lavalier"
                    className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-2 text-base text-slate-100 placeholder:text-slate-600 focus:border-emerald-400 focus:outline-none"
                  />
                </label>
                <label className="flex flex-col gap-2 text-sm text-slate-300">
                  Quantity
                  <input
                    name="quantity"
                    type="number"
                    min="1"
                    defaultValue="1"
                    className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-2 text-base text-slate-100 focus:border-emerald-400 focus:outline-none"
                  />
                </label>
              </div>
              <button
                type="submit"
                className="inline-flex w-fit items-center justify-center rounded-lg bg-emerald-500 px-5 py-2 text-sm font-semibold text-emerald-950 transition hover:bg-emerald-400"
              >
                Add and save
              </button>
            </form>

            <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h2 className="text-xl font-semibold text-white">Current gear list</h2>
                  <p className="text-sm text-slate-400">{itemCount} items stored locally.</p>
                </div>
                <div className="text-xs text-slate-500">
                  Last saved: {lastSaved ? new Date(lastSaved).toLocaleString() : 'Not saved yet'}
                </div>
              </div>
              <div className="mt-6 flex flex-col gap-3">
                {items.length === 0 ? (
                  <div className="rounded-lg border border-dashed border-slate-700 bg-slate-950/70 px-4 py-6 text-center text-sm text-slate-500">
                    No items yet. Add your first piece of gear above.
                  </div>
                ) : (
                  items.map((item) => (
                    <div
                      key={item.id}
                      className="flex flex-col gap-3 rounded-xl border border-slate-800 bg-slate-950/60 p-4 md:flex-row md:items-center md:justify-between"
                    >
                      <div className="flex flex-1 flex-col gap-2 md:flex-row md:items-center">
                        <input
                          value={item.name}
                          onChange={(event) => updateItem(item.id, 'name', event.target.value)}
                          className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 focus:border-emerald-400 focus:outline-none"
                        />
                        <input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(event) => updateItem(item.id, 'quantity', event.target.value)}
                          className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 focus:border-emerald-400 focus:outline-none md:w-28"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => removeItem(item.id)}
                        className="rounded-lg border border-slate-700 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-slate-300 transition hover:border-rose-500 hover:text-rose-200"
                      >
                        Remove
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6">
              <h2 className="text-xl font-semibold text-white">Notes & instructions</h2>
              <p className="text-sm text-slate-400">
                Add context for your crew. Notes are saved, backed up, and included in exports.
              </p>
              <textarea
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                placeholder="Call times, pickup location, or other reminders"
                rows={5}
                className="mt-4 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-slate-100 placeholder:text-slate-600 focus:border-emerald-400 focus:outline-none"
              />
            </div>
          </div>

          <aside className="flex flex-col gap-6">
            <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6">
              <h2 className="text-lg font-semibold text-white">Save, share, restore</h2>
              <p className="text-sm text-slate-400">
                Your data stays on-device. Use these tools to create extra copies or share safely.
              </p>
              <div className="mt-4 flex flex-col gap-3">
                <button
                  type="button"
                  onClick={downloadBackup}
                  className="rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-emerald-950 transition hover:bg-emerald-400"
                >
                  Download backup
                </button>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="rounded-lg border border-slate-700 px-4 py-2 text-sm font-semibold text-slate-200 transition hover:border-emerald-400 hover:text-emerald-200"
                >
                  Import backup file
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="application/json"
                  className="hidden"
                  onChange={handleImport}
                />
                <button
                  type="button"
                  onClick={restoreFromLocalBackup}
                  className="rounded-lg border border-slate-700 px-4 py-2 text-sm font-semibold text-slate-200 transition hover:border-emerald-400 hover:text-emerald-200"
                >
                  Restore from local backup
                </button>
                <button
                  type="button"
                  onClick={shareData}
                  className="rounded-lg border border-slate-700 px-4 py-2 text-sm font-semibold text-slate-200 transition hover:border-emerald-400 hover:text-emerald-200"
                >
                  Share via clipboard
                </button>
              </div>
            </div>

            <div className={`rounded-2xl p-4 text-sm ${statusClasses}`} aria-live="polite">
              {status || 'Status updates appear here to confirm data safety.'}
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6">
              <h2 className="text-lg font-semibold text-white">Help & documentation</h2>
              <ul className="mt-3 flex flex-col gap-3 text-sm text-slate-300">
                <li>Autosave runs after every change to keep your list safe.</li>
                <li>Download backups before large edits or when sharing with your team.</li>
                <li>Imported items are appended to protect existing data from overwrites.</li>
                <li>Translations are ready for future additions without changing your stored data.</li>
              </ul>
            </div>
          </aside>
        </section>
      </div>
    </div>
  );
}
