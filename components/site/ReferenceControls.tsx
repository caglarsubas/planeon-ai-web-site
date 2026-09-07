'use client';
import {
  Combobox,
  ComboboxInput,
  ComboboxContent,
  ComboboxList,
  ComboboxItem,
  ComboboxEmpty,
} from '@/components/ui/combobox';

export function SearchPicker({
  label,
  items,
  value,
  onChange,
}: {
  label: string;
  items: { value: string; label: string }[];
  value: string;
  onChange: (value: string) => void;
}) {
  const selected = items.find((item) => item.value === value) ?? null;
  return (
    <div className="reference-picker">
      <span className="control-label">{label}</span>
      <Combobox
        items={items}
        value={selected}
        onValueChange={(item) => {
          if (item) onChange(item.value);
        }}
        itemToStringLabel={(item) => item.label}
        isItemEqualToValue={(a, b) => a.value === b.value}
      >
        <ComboboxInput aria-label={label} className="reference-input" />
        <ComboboxContent className="reference-options">
          <ComboboxEmpty>No matches. Try another term.</ComboboxEmpty>
          <ComboboxList>
            {(item: { value: string; label: string }) => (
              <ComboboxItem key={item.value} value={item}>
                {item.label}
              </ComboboxItem>
            )}
          </ComboboxList>
        </ComboboxContent>
      </Combobox>
    </div>
  );
}
