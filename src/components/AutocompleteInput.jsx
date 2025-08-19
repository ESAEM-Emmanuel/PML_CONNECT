// src/components/AutocompleteInput.jsx
import { useState, useMemo } from 'react';

export default function AutocompleteInput({
  placeholder,
  items,              // [{ id, name }]
  onSelect,
  disabled,
  required,
}) {
  const [search, setSearch] = useState('');
  const [show, setShow] = useState(false);

  const filtered = useMemo(
    () => items.filter((i) =>
      i.name.toLowerCase().includes(search.toLowerCase())
    ),
    [items, search]
  );

  const select = (item) => {
    setSearch(item.name);
    setShow(false);
    onSelect(item.id, item.name);
  };

  return (
    <div className="relative">
      <input
        type="text"
        value={search}
        onChange={(e) => {
          setSearch(e.target.value);
          setShow(true);
        }}
        onFocus={() => setShow(true)}
        onBlur={() => setTimeout(() => setShow(false), 150)}
        placeholder={placeholder}
        disabled={disabled}
        className="input input-bordered w-full"
      />
      {show && !disabled && filtered.length > 0 && (
        <ul className="absolute z-10 w-full bg-base-100 border border-base-300 rounded max-h-48 overflow-y-auto">
          {filtered.map((item) => (
            <li
              key={item.id}
              className="px-3 py-2 hover:bg-base-200 cursor-pointer"
              onMouseDown={() => select(item)}
            >
              {item.name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}