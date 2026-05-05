/**
 * Layout Configuration - Templates for all block types
 * Defines available layouts with thumbnails and descriptions
 */

import { BlockCategory, LayoutTemplate, VideoLayout, ImageLayout, TextLayout, ActionLayout } from './types';

// ============================================================================
// VIDEO LAYOUTS
// ============================================================================

export const videoLayouts: Record<VideoLayout, LayoutTemplate> = {
    'video-bottom': {
        layout: 'video-bottom',
        label: 'Video on the bottom',
        description: 'Full-width video with heading and text above',
        thumbnail: '<svg viewBox="0 0 200 150" xmlns="http://www.w3.org/2000/svg"><rect width="200" height="150" fill="#f3f4f6"/><rect y="10" width="200" height="60" fill="#e5e7eb" rx="4"/><text x="10" y="30" font-size="14" font-weight="bold" fill="#374151">Heading</text><text x="10" y="50" font-size="10" fill="#6b7280">Text content goes here...</text><rect y="80" width="200" height="60" fill="#dbeafe" rx="4"/><circle cx="100" cy="110" r="15" fill="#3b82f6"/><polygon points="95,105 95,115 108,110" fill="white"/></svg>'
    },
    'two-videos': {
        layout: 'two-videos',
        label: 'Two videos',
        description: 'Side-by-side videos with individual headings',
        thumbnail: '<svg viewBox="0 0 200 150" xmlns="http://www.w3.org/2000/svg"><rect width="200" height="150" fill="#f3f4f6"/><rect x="5" y="20" width="90" height="60" fill="#dbeafe" rx="4"/><circle cx="50" cy="50" r="12" fill="#3b82f6"/><polygon points="46,45 46,55 56,50" fill="white"/><text x="10" y="95" font-size="10" font-weight="bold" fill="#374151">Heading</text><rect x="105" y="20" width="90" height="60" fill="#dbeafe" rx="4"/><circle cx="150" cy="50" r="12" fill="#3b82f6"/><polygon points="146,45 146,55 156,50" fill="white"/><text x="110" y="95" font-size="10" font-weight="bold" fill="#374151">Heading</text></svg>'
    },
    'video-left': {
        layout: 'video-left',
        label: 'Video on the left',
        description: 'Video on left (50%) with text content on right',
        thumbnail: '<svg viewBox="0 0 200 150" xmlns="http://www.w3.org/2000/svg"><rect width="200" height="150" fill="#f3f4f6"/><rect x="5" y="20" width="85" height="110" fill="#dbeafe" rx="4"/><circle cx="47.5" cy="75" r="15" fill="#3b82f6"/><polygon points="42.5,70 42.5,80 55,75" fill="white"/><rect x="100" y="20" width="95" height="30" fill="#e5e7eb" rx="2"/><text x="105" y="37" font-size="11" font-weight="bold" fill="#374151">Heading</text><text x="105" y="60" font-size="8" fill="#6b7280">Text content...</text><text x="105" y="72" font-size="8" fill="#6b7280">More text here...</text></svg>'
    },
    'video-right': {
        layout: 'video-right',
        label: 'Video on the right',
        description: 'Text on left, video on right (50%)',
        thumbnail: '<svg viewBox="0 0 200 150" xmlns="http://www.w3.org/2000/svg"><rect width="200" height="150" fill="#f3f4f6"/><rect x="5" y="20" width="85" height="30" fill="#e5e7eb" rx="2"/><text x="10" y="37" font-size="11" font-weight="bold" fill="#374151">Heading</text><text x="10" y="60" font-size="8" fill="#6b7280">Text content...</text><text x="10" y="72" font-size="8" fill="#6b7280">More text here...</text><rect x="100" y="20" width="95" height="110" fill="#dbeafe" rx="4"/><circle cx="147.5" cy="75" r="15" fill="#3b82f6"/><polygon points="142.5,70 142.5,80 155,75" fill="white"/></svg>'
    },
    'audio-player': {
        layout: 'audio-player',
        label: 'Audio title',
        description: 'Audio player with waveform and timeline',
        thumbnail: '<svg viewBox="0 0 200 150" xmlns="http://www.w3.org/2000/svg"><rect width="200" height="150" fill="#f3f4f6"/><rect x="20" y="50" width="160" height="50" fill="white" stroke="#e5e7eb" stroke-width="2" rx="6"/><circle cx="45" cy="75" r="12" fill="#3b82f6"/><polygon points="41,70 41,80 51,75" fill="white"/><rect x="70" y="70" width="80" height="4" fill="#dbeafe" rx="2"/><rect x="70" y="70" width="30" height="4" fill="#3b82f6" rx="2"/><circle cx="100" cy="72" r="5" fill="#3b82f6"/><text x="155" y="78" font-size="10" fill="#6b7280">0:26</text></svg>'
    }
};

