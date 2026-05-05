/**
 * VOKASI Brand Identity — Central source of truth for user-visible branding.
 *
 * Per vokasi2.prd §5.1 (BR-001, BR-002):
 *   - All legacy names (CENDIKIA, T6, TSEA-X) are deprecated and unified under VOKASI.
 *   - Deep Forest palette: emerald #064e3b, charcoal #1f2937, off-white #fafaf9.
 *   - Typography: Inter (body) + JetBrains Mono (code).
 */

export const BRAND = {
    name: 'VOKASI',
    tagline: 'AI-native vocational education for Indonesia',
    shortDescription:
        'AI-native vocational education platform — build, teach, and learn with AI-grounded courses tailored for Indonesian SMK, politeknik, and BLK.',
    website: 'vokasi.id',
    supportEmail: 'hello@vokasi.id',

    // Legacy → New mapping (for reference / migration labels only).
    legacyMap: {
        CENDIKIA: 'VOKASI',
        T6: 'VOKASI Core',
        'TSEA-X': 'VOKASI Cloud',
        OpenMAIC: 'VOKASI AI Engine',
        Hermes: 'VOKASI Tutor',
    } as const,

    // Product sub-brands
    products: {
        core: 'VOKASI Core', // Backend / API (was T6)
        cloud: 'VOKASI Cloud', // Cloud deployment tier (was TSEA-X)
        ai: 'VOKASI AI Engine', // AI orchestration (was OpenMAIC)
        tutor: 'VOKASI Tutor', // Conversational AI agent (was Hermes)
    },
} as const;

export const THEME = {
    colors: {
        primary: '#064e3b', // Deep Forest emerald
        primaryLight: '#065f46',
        primaryDark: '#022c22',
        charcoal: '#1f2937',
        offWhite: '#fafaf9',
        accent: '#10b981',
    },
    fonts: {
        sans: 'Inter, system-ui, -apple-system, Segoe UI, Roboto, sans-serif',
        mono: '"JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, monospace',
    },
} as const;

export type BrandConfig = typeof BRAND;
export type ThemeConfig = typeof THEME;
