// In-app Save-As modal implementation (vanilla DOM) for environments without a native Save-As dialog path.
// This modal appears in response to a user gesture and returns the chosen filename or null if canceled.
export async function showSaveAsDialog(suggestedName: string): Promise<string | null> {
  return new Promise(resolve => {
    // Prevent multiple overlays
    const existing = document.getElementById('oc-save-as-overlay');
    if (existing) {
      existing.remove();
    }

    // Overlay
    const overlay = document.createElement('div');
    overlay.id = 'oc-save-as-overlay';
    overlay.style.position = 'fixed';
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.right = '0';
    overlay.style.bottom = '0';
    overlay.style.background = 'rgba(0,0,0,0.4)';
    overlay.style.display = 'flex';
    overlay.style.alignItems = 'center';
    overlay.style.justifyContent = 'center';
    overlay.style.zIndex = '9999';

    const modal = document.createElement('div');
    modal.style.background = '#fff';
    modal.style.borderRadius = '8px';
    modal.style.boxShadow = '0 2px 10px rgba(0,0,0,.2)';
    modal.style.padding = '16px';
    modal.style.minWidth = '320px';
    modal.style.fontFamily = 'Arial, sans-serif';

    const title = document.createElement('div');
    title.textContent = 'Save backup as';
    title.style.fontWeight = 'bold';
    title.style.marginBottom = '8px';

    const input = document.createElement('input');
    input.type = 'text';
    input.value = suggestedName || '';
    input.style.width = '100%';
    input.style.padding = '8px';
    input.style.fontSize = '14px';
    input.style.boxSizing = 'border-box';
    input.style.marginBottom = '12px';

    const btnRow = document.createElement('div');
    btnRow.style.display = 'flex';
    btnRow.style.justifyContent = 'flex-end';
    btnRow.style.gap = '8px';

    const saveBtn = document.createElement('button');
    saveBtn.textContent = 'Save';
    saveBtn.style.padding = '6px 12px';
    const cancelBtn = document.createElement('button');
    cancelBtn.textContent = 'Cancel';
    cancelBtn.style.padding = '6px 12px';

    btnRow.appendChild(cancelBtn);
    btnRow.appendChild(saveBtn);
    modal.appendChild(title);
    modal.appendChild(input);
    modal.appendChild(btnRow);
    overlay.appendChild(modal);
    document.body.appendChild(overlay);

    const close = () => {
      document.body.removeChild(overlay);
      resolve(null);
    };

    cancelBtn.addEventListener('click', close);

    const onSave = () => {
      const val = input.value.trim();
      const chosen = val.length > 0 ? val : suggestedName || 'backup.json';
      document.body.removeChild(overlay);
      resolve(chosen);
    };

    saveBtn.addEventListener('click', onSave);
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') onSave();
    });

    setTimeout(() => input.focus(), 0);
  });
}