// ============================================================================
// IMAGE LAYOUTS
// ============================================================================

export const imageLayouts: Record<ImageLayout, LayoutTemplate> = {
    'single-image': {
        layout: 'single-image',
        label: 'Single image',
        description: 'Full-width image with optional caption',
        thumbnail: '<svg viewBox="0 0 200 150" xmlns="http://www.w3.org/2000/svg"><rect width="200" height="150" fill="#f3f4f6"/><rect x="10" y="20" width="180" height="100" fill="#dbeafe" rx="4"/><circle cx="60" cy="50" r="15" fill="#93c5fd"/><polygon points="20,100 80,60 120,80 180,50 180,110 20,110" fill="#60a5fa"/><text x="100" y="135" text-anchor="middle" font-size="9" fill="#6b7280">Caption text</text></svg>'
    },
    'image-top': {
        layout: 'image-top',
        label: 'Image on the top',
        description: 'Image above, text below',
        thumbnail: '<svg viewBox="0 0 200 150" xmlns="http://www.w3.org/2000/svg"><rect width="200" height="150" fill="#f3f4f6"/><rect x="10" y="10" width="180" height="70" fill="#dbeafe" rx="4"/><circle cx="50" cy="35" r="12" fill="#93c5fd"/><polygon points="20,65 60,40 90,52 180,30 180,75 20,75" fill="#60a5fa"/><rect x="10" y="90" width="180" height="50" fill="#e5e7eb" rx="2"/><text x="15" y="105" font-size="9" fill="#6b7280">Text content goes here...</text></svg>'
    },
    'image-bottom': {
        layout: 'image-bottom',
        label: 'Image on the bottom',
        description: 'Text above, image below',
        thumbnail: '<svg viewBox="0 0 200 150" xmlns="http://www.w3.org/2000/svg"><rect width="200" height="150" fill="#f3f4f6"/><rect x="10" y="10" width="180" height="50" fill="#e5e7eb" rx="2"/><text x="15" y="30" font-size="9" fill="#6b7280">Text content goes here...</text><rect x="10" y="70" width="180" height="70" fill="#dbeafe" rx="4"/><circle cx="50" cy="95" r="12" fill="#93c5fd"/><polygon points="20,125 60,100 90,112 180,90 180,135 20,135" fill="#60a5fa"/></svg>'
    },
    'two-images': {
        layout: 'two-images',
        label: 'Two images',
        description: 'Two images side-by-side with captions',
        thumbnail: '<svg viewBox="0 0 200 150" xmlns="http://www.w3.org/2000/svg"><rect width="200" height="150" fill="#f3f4f6"/><rect x="5" y="15" width="90" height="80" fill="#dbeafe" rx="4"/><circle cx="30" cy="40" r="10" fill="#93c5fd"/><polygon points="10,80 40,50 60,65 90,45 90,90 10,90" fill="#60a5fa"/><text x="10" y="110" font-size="8" font-weight="bold" fill="#374151">Heading</text><rect x="105" y="15" width="90" height="80" fill="#dbeafe" rx="4"/><circle cx="130" cy="40" r="10" fill="#93c5fd"/><polygon points="110,80 140,50 160,65 190,45 190,90 110,90" fill="#60a5fa"/><text x="110" y="110" font-size="8" font-weight="bold" fill="#374151">Heading</text></svg>'
    },
    'three-images': {
        layout: 'three-images',
        label: 'Three images',
        description: 'Three images in a row',
        thumbnail: '<svg viewBox="0 0 200 150" xmlns="http://www.w3.org/2000/svg"><rect width="200" height="150" fill="#f3f4f6"/><rect x="5" y="20" width="58" height="70" fill="#dbeafe" rx="3"/><circle cx="22" cy="40" r="8" fill="#93c5fd"/><polygon points="8,75 25,53 38,62 58,48 58,87 8,87" fill="#60a5fa"/><text x="8" y="105" font-size="7" font-weight="bold" fill="#374151">Heading</text><rect x="71" y="20" width="58" height="70" fill="#dbeafe" rx="3"/><circle cx="88" cy="40" r="8" fill="#93c5fd"/><polygon points="74,75 91,53 104,62 124,48 124,87 74,87" fill="#60a5fa"/><text x="74" y="105" font-size="7" font-weight="bold" fill="#374151">Heading</text><rect x="137" y="20" width="58" height="70" fill="#dbeafe" rx="3"/><circle cx="154" cy="40" r="8" fill="#93c5fd"/><polygon points="140,75 157,53 170,62 190,48 190,87 140,87" fill="#60a5fa"/><text x="140" y="105" font-size="7" font-weight="bold" fill="#374151">Heading</text></svg>'
    },
    'image-gallery': {
        layout: 'image-gallery',
        label: 'Image gallery',
        description: 'Grid gallery with lightbox viewer',
        thumbnail: '<svg viewBox="0 0 200 150" xmlns="http://www.w3.org/2000/svg"><rect width="200" height="150" fill="#f3f4f6"/><rect x="10" y="15" width="55" height="50" fill="#dbeafe" rx="3"/><rect x="72.5" y="15" width="55" height="50" fill="#dbeafe" rx="3"/><rect x="135" y="15" width="55" height="50" fill="#dbeafe" rx="3"/><rect x="10" y="72.5" width="55" height="50" fill="#dbeafe" rx="3"/><rect x="72.5" y="72.5" width="55" height="50" fill="#dbeafe" rx="3"/><rect x="135" y="72.5" width="55" height="50" fill="#dbeafe" rx="3"/></svg>'
    }
};

