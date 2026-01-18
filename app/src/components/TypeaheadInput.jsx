import { useMemo, useState } from 'react';

/**
 * Provide a lightweight typeahead input with suggestion selection.
 * Assumes suggestions are small enough to filter client-side.
 */
const TypeaheadInput = ({
  value,
  onChange,
  onSelectSuggestion,
  suggestions,
  placeholder,
  inputClassName,
  listClassName,
  label,
  unitFallback = '',
  detailsFallback = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const filteredSuggestions = useMemo(() => {
    const normalized = value.trim().toLowerCase();
    const sorted = [...suggestions].sort((a, b) =>
      (b.lastUsed || '').localeCompare(a.lastUsed || '')
    );
    const filtered = normalized
      ? sorted.filter((item) => item.name.toLowerCase().includes(normalized))
      : sorted;
    return filtered.slice(0, 6);
  }, [value, suggestions]);

  const handleSelect = (suggestion) => {
    onSelectSuggestion?.(suggestion);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onFocus={() => setIsOpen(true)}
        onBlur={() => setTimeout(() => setIsOpen(false), 120)}
        placeholder={placeholder}
        aria-label={label}
        className={inputClassName}
      />
      {isOpen && filteredSuggestions.length > 0 && (
        <div
          className={`absolute z-20 mt-2 w-full overflow-hidden ui-dropdown ${
            listClassName || ''
          }`}
        >
          {filteredSuggestions.map((suggestion) => (
            <button
              key={suggestion.name}
              type="button"
              onMouseDown={(event) => {
                event.preventDefault();
                handleSelect(suggestion);
              }}
              className="flex w-full flex-col gap-1 px-3 py-2 text-left transition hover:bg-surface-sunken"
            >
              <span className="font-medium text-text-primary">{suggestion.name}</span>
              <span className="text-xs text-text-secondary">
                {suggestion.unit || unitFallback} · {suggestion.details || detailsFallback}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default TypeaheadInput;
