/**
 * Type definitions for WYSIWYG Course Editor - Enhanced for World-Class Features
 */

// ============================================================================
// BLOCK TYPES & CATEGORIES
// ============================================================================

// Content Block Types - Expanded
export type BlockType =
    // Text blocks
    | 'text'
    | 'heading'
    | 'list'
    | 'table'

    // Video blocks
    | 'video'
    | 'audio'

    // Image blocks
    | 'image'
    | 'image-gallery'

    // Interactive Actions
    | 'hotspot'
    | 'flip-card'
    | 'button'
    | 'numbered-cards'
    | 'community'

    // Activities
    | 'quiz'
    | 'assignment'
    | 'discussion'
    | 'survey'

    // Other
    | 'pdf'
    | 'embed'
    | 'code'
    | 'divider';

// Content Block Category
export type BlockCategory = 'video' | 'image' | 'text' | 'actions' | 'activities' | 'pdf' | 'embed';

// ============================================================================
// LAYOUT TYPES
// ============================================================================

// Layout variations for Video blocks
export type VideoLayout =
    | 'video-bottom'      // Video with heading/text above
    | 'two-videos'        // Two videos side-by-side
    | 'video-left'        // Video on left, text on right
    | 'video-right'       // Text on left, video on right
    | 'audio-player';     // Audio player with waveform

// Layout variations for Image blocks
export type ImageLayout =
    | 'single-image'      // Single full-width image
    | 'image-top'         // Image above, text below
    | 'image-bottom'      // Text above, image below
    | 'two-images'        // Two images side-by-side
    | 'three-images'      // Three images in a row
    | 'image-gallery';    // Image gallery grid

// Layout variations for Text blocks
export type TextLayout =
    | 'heading-text'      // Heading with paragraph
    | 'text-only'         // Just paragraph
    | 'two-columns'       // Two text columns
    | 'heading-two-columns'  // Heading with two columns below
    | 'three-columns';    // Three text columns

// Layout variations for Action blocks
export type ActionLayout =
    | 'image-hotspot'     // Interactive image with clickable hotspots
    | 'flip-card'         // Flip cards with front/back
    | 'fit-button'        // Compact button
    | 'full-button'       // Full-width button
    | 'social-button'     // Social media button
    | 'button-right'      // Text left, button right
    | 'numbered-cards';   // Numbered step cards

// Combined layout type
export type BlockLayout = VideoLayout | ImageLayout | TextLayout | ActionLayout | null;

// ============================================================================
// INTERACTIVE ELEMENT TYPES
// ============================================================================

// Hotspot for image interactions
export interface Hotspot {
    id: string;
    x: number;           // Position as percentage (0-100)
    y: number;           // Position as percentage (0-100)
    title: string;
    description: string;
    icon?: string;
}

// Flip card data
export interface FlipCard {
    id: string;
    front: string;       // Front content
    back: string;        // Back content
    imageUrl?: string;   // Optional image on front
}

// Button data
export interface ButtonData {
    id: string;
    text: string;
    link: string;
    icon?: string;
    variant: 'fit' | 'full' | 'social' | 'right';
    socialPlatform?: 'twitter' | 'instagram' | 'youtube' | 'tiktok' | 'linkedin';
    color?: string;
}

// Numbered card for step-by-step
export interface NumberedCard {
    id: string;
    number: number;
    heading: string;
    content: string;
}

// ============================================================================
// QUIZ & ASSESSMENT TYPES
// ============================================================================

// Quiz question - Enhanced
export interface QuizQuestion {
    id: string;
    type: 'multiple-choice' | 'true-false' | 'short-answer' | 'matching';
    question: string;
    options?: string[];
    correctAnswer: string | string[];
    explanation?: string;
    points?: number;
}

// Rubric item for assignments
export interface RubricItem {
    id: string;
    criterion: string;
    description: string;
    maxPoints: number;
}

