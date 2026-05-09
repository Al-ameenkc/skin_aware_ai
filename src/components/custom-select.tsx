"use client";

import { useEffect, useRef, useState } from "react";
import { Check, ChevronDown } from "lucide-react";

export type SelectOption = { value: string; label: string };

type CustomSelectProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
};

export function CustomSelect({ label, value, onChange, options }: CustomSelectProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("click", onDoc);
    return () => document.removeEventListener("click", onDoc);
  }, []);

  const selected = options.find((o) => o.value === value) ?? options[0];

  return (
    <div ref={rootRef} className="relative">
      <p className="mb-1.5 text-xs font-medium text-[#7a5158]">{label}</p>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="group flex w-full items-center justify-between rounded-xl border border-[#f1c5d3] bg-white px-4 py-3 text-left text-[#5d4146] outline-none transition duration-200 hover:border-[#e8a8be] hover:shadow-md active:scale-[0.99] focus:ring-2 focus:ring-[#d88ca9]"
        aria-expanded={open}
        aria-haspopup="listbox"
      >
        <span>{selected.label}</span>
        <ChevronDown
          size={18}
          className={`shrink-0 text-[#9b5d62] transition duration-300 ${open ? "rotate-180" : "group-hover:translate-y-0.5"}`}
        />
      </button>
      {open && (
        <ul
          role="listbox"
          className="absolute z-10 mt-1 max-h-48 w-full overflow-auto rounded-xl border border-[#f1c5d3] bg-white py-1 shadow-lg"
        >
          {options.map((opt) => (
            <li key={opt.value} role="option" aria-selected={opt.value === value}>
              <button
                type="button"
                onClick={() => {
                  onChange(opt.value);
                  setOpen(false);
                }}
                className="flex w-full items-center justify-between px-4 py-2.5 text-left text-sm text-[#5d4146] transition duration-150 hover:translate-x-1 hover:bg-[#fff4f8]"
              >
                {opt.label}
                {opt.value === value && <Check size={16} className="text-[#6f3f45]" aria-hidden />}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
