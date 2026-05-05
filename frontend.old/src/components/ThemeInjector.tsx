"use client";

/**
 * BR-003: White-label ThemeInjector
 * Fetches institution theme on mount and injects CSS custom properties
 * into :root so the entire app respects the institution's branding.
 */

import { useEffect } from "react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

function hexToHsl(hex: string): string | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex.trim());
  if (!result) return null;
  let r = parseInt(result[1], 16) / 255;
  let g = parseInt(result[2], 16) / 255;
  let b = parseInt(result[3], 16) / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0;
  const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }
  return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
}

export function ThemeInjector({ institutionId = 1 }: { institutionId?: number }) {
  useEffect(() => {
    const apply = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/v1/institution/theme?institution_id=${institutionId}`);
        if (!res.ok) return;
        const theme = await res.json();

        const root = document.documentElement;

        if (theme.primary_color) {
          root.style.setProperty("--brand-primary", theme.primary_color);
          const hsl = hexToHsl(theme.primary_color);
          if (hsl) root.style.setProperty("--brand-primary-hsl", hsl);
        }
        if (theme.accent_color) {
          root.style.setProperty("--brand-accent", theme.accent_color);
          const hsl = hexToHsl(theme.accent_color);
          if (hsl) root.style.setProperty("--brand-accent-hsl", hsl);
        }
        if (theme.favicon_url) {
          let link = document.querySelector<HTMLLinkElement>("link[rel~='icon']");
          if (!link) {
            link = document.createElement("link");
            link.rel = "icon";
            document.head.appendChild(link);
          }
          link.href = theme.favicon_url;
        }
        if (theme.platform_name) {
          document.title = document.title.replace(/^VOKASI/, theme.platform_name);
        }

        // Store for other components to read synchronously
        if (theme.custom_logo_url) {
          root.style.setProperty("--brand-logo-url", `url(${theme.custom_logo_url})`);
          sessionStorage.setItem("brand_logo_url", theme.custom_logo_url);
        }
        if (theme.platform_name) {
          sessionStorage.setItem("brand_platform_name", theme.platform_name);
        }
      } catch {
        // Non-fatal — falls back to VOKASI defaults
      }
    };
    apply();
  }, [institutionId]);

  return null;
}