// ============================================================================
// BLOCK METADATA
// ============================================================================

// Enhanced metadata interface
export interface BlockMetadata {
    // Video/Audio
    videoUrl?: string;
    videoUrl2?: string;              // For two-videos layout
    audioUrl?: string;
    autoplay?: boolean;
    controls?: boolean;
    loop?: boolean;
    duration?: string;

    // Image
    imageUrl?: string;
    imageUrl2?: string;              // For two-images layout
    imageUrl3?: string;              // For three-images layout
    images?: string[];               // For gallery
    caption?: string;
    altText?: string;

    // Text
    alignment?: 'left' | 'center' | 'right';
    fontSize?: 'small' | 'medium' | 'large';
    textColor?: string;
    backgroundColor?: string;

    // Interactive Actions
    hotspots?: Hotspot[];
    flipCards?: FlipCard[];
    buttons?: ButtonData[];
    numberedCards?: NumberedCard[];

    // Activities
    questions?: QuizQuestion[];
    rubric?: RubricItem[];
    deadline?: string;
    maxScore?: number;
    allowLateSubmission?: boolean;

    // PDF
    fileName?: string;
    fileUrl?: string;
    downloadable?: boolean;

    // Embed
    embedCode?: string;
    embedUrl?: string;

    // Code
    language?: string;

    // General
    title?: string;
    description?: string;
    link?: string;
    url?: string;

    [key: string]: any;
}

// ============================================================================
// CONTENT BLOCK INTERFACE
// ============================================================================

// Content Block Interface - Enhanced
export interface ContentBlock {
    id: string;
    type: BlockType;
    category: BlockCategory;
    layout?: BlockLayout;            // Layout variation for this block
    content: string;
    order: number;
    metadata?: BlockMetadata;
}

// ============================================================================
// COURSE STRUCTURE
// ============================================================================

// Page Interface
export interface Page {
    id: string;
    title: string;
    order: number;
    content: ContentBlock[];
    moduleId: string;
    description?: string;
    isPublished?: boolean;
}

// Module Interface
export interface Module {
    id: string;
    title: string;
    order: number;
    pages: Page[];
    courseId: string;
    isExpanded?: boolean;
    description?: string;
}

// Course Data
export interface CourseData {
    id: string;
    title: string;
    description?: string;
    modules: Module[];
    instructorId?: string;
    createdAt?: string;
    updatedAt?: string;
    approval_status?: string;
}

// ============================================================================
// UI & TEMPLATES
// ============================================================================

// Block Template for Right Sidebar
export interface BlockTemplate {
    type: BlockType;
    category: BlockCategory;
    label: string;
    icon: React.ReactNode;
    description: string;
    thumbnail?: string;
    color: string;
    hasLayouts?: boolean;            // Whether this block has multiple layouts
}

// Layout Template for Layout Picker
export interface LayoutTemplate {
    layout: BlockLayout;
    label: string;
    description: string;
    thumbnail: string;               // Preview image path or SVG
    isPro?: boolean;                 // For future premium features
}

// Editor State
export interface EditorState {
    course: CourseData;
    activePageId: string | null;
    activeModuleId: string | null;
    selectedBlockId: string | null;
    isPreviewMode: boolean;
    isSaving: boolean;
    hasUnsavedChanges: boolean;
    showLayoutPicker?: boolean;
    selectedCategory?: BlockCategory;
}

// ============================================================================
// AI ASSISTANT TYPES
// ============================================================================

export interface AIOperation {
    type: 'rewrite' | 'shorten' | 'expand' | 'tone' | 'translate' | 'quiz' | 'summarize';
    targetBlockId: string;
    originalContent: string;
    prompt?: string;
    language?: string;              // For translation
    tone?: 'professional' | 'casual' | 'academic' | 'friendly';
}

export interface AIResponse {
    success: boolean;
    content: string;
    suggestions?: string[];
    error?: string;
}
