"use client";

import { useEffect, useState } from "react";

import { BookLink } from "@/components/ui/BookLink";
import { BrandMark } from "@/components/ui/BrandMark";
import { LangSwitcher } from "@/components/ui/LangSwitcher";
import { useLanguage } from "@/context/LanguageContext";

export const Header = (): React.JSX.Element => {
  const { dictionary } = useLanguage();
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    let lastY = window.scrollY;
    let ticking = false;

    const update = (): void => {
      const y = window.scrollY;
      const delta = y - lastY;

      setScrolled(y > 40);

      if (menuOpen || y < 72) {
        setHidden(false);
      } else if (delta > 8) {
        setHidden(true);
      } else if (delta < -8) {
        setHidden(false);
      }

      lastY = y;
      ticking = false;
    };

    const onScroll = (): void => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [menuOpen]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent): void => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    document.body.classList.toggle("menu-open", menuOpen);
    return () => document.body.classList.remove("menu-open");
  }, [menuOpen]);

  useEffect(() => {
    const media = window.matchMedia("(min-width: 1001px)");
    const onChange = (event: MediaQueryListEvent | MediaQueryList): void => {
      if (event.matches) setMenuOpen(false);
    };
    onChange(media);
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, []);

  const closeMenu = (): void => setMenuOpen(false);

  return (
    <header
      className={[
        "nav",
        scrolled ? "scrolled" : "",
        hidden ? "nav-hidden" : "",
        menuOpen ? "menu-open" : "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <a className="brand" href="#top" aria-label={dictionary.brand.homeAria}>
        <BrandMark />
      </a>

      <nav className="nav-links" id="navLinks" aria-label={dictionary.a11y.mainNav}>
        <a href="#story" onClick={closeMenu}>
          {dictionary.nav.story}
        </a>
        <a href="#services" onClick={closeMenu}>
          {dictionary.nav.services}
        </a>
        <a href="#work" onClick={closeMenu}>
          {dictionary.nav.work}
        </a>
        <a href="#contact" onClick={closeMenu}>
          {dictionary.nav.contact}
        </a>
        <BookLink className="book" />
      </nav>

      <div className="nav-end">
        <LangSwitcher />
        <button
          className="menu-btn"
          type="button"
          aria-label={menuOpen ? dictionary.a11y.closeMenu : dictionary.a11y.openMenu}
          aria-expanded={menuOpen}
          aria-controls="navLinks"
          onClick={() => setMenuOpen((open) => !open)}
        >
          <span />
          <span />
        </button>
      </div>
    </header>
  );
};
