import type { JSX } from "react";

import type { MediaSlot } from "@/data/site-config";

type PhotoSlotProps = {
  image: MediaSlot;
  caption: string;
  eager?: boolean;
};

export const PhotoSlot = ({
  image,
  caption,
  eager = false,
}: PhotoSlotProps): JSX.Element => {
  const hasMedia = Boolean(image.src);
  const label = image.alt || caption;

  return (
    <figure className={hasMedia ? "ph has-img" : "ph"}>
      {hasMedia && image.kind === "video" ? (
        <video
          src={image.src}
          aria-label={label}
          autoPlay
          muted
          loop
          playsInline
          preload={eager ? "auto" : "metadata"}
        />
      ) : null}
      {hasMedia && image.kind === "image" ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={image.src}
          alt={label}
          decoding="async"
          loading={eager ? "eager" : "lazy"}
        />
      ) : null}
      {!hasMedia ? <figcaption>{caption}</figcaption> : null}
    </figure>
  );
};
