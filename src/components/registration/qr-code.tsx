"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";

export function QrCode({ payload, size = 240 }: { payload: string; size?: number }) {
  const [dataUrl, setDataUrl] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    QRCode.toDataURL(payload, {
      width: size,
      margin: 1,
      color: { dark: "#0B132B", light: "#FFFFFF" },
    }).then((url) => {
      if (!cancelled) setDataUrl(url);
    });

    return () => {
      cancelled = true;
    };
  }, [payload, size]);

  if (!dataUrl) {
    return (
      <div
        style={{ maxWidth: size, aspectRatio: "1 / 1" }}
        className="mx-auto w-full animate-pulse rounded-xl bg-muted"
      />
    );
  }

  return (
    // next/image can't optimize a data: URI; a plain <img> is correct here.
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={dataUrl}
      width={size}
      height={size}
      alt="ABA KHQR payment code"
      style={{ maxWidth: size }}
      className="mx-auto h-auto w-full rounded-xl border border-border"
    />
  );
}
