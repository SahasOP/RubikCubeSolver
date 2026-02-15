import React from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface PuzzleSelectorProps {
  value: string;
  onValueChange: (value: string) => void;
  className?: string;
}

export function PuzzleSelector({ value, onValueChange, className }: PuzzleSelectorProps) {
  const sizes = ["2x2x2", "3x3x3"];
  // const sizes = ["2x2x2", "3x3x3", "4x4x4", "5x5x5", "6x6x6", "7x7x7"];

  return (
    <div className={className}>
      <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select size" />
        </SelectTrigger>
        <SelectContent>
          {sizes.map((size) => (
            <SelectItem key={size} value={size}>
              {size}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
