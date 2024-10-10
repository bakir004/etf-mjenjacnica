import React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
export function SelectForm({
  placeholder,
  elements,
  name,
  required,
  onChange,
}: {
  placeholder: string;
  elements: string[];
  name: string;
  required?: boolean;
  onChange?: (value: string) => void;
}) {
  return (
    <Select
      name={name}
      required={required ?? false}
      onValueChange={onChange ? (v: string) => onChange(v) : () => {}}
    >
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent className="max-h-64">
        {elements.map((item: string, i: number) => (
          <SelectItem key={i} value={item}>
            {item}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