// ============================================================================
// TEXT LAYOUTS
// ============================================================================

export const textLayouts: Record<TextLayout, LayoutTemplate> = {
    'heading-text': {
        layout: 'heading-text',
        label: 'Heading and Text',
        description: 'Large heading with paragraph below',
        thumbnail: '<svg viewBox="0 0 200 150" xmlns="http://www.w3.org/2000/svg"><rect width="200" height="150" fill="#f3f4f6"/><text x="20" y="40" font-size="20" font-weight="bold" fill="#1f2937">Heading</text><text x="20" y="70" font-size="10" fill="#6b7280">This is a paragraph. Simply drag and drop into the editor</text><text x="20" y="85" font-size="10" fill="#6b7280">to start writing that informs, inspires, or encourages</text><text x="20" y="100" font-size="10" fill="#6b7280">your community. Happy editing!</text></svg>'
    },
    'text-only': {
        layout: 'text-only',
        label: 'Text',
        description: 'Plain paragraph text',
        thumbnail: '<svg viewBox="0 0 200 150" xmlns="http://www.w3.org/2000/svg"><rect width="200" height="150" fill="#f3f4f6"/><text x="20" y="50" font-size="10" fill="#6b7280">Simply drag and drop into the editor to start writing</text><text x="20" y="65" font-size="10" fill="#6b7280">that informs, inspires, or encourages your community.</text><text x="20" y="80" font-size="10" fill="#6b7280">Happy editing!</text></svg>'
    },
    'two-columns': {
        layout: 'two-columns',
        label: 'Two Columns',
        description: 'Side-by-side text columns',
        thumbnail: '<svg viewBox="0 0 200 150" xmlns="http://www.w3.org/2000/svg"><rect width="200" height="150" fill="#f3f4f6"/><text x="10" y="35" font-size="11" font-weight="bold" fill="#1f2937">Heading</text><text x="10" y="55" font-size="8" fill="#6b7280">Simply drag and drop</text><text x="10" y="67" font-size="8" fill="#6b7280">to start writing.</text><text x="105" y="35" font-size="11" font-weight="bold" fill="#1f2937">Heading</text><text x="105" y="55" font-size="8" fill="#6b7280">Simply drag and drop</text><text x="105" y="67" font-size="8" fill="#6b7280">to start writing.</text></svg>'
    },
    'heading-two-columns': {
        layout: 'heading-two-columns',
        label: 'Heading and two columns',
        description: 'Heading above with two text columns below',
        thumbnail: '<svg viewBox="0 0 200 150" xmlns="http://www.w3.org/2000/svg"><rect width="200" height="150" fill="#f3f4f6"/><text x="20" y="30" font-size="14" font-weight="bold" fill="#1f2937">Heading</text><text x="15" y="55" font-size="8" fill="#6b7280">Simply drag and drop</text><text x="15" y="67" font-size="8" fill="#6b7280">into the editor to start</text><text x="15" y="79" font-size="8" fill="#6b7280">writing.</text><text x="105" y="55" font-size="8" fill="#6b7280">Simply drag and drop</text><text x="105" y="67" font-size="8" fill="#6b7280">into the editor to start</text><text x="105" y="79" font-size="8" fill="#6b7280">writing.</text></svg>'
    },
    'three-columns': {
        layout: 'three-columns',
        label: 'Three columns',
        description: 'Three equal text columns',
        thumbnail: '<svg viewBox="0 0 200 150" xmlns="http://www.w3.org/2000/svg"><rect width="200" height="150" fill="#f3f4f6"/><text x="8" y="35" font-size="9" font-weight="bold" fill="#1f2937">Heading</text><text x="8" y="52" font-size="7" fill="#6b7280">Simply drag</text><text x="8" y="62" font-size="7" fill="#6b7280">and drop to</text><text x="8" y="72" font-size="7" fill="#6b7280">start writing.</text><text x="72" y="35" font-size="9" font-weight="bold" fill="#1f2937">Heading</text><text x="72" y="52" font-size="7" fill="#6b7280">Simply drag</text><text x="72" y="62" font-size="7" fill="#6b7280">and drop to</text><text x="72" y="72" font-size="7" fill="#6b7280">start writing.</text><text x="136" y="35" font-size="9" font-weight="bold" fill="#1f2937">Heading</text><text x="136" y="52" font-size="7" fill="#6b7280">Simply drag</text><text x="136" y="62" font-size="7" fill="#6b7280">and drop to</text><text x="136" y="72" font-size="7" fill="#6b7280">start writing.</text></svg>'
    }
};

