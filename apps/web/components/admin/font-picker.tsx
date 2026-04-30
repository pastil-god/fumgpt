"use client";

import {
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent
} from "react";
import { HOMEPAGE_FONT_REGISTRY, type HomepageFontKey } from "@/lib/settings/inline-homepage";

type FontPickerOption = {
  fontKey: HomepageFontKey | "";
  label: string;
  englishLabel?: string;
  cssFontFamily: string;
  recommendedUsage: "body" | "heading" | "display";
  usageHint: string;
  previewText: string;
  loaded: boolean;
  allowedWeights: ReadonlyArray<"400" | "700">;
};

function cx(...items: Array<string | false | null | undefined>) {
  return items.filter(Boolean).join(" ");
}

export function FontPicker({
  value,
  onChange,
  placeholder,
  ariaLabel,
  defaultHint = "پیش‌فرض سایت"
}: {
  value: HomepageFontKey | "" | undefined;
  onChange: (value: HomepageFontKey | undefined) => void;
  placeholder: string;
  ariaLabel: string;
  defaultHint?: string;
}) {
  const pickerId = useId();
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const listRef = useRef<HTMLUListElement | null>(null);
  const optionRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const [isOpen, setIsOpen] = useState(false);
  const selectedOption = useMemo(
    () => HOMEPAGE_FONT_REGISTRY.find((option) => option.fontKey === value) || null,
    [value]
  );
  const options = useMemo<FontPickerOption[]>(
    () => [
      {
        fontKey: "" as HomepageFontKey,
        label: placeholder,
        englishLabel: undefined,
        cssFontFamily: "\"Vazirmatn\", system-ui, sans-serif",
        recommendedUsage: "body",
        usageHint: defaultHint,
        previewText: "نمونه متن فارسی",
        loaded: true,
        allowedWeights: ["400", "700"]
      },
      ...HOMEPAGE_FONT_REGISTRY
    ],
    [defaultHint, placeholder]
  );
  const selectedIndex = Math.max(
    0,
    options.findIndex((option) => option.fontKey === (selectedOption?.fontKey || ""))
  );
  const [highlightedIndex, setHighlightedIndex] = useState(selectedIndex);

  useEffect(() => {
    setHighlightedIndex(selectedIndex);
  }, [selectedIndex]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    function handlePointerDown(event: MouseEvent) {
      const target = event.target;

      if (
        target instanceof Node &&
        !buttonRef.current?.contains(target) &&
        !listRef.current?.contains(target)
      ) {
        setIsOpen(false);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
        buttonRef.current?.focus();
      }
    }

    window.addEventListener("mousedown", handlePointerDown);
    window.addEventListener("keydown", handleEscape);
    return () => {
      window.removeEventListener("mousedown", handlePointerDown);
      window.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    optionRefs.current[highlightedIndex]?.focus();
  }, [highlightedIndex, isOpen]);

  function commitSelection(option: FontPickerOption) {
    onChange(option.fontKey || undefined);
    setIsOpen(false);
    buttonRef.current?.focus();
  }

  function moveHighlight(step: number) {
    const nextIndex = (highlightedIndex + step + options.length) % options.length;
    setHighlightedIndex(nextIndex);
  }

  function handleButtonKeyDown(event: ReactKeyboardEvent<HTMLButtonElement>) {
    if (event.key === "ArrowDown" || event.key === "ArrowUp" || event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      setIsOpen(true);
      setHighlightedIndex(selectedIndex);
    }
  }

  function handleOptionKeyDown(event: ReactKeyboardEvent<HTMLButtonElement>, option: FontPickerOption) {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      moveHighlight(1);
      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      moveHighlight(-1);
      return;
    }

    if (event.key === "Home") {
      event.preventDefault();
      setHighlightedIndex(0);
      return;
    }

    if (event.key === "End") {
      event.preventDefault();
      setHighlightedIndex(options.length - 1);
      return;
    }

    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      commitSelection(option);
      return;
    }

    if (event.key === "Escape") {
      event.preventDefault();
      setIsOpen(false);
      buttonRef.current?.focus();
    }
  }

  return (
    <div className="font-picker" dir="rtl">
      <button
        ref={buttonRef}
        type="button"
        className={cx("font-picker-trigger", isOpen && "is-open")}
        aria-label={ariaLabel}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-controls={`${pickerId}-listbox`}
        onClick={() => setIsOpen((current) => !current)}
        onKeyDown={handleButtonKeyDown}
      >
        <span className="font-picker-trigger-copy">
          <span className="font-picker-label">{selectedOption?.label || placeholder}</span>
          <span className="font-picker-meta">
            {selectedOption ? selectedOption.usageHint : defaultHint}
            {selectedOption?.englishLabel ? ` • ${selectedOption.englishLabel}` : ""}
          </span>
        </span>
        <span className="font-picker-chevron" aria-hidden="true">
          ▾
        </span>
      </button>

      {isOpen ? (
        <ul
          id={`${pickerId}-listbox`}
          ref={listRef}
          className="font-picker-menu"
          role="listbox"
          aria-label={ariaLabel}
        >
          {options.map((option, index) => {
            const isSelected = (option.fontKey || "") === (selectedOption?.fontKey || "");

            return (
              <li key={option.fontKey || "default"} className="font-picker-item" role="presentation">
                <button
                  ref={(element) => {
                    optionRefs.current[index] = element;
                  }}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  className={cx(
                    "font-picker-option",
                    isSelected && "is-selected",
                    highlightedIndex === index && "is-highlighted"
                  )}
                  onMouseEnter={() => setHighlightedIndex(index)}
                  onClick={() => commitSelection(option)}
                  onKeyDown={(event) => handleOptionKeyDown(event, option)}
                >
                  <span className="font-picker-option-main">
                    <span className="font-picker-option-copy">
                      <span className="font-picker-label">{option.label}</span>
                      <span className="font-picker-meta">
                        {option.usageHint}
                        {option.englishLabel ? ` • ${option.englishLabel}` : ""}
                      </span>
                    </span>
                    {isSelected ? (
                      <span className="font-picker-check" aria-hidden="true">
                        ✓
                      </span>
                    ) : null}
                  </span>
                  <span className="font-picker-preview" style={{ fontFamily: option.cssFontFamily }}>
                    {option.previewText}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}
