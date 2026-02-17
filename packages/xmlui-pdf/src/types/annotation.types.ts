/**
 * Type definitions for PDF annotations
 */

/**
 * Annotation types supported by the PDF component
 */
export type AnnotationType = "text" | "checkbox" | "signature";

/**
 * Position in PDF coordinate space (origin at bottom-left, Y-axis up)
 */
export interface Position {
  x: number;
  y: number;
}

/**
 * Size dimensions
 */
export interface Size {
  width: number;
  height: number;
}

/**
 * Properties that can be customized for an annotation
 */
export interface AnnotationProperties {
  /** Label displayed near the annotation */
  label?: string;
  /** Placeholder text for input fields */
  placeholder?: string;
  /** Whether the field is required */
  required: boolean;
  /** Font size in pixels */
  fontSize?: number;
  /** Font family name */
  fontFamily?: string;
}

/**
 * Base annotation interface
 */
export interface Annotation {
  /** Unique identifier */
  id: string;
  /** Type of annotation */
  type: AnnotationType;
  /** Page number (1-indexed) */
  page: number;
  /** Position in PDF coordinates */
  position: Position;
  /** Size of the annotation */
  size: Size;
  /** Current value of the annotation */
  value?: any;
  /** Customizable properties */
  properties: AnnotationProperties;
  /** Creation timestamp */
  created: Date;
  /** Last modification timestamp */
  modified: Date;
}

/**
 * Data required to create a new annotation (without generated fields)
 */
export type AnnotationData = Omit<Annotation, "id" | "created" | "modified">;

/**
 * Partial updates to an annotation
 */
export type AnnotationUpdate = Partial<Omit<Annotation, "id" | "created">>;
