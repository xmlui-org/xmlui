import { useState, useCallback } from "react";
import type { Annotation } from "../types/annotation.types";

/**
 * Hook for managing annotation state and operations
 * Provides CRUD operations for annotations with immutable state updates
 */
export function useAnnotations(initialAnnotations: Annotation[] = []) {
  const [annotations, setAnnotations] = useState<Annotation[]>(initialAnnotations);
  const [selectedAnnotationId, setSelectedAnnotationId] = useState<string | undefined>();

  /**
   * Generate a unique ID for a new annotation
   */
  const generateId = useCallback((): string => {
    return `annotation_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }, []);

  /**
   * Add a new annotation
   * Generates ID, timestamps, and adds to state
   */
  const addAnnotation = useCallback((annotationData: Omit<Annotation, "id" | "created" | "modified">): string => {
    const id = generateId();
    const now = new Date();
    
    const newAnnotation: Annotation = {
      ...annotationData,
      id,
      created: now,
      modified: now,
    };

    setAnnotations(prev => [...prev, newAnnotation]);
    return id;
  }, [generateId]);

  /**
   * Update an existing annotation by ID
   * Updates modified timestamp
   */
  const updateAnnotation = useCallback((id: string, updates: Partial<Omit<Annotation, "id" | "created">>): void => {
    setAnnotations(prev =>
      prev.map(annotation =>
        annotation.id === id
          ? { ...annotation, ...updates, modified: new Date() }
          : annotation
      )
    );
  }, []);

  /**
   * Delete an annotation by ID
   * Clears selection if deleted annotation was selected
   */
  const deleteAnnotation = useCallback((id: string): void => {
    setAnnotations(prev => prev.filter(annotation => annotation.id !== id));
    
    // Clear selection if the deleted annotation was selected
    if (selectedAnnotationId === id) {
      setSelectedAnnotationId(undefined);
    }
  }, [selectedAnnotationId]);

  /**
   * Clear all annotations
   * Also clears selection
   */
  const clearAnnotations = useCallback((): void => {
    setAnnotations([]);
    setSelectedAnnotationId(undefined);
  }, []);

  /**
   * Get an annotation by ID
   */
  const getAnnotation = useCallback((id: string): Annotation | undefined => {
    return annotations.find(annotation => annotation.id === id);
  }, [annotations]);

  /**
   * Get annotations for a specific page
   */
  const getAnnotationsForPage = useCallback((page: number): Annotation[] => {
    return annotations.filter(annotation => annotation.page === page);
  }, [annotations]);

  /**
   * Select an annotation by ID
   */
  const selectAnnotation = useCallback((id: string | undefined): void => {
    setSelectedAnnotationId(id);
  }, []);

  /**
   * Get the currently selected annotation
   */
  const getSelectedAnnotation = useCallback((): Annotation | undefined => {
    if (!selectedAnnotationId) return undefined;
    return annotations.find(annotation => annotation.id === selectedAnnotationId);
  }, [annotations, selectedAnnotationId]);

  return {
    annotations,
    selectedAnnotationId,
    addAnnotation,
    updateAnnotation,
    deleteAnnotation,
    clearAnnotations,
    getAnnotation,
    getAnnotationsForPage,
    selectAnnotation,
    getSelectedAnnotation,
  };
}
