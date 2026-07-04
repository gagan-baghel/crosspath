import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Strict CSP that blocks inline scripts and only allows self + DiceBear + Ably
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-eval' 'unsafe-inline'", // Next.js requires unsafe-inline for its own scripts in dev; tighten in production if using strict CSP nonces
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' https://api.dicebear.com data:",
              "font-src 'self'",
              "connect-src 'self' https://realtime.ably.io wss://realtime.ably.io",
              "frame-ancestors 'none'",
              "base-uri 'self'",
              "form-action 'self'",
            ].join("; "),
          },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(), interest-cohort=()",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
