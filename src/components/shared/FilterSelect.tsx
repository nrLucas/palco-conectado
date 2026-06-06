'use client';

import { Label, ListBox, Select } from '@heroui/react';
import type { Key } from 'react';

type Option = { id: string; label: string };

type FilterSelectProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: Option[];
  placeholder?: string;
  className?: string;
};

export function FilterSelect({
  label,
  value,
  onChange,
  options,
  placeholder,
  className,
}: FilterSelectProps) {
  return (
    <Select
      className={className}
      value={value}
      onChange={(key: Key | Key[] | null) => onChange(String(key ?? ''))}
      placeholder={placeholder}
    >
      <Label className="sr-only">{label}</Label>
      <Select.Trigger aria-label={label}>
        <Select.Value />
        <Select.Indicator />
      </Select.Trigger>
      <Select.Popover>
        <ListBox>
          {options.map((opt) => (
            <ListBox.Item key={opt.id} id={opt.id} textValue={opt.label}>
              {opt.label}
              <ListBox.ItemIndicator />
            </ListBox.Item>
          ))}
        </ListBox>
      </Select.Popover>
    </Select>
  );
}
