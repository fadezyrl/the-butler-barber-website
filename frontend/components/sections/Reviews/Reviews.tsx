"use client";

import {
  startTransition,
  useEffect,
  useEffectEvent,
  useRef,
  useState,
} from "react";

import { useLanguage } from "@/context/LanguageContext";
import { useSiteContent } from "@/context/SiteContentContext";

const AUTO_MS = 7000;
const SWIPE_PX = 48;

const padIndex = (value: number): string =>
  String(value).padStart(2, "0");

export const Reviews = (): React.JSX.Element => {
  const { dictionary, locale } = useLanguage();
  const { siteConfig } = useSiteContent();
  const reviews = siteConfig.reviews;
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);
  const touchStartX = useRef<number | null>(null);

  const goTo = useEffectEvent((next: number): void => {
    if (reviews.length === 0) return;
    const wrapped = ((next % reviews.length) + reviews.length) % reviews.length;
    startTransition(() => setIndex(wrapped));
  });

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = (): void => setReduceMotion(media.matches);
    sync();
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    if (reviews.length < 2 || paused || reduceMotion) return;

    const id = window.setInterval(() => {
      goTo(index + 1);
    }, AUTO_MS);

    return () => window.clearInterval(id);
  }, [goTo, index, paused, reduceMotion, reviews.length]);

  if (reviews.length === 0) {
    return (
      <section className="reviews" id="reviews">
        <p className="reviews-eyebrow">{dictionary.reviews.eyebrow}</p>
        <div className="q-mark" aria-hidden="true">
          “
        </div>
        <div className="review-body">
          <div className="review-empty">
            <p className="review-quote">{dictionary.reviews.emptyQuote}</p>
            <p className="review-empty-body">{dictionary.reviews.emptyBody}</p>
            <div className="review-foot">
              <a
                className="link-line"
                href={siteConfig.googleReviewsUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                {dictionary.reviews.readOnGoogle}
              </a>
            </div>
          </div>
        </div>
      </section>
    );
  }

  const label = dictionary.reviews.slideLabel
    .replace("{current}", String(index + 1))
    .replace("{total}", String(reviews.length));

  const getQuote = (review: (typeof reviews)[number]): string => {
    if (locale === "ar" && review.quoteAr) return review.quoteAr;
    return review.quote;
  };

  return (
    <section
      className="reviews"
      id="reviews"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
          setPaused(false);
        }
      }}
    >
      <p className="reviews-eyebrow">{dictionary.reviews.eyebrow}</p>

      <div className="q-mark" aria-hidden="true">
        “
      </div>

      <div
        className="review-carousel"
        aria-roledescription="carousel"
        aria-label={dictionary.reviews.eyebrow}
        tabIndex={0}
        onKeyDown={(event) => {
          if (event.key === "ArrowRight") {
            event.preventDefault();
            goTo(index + 1);
          }
          if (event.key === "ArrowLeft") {
            event.preventDefault();
            goTo(index - 1);
          }
        }}
      >
        <div
          className="review-viewport"
          onTouchStart={(event) => {
            touchStartX.current = event.changedTouches[0]?.clientX ?? null;
          }}
          onTouchEnd={(event) => {
            if (touchStartX.current === null) return;
            const endX = event.changedTouches[0]?.clientX;
            if (endX === undefined) return;
            const delta = endX - touchStartX.current;
            touchStartX.current = null;
            if (Math.abs(delta) < SWIPE_PX) return;
            goTo(delta < 0 ? index + 1 : index - 1);
          }}
        >
          {reviews.map((review, i) => (
            <blockquote
              key={`${review.name}-${i}`}
              className={
                i === index ? "review-slide is-active" : "review-slide"
              }
              aria-hidden={i !== index}
              {...(i === index
                ? { "aria-live": "polite" as const }
                : {})}
            >
              <p className="review-quote">{getQuote(review)}</p>
              <footer className="review-by">
                <div className="review-meta">
                  <strong>{review.name}</strong>
                  <span>{review.source}</span>
                </div>
                <div className="review-stars" aria-hidden="true">
                  {Array.from({ length: 5 }, (_, star) => (
                    <span key={star} />
                  ))}
                </div>
              </footer>
            </blockquote>
          ))}
        </div>

        <div className="review-controls">
          <div className="review-index" aria-live="polite">
            <span>{padIndex(index + 1)}</span>
            <i aria-hidden="true" />
            <span>{padIndex(reviews.length)}</span>
            <span className="sr-only">{label}</span>
          </div>

          <div
            className={
              paused || reduceMotion
                ? "review-progress is-paused"
                : "review-progress"
            }
            key={`${index}-${paused}-${reduceMotion}`}
            aria-hidden="true"
          >
            <span style={{ animationDuration: `${AUTO_MS}ms` }} />
          </div>

          <div className="review-nav" role="group" aria-label={label}>
            <button
              type="button"
              aria-label={dictionary.a11y.prevReview}
              onClick={() => goTo(index - 1)}
            >
              ←
            </button>
            <div className="review-dots">
              {reviews.map((review, i) => (
                <button
                  key={`${review.name}-dot-${i}`}
                  type="button"
                  className={i === index ? "is-active" : undefined}
                  aria-label={dictionary.reviews.slideLabel
                    .replace("{current}", String(i + 1))
                    .replace("{total}", String(reviews.length))}
                  aria-current={i === index ? "true" : undefined}
                  onClick={() => goTo(i)}
                />
              ))}
            </div>
            <button
              type="button"
              aria-label={dictionary.a11y.nextReview}
              onClick={() => goTo(index + 1)}
            >
              →
            </button>
          </div>
        </div>

        <div className="review-foot">
          <a
            className="link-line"
            href={siteConfig.googleReviewsUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            {dictionary.reviews.readOnGoogle}
          </a>
        </div>
      </div>
    </section>
  );
};
