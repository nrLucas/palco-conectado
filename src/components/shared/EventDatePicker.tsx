'use client';

import {
  Calendar,
  DateField,
  DatePicker,
  Label,
} from '@heroui/react';
import type { DateValue } from '@internationalized/date';

const calendarContent = (
  <DatePicker.Popover>
    <Calendar aria-label="Data do evento">
      <Calendar.Header>
        <Calendar.YearPickerTrigger>
          <Calendar.YearPickerTriggerHeading />
          <Calendar.YearPickerTriggerIndicator />
        </Calendar.YearPickerTrigger>
        <Calendar.NavButton slot="previous" />
        <Calendar.NavButton slot="next" />
      </Calendar.Header>
      <Calendar.Grid>
        <Calendar.GridHeader>
          {(day) => <Calendar.HeaderCell>{day}</Calendar.HeaderCell>}
        </Calendar.GridHeader>
        <Calendar.GridBody>{(date) => <Calendar.Cell date={date} />}</Calendar.GridBody>
      </Calendar.Grid>
      <Calendar.YearPickerGrid>
        <Calendar.YearPickerGridBody>
          {({ year }) => <Calendar.YearPickerCell year={year} />}
        </Calendar.YearPickerGridBody>
      </Calendar.YearPickerGrid>
    </Calendar>
  </DatePicker.Popover>
);

type EventDatePickerProps = {
  label?: string;
  value: DateValue | null;
  onChange: (value: DateValue | null) => void;
  className?: string;
  isRequired?: boolean;
};

export function EventDatePicker({
  label = 'Data do evento',
  value,
  onChange,
  className = 'w-full',
  isRequired,
}: EventDatePickerProps) {
  return (
    <DatePicker
      className={className}
      value={value}
      onChange={onChange}
      isRequired={isRequired}
    >
      <Label>{label}</Label>
      <DateField.Group fullWidth>
        <DateField.Input>
          {(segment) => <DateField.Segment segment={segment} />}
        </DateField.Input>
        <DateField.Suffix>
          <DatePicker.Trigger>
            <DatePicker.TriggerIndicator />
          </DatePicker.Trigger>
        </DateField.Suffix>
      </DateField.Group>
      {calendarContent}
    </DatePicker>
  );
}
