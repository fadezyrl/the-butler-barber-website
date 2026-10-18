"use client";

import {
  useEffect,
  useId,
  useRef,
  useState,
  type JSX,
  type KeyboardEvent,
} from "react";

import { useLanguage } from "@/context/LanguageContext";
import type { Locale } from "@/data/dictionary";

const OPTIONS: Locale[] = ["en", "ar"];

export const LangSwitcher = (): JSX.Element => {
  const { locale, dictionary, setLocale } = useLanguage();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const listId = useId();

  useEffect(() => {
    if (!open) return;

    const onPointerDown = (event: MouseEvent): void => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    const onKey = (event: globalThis.KeyboardEvent): void => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const currentLabel = locale === "ar" ? dictionary.lang.ar : dictionary.lang.en;

  const select = (next: Locale): void => {
    setLocale(next);
    setOpen(false);
  };

  const onTriggerKeyDown = (event: KeyboardEvent<HTMLButtonElement>): void => {
    if (event.key === "ArrowDown" || event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      setOpen(true);
    }
  };

  return (
    <div className={open ? "lang-switch is-open" : "lang-switch"} ref={rootRef}>
      <button
        type="button"
        className="lang-switch-trigger"
        aria-label={dictionary.lang.switchTo}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        onClick={() => setOpen((value) => !value)}
        onKeyDown={onTriggerKeyDown}
      >
        <span>{currentLabel}</span>
        <svg viewBox="0 0 12 8" aria-hidden="true" focusable="false">
          <path
            d="M1 1.5L6 6.5L11 1.5"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.25"
          />
        </svg>
      </button>

      <ul
        className="lang-switch-menu"
        id={listId}
        role="listbox"
        aria-label={dictionary.lang.switchTo}
        hidden={!open}
      >
        {OPTIONS.map((option) => {
          const label =
            option === "ar" ? dictionary.lang.arFull : dictionary.lang.enFull;
          const selected = option === locale;

          return (
            <li key={option} role="presentation">
              <button
                type="button"
                role="option"
                aria-selected={selected}
                className={selected ? "is-active" : undefined}
                onClick={() => select(option)}
              >
                <span className="lang-switch-code">
                  {option === "ar" ? dictionary.lang.ar : dictionary.lang.en}
                </span>
                <span>{label}</span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
};