// ============================================================================
// ACTION LAYOUTS
// ============================================================================

export const actionLayouts: Record<ActionLayout, LayoutTemplate> = {
    'image-hotspot': {
        layout: 'image-hotspot',
        label: 'Image hotspot',
        description: 'Interactive image with clickable markers',
        thumbnail: '<svg viewBox="0 0 200 150" xmlns="http://www.w3.org/2000/svg"><rect width="200" height="150" fill="#f3f4f6"/><rect x="20" y="20" width="160" height="110" fill="#dbeafe" rx="4"/><circle cx="80" cy="50" r="15" fill="#3b82f6"/><text x="80" y="55" text-anchor="middle" font-size="18" font-weight="bold" fill="white">+</text><circle cx="140" cy="80" r="15" fill="#3b82f6"/><text x="140" y="85" text-anchor="middle" font-size="18" font-weight="bold" fill="white">+</text></svg>'
    },
    'flip-card': {
        layout: 'flip-card',
        label: 'Flip card',
        description: 'Cards that flip to reveal back content',
        thumbnail: '<svg viewBox="0 0 200 150" xmlns="http://www.w3.org/2000/svg"><rect width="200" height="150" fill="#f3f4f6"/><rect x="15" y="30" width="50" height="70" fill="white" stroke="#e5e7eb" stroke-width="2" rx="4"/><text x="40" y="60" text-anchor="middle" font-size="10" fill="#6b7280">Card 1</text><rect x="75" y="30" width="50" height="70" fill="white" stroke="#e5e7eb" stroke-width="2" rx="4"/><text x="100" y="60" text-anchor="middle" font-size="10" fill="#6b7280">Card 2</text><rect x="135" y="30" width="50" height="70" fill="white" stroke="#e5e7eb" stroke-width="2" rx="4"/><text x="160" y="60" text-anchor="middle" font-size="10" fill="#6b7280">Card 3</text></svg>'
    },
    'fit-button': {
        layout: 'fit-button',
        label: 'Fit button',
        description: 'Compact grouped buttons',
        thumbnail: '<svg viewBox="0 0 200 150" xmlns="http://www.w3.org/2000/svg"><rect width="200" height="150" fill="#f3f4f6"/><rect x="40" y="55" width="35" height="20" fill="white" stroke="#e5e7eb" stroke-width="1.5" rx="3"/><circle cx="50" cy="65" r="4" fill="#9ca3af"/><text x="56" y="68" font-size="8" fill="#6b7280">Button</text><rect x="82.5" y="55" width="35" height="20" fill="white" stroke="#e5e7eb" stroke-width="1.5" rx="3"/><circle cx="92.5" cy="65" r="4" fill="#9ca3af"/><text x="98.5" y="68" font-size="8" fill="#6b7280">Button</text><rect x="125" y="55" width="35" height="20" fill="white" stroke="#e5e7eb" stroke-width="1.5" rx="3"/><circle cx="135" cy="65" r="4" fill="#9ca3af"/><text x="141" y="68" font-size="8" fill="#6b7280">Button</text></svg>'
    },
    'full-button': {
        layout: 'full-button',
        label: 'Full button',
        description: 'Large full-width call-to-action button',
        thumbnail: '<svg viewBox="0 0 200 150" xmlns="http://www.w3.org/2000/svg"><rect width="200" height="150" fill="#f3f4f6"/><rect x="30" y="60" width="140" height="30" fill="#3b82f6" rx="6"/><circle cx="55" cy="75" r="8" fill="white" opacity="0.8"/><text x="100" y="81" text-anchor="middle" font-size="12" font-weight="bold" fill="white">Button</text></svg>'
    },
    'social-button': {
        layout: 'social-button',
        label: 'Social button',
        description: 'Social media integration buttons',
        thumbnail: '<svg viewBox="0 0 200 150" xmlns="http://www.w3.org/2000/svg"><rect width="200" height="150" fill="#f3f4f6"/><rect x="35" y="55" width="25" height="25" fill="#1da1f2" rx="4"/><rect x="67.5" y="55" width="25" height="25" fill="#e4405f" rx="4"/><rect x="100" y="55" width="25" height="25" fill="#ff0000" rx="4"/><rect x="132.5" y="55" width="25" height="25" fill="#0077b5" rx="4"/><text x="100" y="105" text-anchor="middle" font-size="8" fill="#6b7280">Social buttons</text></svg>'
    },
    'button-right': {
        layout: 'button-right',
        label: 'Button on the right',
        description: 'Text on left, button on right',
        thumbnail: '<svg viewBox="0 0 200 150" xmlns="http://www.w3.org/2000/svg"><rect width="200" height="150" fill="#f3f4f6"/><text x="20" y="65" font-size="9" fill="#6b7280">Text description to explain</text><text x="20" y="78" font-size="9" fill="#6b7280">the button\'s purpose.</text><rect x="130" y="55" width="50" height="25" fill="#3b82f6" rx="4"/><text x="155" y="72" text-anchor="middle" font-size="9" font-weight="bold" fill="white">Button</text></svg>'
    },
    'numbered-cards': {
        layout: 'numbered-cards',
        label: 'Numbered cards',
        description: 'Sequential step cards with numbers',
        thumbnail: '<svg viewBox="0 0 200 150" xmlns="http://www.w3.org/2000/svg"><rect width="200" height="150" fill="#f3f4f6"/><rect x="10" y="30" width="55" height="65" fill="white" stroke="#e5e7eb" stroke-width="2" rx="4"/><text x="12" y="45" font-size="14" font-weight="bold" fill="#3b82f6">01</text><text x="12" y="60" font-size="8" fill="#6b7280">Step one</text><rect x="72.5" y="30" width="55" height="65" fill="white" stroke="#e5e7eb" stroke-width="2" rx="4"/><text x="74.5" y="45" font-size="14" font-weight="bold" fill="#3b82f6">02</text><text x="74.5" y="60" font-size="8" fill="#6b7280">Step two</text><rect x="135" y="30" width="55" height="65" fill="white" stroke="#e5e7eb" stroke-width="2" rx="4"/><text x="137" y="45" font-size="14" font-weight="bold" fill="#3b82f6">03</text><text x="137" y="60" font-size="8" fill="#6b7280">Step three</text></svg>'
    }
};

// ============================================================================
// LAYOUT TEMPLATES MAP
// ============================================================================

export const LAYOUT_TEMPLATES: Record<BlockCategory, LayoutTemplate[]> = {
    video: Object.values(videoLayouts),
    image: Object.values(imageLayouts),
    text: Object.values(textLayouts),
    actions: Object.values(actionLayouts),
    activities: [], // Activities use different UI (not layout-based)
    pdf: [],        // PDF has single layout
    embed: []       // Embed has single layout
};
