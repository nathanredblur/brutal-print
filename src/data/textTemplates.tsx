/**
 * Text Templates - Predefined text styles and fonts
 * Used in the Text Gallery
 */

import type { GalleryItem } from "../components/Gallery";

export interface TextTemplateData {
  text: string;
  fontSize: number;
  fontFamily: string;
  bold: boolean;
  italic: boolean;
  align: "left" | "center" | "right";
}

// Text preview component
const TextPreview = ({
  text,
  fontFamily,
  fontSize,
  bold,
  italic,
}: {
  text: string;
  fontFamily: string;
  fontSize: number;
  bold: boolean;
  italic: boolean;
}) => (
  <div
    style={{
      fontFamily,
      fontSize: `${fontSize}px`,
      fontWeight: bold ? "bold" : "normal",
      fontStyle: italic ? "italic" : "normal",
      color: "var(--color-text-primary)",
      textAlign: "center",
      width: "100%",
      overflow: "hidden",
      textOverflow: "ellipsis",
      whiteSpace: "nowrap",
      lineHeight: 1,
    }}
  >
    {text}
  </div>
);

export const textTemplates: GalleryItem[] = [
  // Headers
  {
    id: "header-large",
    name: "Large Header",
    tags: ["header", "title", "big", "large"],
    preview: (
      <TextPreview
        text="Header"
        fontFamily="Space Grotesk, sans-serif"
        fontSize={20}
        bold={true}
        italic={false}
      />
    ),
    data: {
      text: "Your Header",
      fontSize: 32,
      fontFamily: "Space Grotesk, sans-serif",
      bold: true,
      italic: false,
      align: "center",
    } as TextTemplateData,
  },
  {
    id: "header-medium",
    name: "Medium Header",
    tags: ["header", "title", "medium"],
    preview: (
      <TextPreview
        text="Header"
        fontFamily="Inter, sans-serif"
        fontSize={16}
        bold={true}
        italic={false}
      />
    ),
    data: {
      text: "Your Header",
      fontSize: 24,
      fontFamily: "Inter, sans-serif",
      bold: true,
      italic: false,
      align: "center",
    } as TextTemplateData,
  },
  {
    id: "subheader",
    name: "Subheader",
    tags: ["subheader", "subtitle", "small"],
    preview: (
      <TextPreview
        text="Subheader"
        fontFamily="Inter, sans-serif"
        fontSize={14}
        bold={false}
        italic={false}
      />
    ),
    data: {
      text: "Your Subheader",
      fontSize: 18,
      fontFamily: "Inter, sans-serif",
      bold: false,
      italic: false,
      align: "center",
    } as TextTemplateData,
  },

  // Body Text
  {
    id: "body-regular",
    name: "Body Text",
    tags: ["body", "text", "paragraph", "regular"],
    preview: (
      <TextPreview
        text="Body"
        fontFamily="Inter, sans-serif"
        fontSize={12}
        bold={false}
        italic={false}
      />
    ),
    data: {
      text: "Your text here",
      fontSize: 16,
      fontFamily: "Inter, sans-serif",
      bold: false,
      italic: false,
      align: "left",
    } as TextTemplateData,
  },
  {
    id: "body-bold",
    name: "Bold Body",
    tags: ["body", "text", "bold", "strong"],
    preview: (
      <TextPreview
        text="Bold"
        fontFamily="Inter, sans-serif"
        fontSize={12}
        bold={true}
        italic={false}
      />
    ),
    data: {
      text: "Your text here",
      fontSize: 16,
      fontFamily: "Inter, sans-serif",
      bold: true,
      italic: false,
      align: "left",
    } as TextTemplateData,
  },
  {
    id: "body-italic",
    name: "Italic Text",
    tags: ["body", "text", "italic", "emphasis"],
    preview: (
      <TextPreview
        text="Italic"
        fontFamily="Inter, sans-serif"
        fontSize={12}
        bold={false}
        italic={true}
      />
    ),
    data: {
      text: "Your text here",
      fontSize: 16,
      fontFamily: "Inter, sans-serif",
      bold: false,
      italic: true,
      align: "left",
    } as TextTemplateData,
  },

  // Monospace
  {
    id: "mono-code",
    name: "Code",
    tags: ["code", "monospace", "mono", "tech"],
    preview: (
      <TextPreview
        text="Code"
        fontFamily="IBM Plex Mono, monospace"
        fontSize={11}
        bold={false}
        italic={false}
      />
    ),
    data: {
      text: "console.log('Hello')",
      fontSize: 14,
      fontFamily: "IBM Plex Mono, monospace",
      bold: false,
      italic: false,
      align: "left",
    } as TextTemplateData,
  },
  {
    id: "mono-label",
    name: "Mono Label",
    tags: ["label", "monospace", "small"],
    preview: (
      <TextPreview
        text="LABEL"
        fontFamily="Space Mono, monospace"
        fontSize={10}
        bold={true}
        italic={false}
      />
    ),
    data: {
      text: "LABEL",
      fontSize: 12,
      fontFamily: "Space Mono, monospace",
      bold: true,
      italic: false,
      align: "left",
    } as TextTemplateData,
  },

  // Decorative
  {
    id: "display-large",
    name: "Display Large",
    tags: ["display", "large", "big", "hero"],
    preview: (
      <TextPreview
        text="HERO"
        fontFamily="Space Grotesk, sans-serif"
        fontSize={22}
        bold={true}
        italic={false}
      />
    ),
    data: {
      text: "HERO TEXT",
      fontSize: 48,
      fontFamily: "Space Grotesk, sans-serif",
      bold: true,
      italic: false,
      align: "center",
    } as TextTemplateData,
  },
  {
    id: "caption",
    name: "Caption",
    tags: ["caption", "small", "note"],
    preview: (
      <TextPreview
        text="Caption"
        fontFamily="Inter, sans-serif"
        fontSize={10}
        bold={false}
        italic={false}
      />
    ),
    data: {
      text: "Caption text",
      fontSize: 12,
      fontFamily: "Inter, sans-serif",
      bold: false,
      italic: false,
      align: "left",
    } as TextTemplateData,
  },

  // Receipt specific
  {
    id: "receipt-header",
    name: "Receipt Header",
    tags: ["receipt", "header", "store"],
    preview: (
      <TextPreview
        text="STORE"
        fontFamily="Courier Prime, monospace"
        fontSize={14}
        bold={true}
        italic={false}
      />
    ),
    data: {
      text: "STORE NAME",
      fontSize: 20,
      fontFamily: "Courier Prime, monospace",
      bold: true,
      italic: false,
      align: "center",
    } as TextTemplateData,
  },
  {
    id: "receipt-item",
    name: "Receipt Item",
    tags: ["receipt", "item", "product"],
    preview: (
      <TextPreview
        text="Item"
        fontFamily="Courier Prime, monospace"
        fontSize={11}
        bold={false}
        italic={false}
      />
    ),
    data: {
      text: "Product Name",
      fontSize: 14,
      fontFamily: "Courier Prime, monospace",
      bold: false,
      italic: false,
      align: "left",
    } as TextTemplateData,
  },
  {
    id: "receipt-total",
    name: "Receipt Total",
    tags: ["receipt", "total", "price", "bold"],
    preview: (
      <TextPreview
        text="TOTAL"
        fontFamily="Courier Prime, monospace"
        fontSize={13}
        bold={true}
        italic={false}
      />
    ),
    data: {
      text: "TOTAL",
      fontSize: 18,
      fontFamily: "Courier Prime, monospace",
      bold: true,
      italic: false,
      align: "right",
    } as TextTemplateData,
  },

  // Special styles
  {
    id: "quote",
    name: "Quote",
    tags: ["quote", "italic", "serif"],
    preview: (
      <TextPreview
        text="Quote"
        fontFamily="Times New Roman, serif"
        fontSize={12}
        bold={false}
        italic={true}
      />
    ),
    data: {
      text: '"Your quote here"',
      fontSize: 18,
      fontFamily: "Times New Roman, serif",
      bold: false,
      italic: true,
      align: "center",
    } as TextTemplateData,
  },
  {
    id: "button-text",
    name: "Button Text",
    tags: ["button", "cta", "action"],
    preview: (
      <TextPreview
        text="CLICK"
        fontFamily="Inter, sans-serif"
        fontSize={11}
        bold={true}
        italic={false}
      />
    ),
    data: {
      text: "CLICK HERE",
      fontSize: 14,
      fontFamily: "Inter, sans-serif",
      bold: true,
      italic: false,
      align: "center",
    } as TextTemplateData,
  },
];

