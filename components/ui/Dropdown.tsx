"use client";

import { useState, useRef, useEffect, ReactNode } from "react";
import { ChevronDown } from "lucide-react";

export interface DropdownOption {
  value: string;
  label: ReactNode;
}

interface DropdownProps {
  value: string;
  onChange: (value: string) => void;
  options: DropdownOption[];
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export function Dropdown({
  value,
  onChange,
  options,
  placeholder = "Select...",
  className = "",
  disabled = false,
}: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((opt) => opt.value === value);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isOpen]);

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-3 py-2.5 rounded-md text-xs font-medium bg-bg-surface border border-border-default text-text-primary hover:border-primary/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <span className="truncate">
          {selectedOption ? selectedOption.label : <span className="text-text-tertiary">{placeholder}</span>}
        </span>
        <ChevronDown className="w-3.5 h-3.5 text-text-tertiary ml-2 shrink-0" />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-1 w-full min-w-[140px] max-h-64 overflow-y-auto bg-bg-surface border border-border-subtle rounded-lg shadow-xl z-50 py-1 flex flex-col scrollbar-hide animate-in fade-in slide-in-from-top-1 duration-150">
          {options.map((opt, index) => {
            // Check if the label is actually a divider (special case)
            if (opt.value === "divider") {
              return <div key={`div-${index}`} className="h-px bg-border-subtle my-1 mx-2" />;
            }
            
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => {
                  onChange(opt.value);
                  setIsOpen(false);
                }}
                className={`flex items-center justify-between px-3 py-2 text-xs font-medium transition-colors ${
                  value === opt.value
                    ? "bg-primary/10 text-primary"
                    : "text-text-secondary hover:bg-bg-surface-hover hover:text-text-primary"
                }`}
              >
                <span className="truncate text-left w-full">{opt.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
