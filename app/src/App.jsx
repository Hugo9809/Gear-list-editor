import { useMemo, useRef, useState, useEffect } from 'react';
import { createId, createStorageService } from './data/storage.js';

export default function App() {
  const [items, setItems] = useState([]);
  const [notes, setNotes] = useState('');
  const [lastSaved, setLastSaved] = useState(null);
  const [status, setStatus] = useState('Loading your saved gear list...');
  const [isHydrated, setIsHydrated] = useState(false);
  const fileInputRef = useRef(null);
  const storageRef = useRef(null);

  if (!storageRef.current) {
    storageRef.current = createStorageService({
      onSaved: (payload, { reason, warnings }) => {
        setLastSaved(payload.lastSaved);
        if (warnings?.length) {
          setStatus(warnings[0]);
          return;
        }
        if (reason === 'autosave') {
          setStatus('Autosave complete. Your updates are protected.');
        } else if (reason === 'explicit') {
          setStatus('Saved safely to device storage and backups.');
        } else if (reason === 'rehydrate') {
          setStatus('Storage repaired and redundancies refreshed.');
        }
      },
      onWarning: (message) => setStatus(message)
    });
  }

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      const result = await storageRef.current.loadState();
      if (!mounted) {
        return;
      }
      setItems(result.state.items);
      setNotes(result.state.notes);
      setLastSaved(result.state.lastSaved);
      if (result.warnings.length > 0) {
        setStatus(result.warnings[0]);
      } else {
        setStatus(
          result.source === 'Empty'
            ? 'No saved data yet. Start adding gear and autosave will protect it.'
            : `Loaded safely from ${result.source}.`
        );
      }
      setIsHydrated(true);
    };
    load();
    return () => {
      mounted = false;
      storageRef.current?.dispose();
    };
  }, []);

  useEffect(() => {
    if (!isHydrated) {
      return;
    }
    storageRef.current.scheduleAutosave({ items, notes, lastSaved });
  }, [items, notes, isHydrated]);

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
    setStatus('Item added. Autosave will secure it immediately.');
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
    setStatus('Changes queued for autosave.');
  };

  const removeItem = (id) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
    setStatus('Item removed. Backups remain available.');
  };

  const downloadBackup = () => {
    const { json, fileName } = storageRef.current.exportBackup({ items, notes, lastSaved });
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    setStatus('Backup downloaded. Store it somewhere safe.');
  };

  const restoreFromDeviceBackup = async () => {
    const result = await storageRef.current.restoreFromBackup();
    setItems(result.state.items);
    setNotes(result.state.notes);
    setLastSaved(result.state.lastSaved);
    if (result.warnings.length > 0) {
      setStatus(result.warnings[0]);
      return;
    }
    setStatus(`Restored from ${result.source}.`);
  };

  const handleImport = (event) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const { state, warnings } = storageRef.current.importBackup(reader.result, {
        items,
        notes,
        lastSaved
      });
      setItems(state.items);
      setNotes(state.notes);
      if (warnings.length > 0) {
        setStatus(warnings[0]);
      } else {
        setStatus('Import complete. Existing data was preserved.');
      }
    };
    reader.readAsText(file);
    event.target.value = '';
  };

  const saveNow = async () => {
    const result = await storageRef.current.saveNow({ items, notes, lastSaved });
    if (result?.warnings?.length) {
      setStatus(result.warnings[0]);
    }
  };

  const shareData = async () => {
    const { json } = storageRef.current.exportBackup({ items, notes, lastSaved });
    if (navigator.clipboard?.writeText) {
      try {
        await navigator.clipboard.writeText(json);
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
              This offline-first workspace saves every edit in IndexedDB and mirrors backups to your device
              storage. Export a backup or restore from device storage any time to protect your data. No
              information leaves your device.
            </p>
            <div className="flex flex-wrap items-center gap-3 text-sm text-slate-400">
              <span className="rounded-full border border-slate-700 px-3 py-1">Autosave active</span>
              <span className="rounded-full border border-slate-700 px-3 py-1">IndexedDB primary</span>
              <span className="rounded-full border border-slate-700 px-3 py-1">Device backups (OPFS)</span>
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
                Add context for your crew. Notes are saved to IndexedDB, backed up on-device, and included in exports.
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
                Your data stays on-device. Use these tools to save instantly, create extra copies, or restore
                from device backups.
              </p>
              <div className="mt-4 flex flex-col gap-3">
                <button
                  type="button"
                  onClick={saveNow}
                  className="rounded-lg bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-900 transition hover:bg-white"
                >
                  Save now
                </button>
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
                  onClick={restoreFromDeviceBackup}
                  className="rounded-lg border border-slate-700 px-4 py-2 text-sm font-semibold text-slate-200 transition hover:border-emerald-400 hover:text-emerald-200"
                >
                  Restore from device backup
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
                <li>Autosave writes to IndexedDB first and mirrors device backups for redundancy.</li>
                <li>Use “Save now” before big edits or shutdowns for immediate protection.</li>
                <li>Download backups for sharing or archiving offline.</li>
                <li>Imported items are appended so existing data is never overwritten.</li>
                <li>Restore pulls from the most recent device backup available.</li>
              </ul>
            </div>
          </aside>
        </section>
      </div>
    </div>
  );
}
