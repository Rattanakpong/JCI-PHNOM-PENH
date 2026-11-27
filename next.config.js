const createNextIntlPlugin = require("next-intl/plugin");

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const r2Url = process.env.R2_PUBLIC_URL ? new URL(process.env.R2_PUBLIC_URL) : null;
const r2Host = r2Url ? r2Url.origin : "";

const contentSecurityPolicy = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
  "style-src 'self' 'unsafe-inline'",
  `img-src 'self' data: https://*.supabase.co ${r2Host}`.trim(),
  "font-src 'self' data:",
  `connect-src 'self' https://*.supabase.co ${r2Host}`.trim(),
  "frame-ancestors 'none'",
].join("; ");

const securityHeaders = [
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  { key: "Content-Security-Policy", value: contentSecurityPolicy },
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "res.cloudinary.com" },
      { protocol: "https", hostname: "*.supabase.co" },
      // Admin-uploaded photos (slides, member/board/partner photos, event
      // banners) are served from R2_PUBLIC_URL — without this pattern
      // next/image can't optimize them, so callers fall back to plain
      // <img> and ship full-resolution originals to every visitor.
      ...(r2Url ? [{ protocol: r2Url.protocol.replace(":", ""), hostname: r2Url.hostname }] : []),
    ],
  },
  experimental: {
    // Server actions default to a 1MB request body, far below
    // MAX_UPLOAD_MB in src/lib/upload-limits.ts — every admin image/PDF
    // upload form posts straight to a server action, so this must stay in
    // sync with that constant or uploads over 1MB fail silently.
    serverActions: { bodySizeLimit: "20mb" },
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
};

module.exports = withNextIntl(nextConfig);
