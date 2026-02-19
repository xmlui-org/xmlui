import type { Annotation } from "../../types/annotation.types";
import { pdfToScreenCoordinates, pdfToScreenSize } from "../../utils/coordinateMapping";
import { TextAnnotation } from "../AnnotationTools/TextAnnotation";
import { CheckboxAnnotation } from "../AnnotationTools/CheckboxAnnotation";
import { SignatureAnnotation } from "../AnnotationTools/SignatureAnnotation";
import { DraggableAnnotation } from "./DraggableAnnotation";
import styles from "./AnnotationLayer.module.scss";

export interface AnnotationLayerProps {
  annotations: Annotation[];
  pageNumber: number;
  pageWidth: number;
  pageHeight: number;
  scale: number;
  selectedAnnotationId?: string;
  onAnnotationSelect?: (id: string) => void;
  onAnnotationUpdate?: (id: string, updates: Partial<Annotation>) => void;
  onAnnotationDelete?: (id: string) => void;
  /** Called when user requests to open the signature modal for a field */
  onAnnotationRequestSign?: (id: string) => void;
  /** Called when user requests to clear a signature from a field */
  onAnnotationClearSign?: (id: string) => void;
}

/**
 * AnnotationLayer component renders annotations as overlays on PDF pages
 * Uses absolute positioning to place annotations at correct coordinates
 */
export function AnnotationLayer({
  annotations,
  pageNumber,
  pageWidth,
  pageHeight,
  scale,
  selectedAnnotationId,
  onAnnotationSelect,
  onAnnotationUpdate,
  onAnnotationDelete,
  onAnnotationRequestSign,
  onAnnotationClearSign,
}: AnnotationLayerProps) {
  // Filter annotations for current page
  const pageAnnotations = annotations.filter(ann => ann.page === pageNumber);

  // Page viewport for coordinate mapping
  const viewport = { width: pageWidth, height: pageHeight, scale };

  return (
    <div className={styles.annotationLayer}>
      {pageAnnotations.map(annotation => {
        // Convert PDF coordinates to screen coordinates
        const screenPosition = pdfToScreenCoordinates(
          annotation.position.x,
          annotation.position.y,
          viewport
        );
        const screenSize = pdfToScreenSize(
          annotation.size.width,
          annotation.size.height,
          viewport
        );

        const isSelected = annotation.id === selectedAnnotationId;

        return (
          <DraggableAnnotation
            key={annotation.id}
            annotation={annotation}
            isSelected={isSelected}
            screenPosition={screenPosition}
            screenSize={screenSize}
            pageWidth={pageWidth}
            pageHeight={pageHeight}
            scale={scale}
            onAnnotationSelect={onAnnotationSelect}
            onAnnotationUpdate={onAnnotationUpdate}
            onAnnotationDelete={onAnnotationDelete}
            className={`${styles.annotationBox} ${isSelected ? styles.selected : ""} ${styles[annotation.type]}`}
          >
            {/* Render interactive annotation components based on type */}
            {annotation.type === "text" && onAnnotationUpdate && (
              <TextAnnotation
                annotation={annotation}
                isSelected={isSelected}
                onUpdate={onAnnotationUpdate}
                onSelect={(id) => onAnnotationSelect?.(id)}
              />
            )}
            
            {annotation.type === "checkbox" && onAnnotationUpdate && (
              <CheckboxAnnotation
                annotation={annotation}
                isSelected={isSelected}
                onUpdate={onAnnotationUpdate}
                onSelect={(id) => onAnnotationSelect?.(id)}
              />
            )}
            
            {annotation.type === "signature" && onAnnotationUpdate && (
              <SignatureAnnotation
                annotation={annotation}
                isSelected={isSelected}
                onUpdate={onAnnotationUpdate}
                onSelect={(id) => onAnnotationSelect?.(id)}
                onRequestSign={onAnnotationRequestSign}
                onClearSign={onAnnotationClearSign}
              />
            )}
            
            {/* Placeholder for non-implemented types or when no update handler */}
            {((annotation.type !== "text" && annotation.type !== "checkbox" && annotation.type !== "signature") || !onAnnotationUpdate) && (
              <div className={styles.annotationContent}>
                {annotation.properties.label && (
                  <span className={styles.label}>{annotation.properties.label}</span>
                )}
                {annotation.value && (
                  <span className={styles.value}>{String(annotation.value)}</span>
                )}
              </div>
            )}
          </DraggableAnnotation>
        );
      })}
    </div>
  );
}
