import { describe, it, expect } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useAnnotations } from "../src/hooks/useAnnotations";
import type { Annotation, AnnotationType } from "../src/types/annotation.types";

describe("useAnnotations", () => {
  // Helper to create a basic annotation data object
  const createAnnotationData = (overrides: Partial<Annotation> = {}) => ({
    type: "text" as AnnotationType,
    page: 1,
    position: { x: 100, y: 100 },
    size: { width: 200, height: 50 },
    value: "Test annotation",
    properties: {
      label: "Test Label",
      placeholder: "Enter text",
      required: false,
    },
    ...overrides,
  });

  describe("initialization", () => {
    it("should initialize with empty annotations by default", () => {
      const { result } = renderHook(() => useAnnotations());
      
      expect(result.current.annotations).toEqual([]);
      expect(result.current.selectedAnnotationId).toBeUndefined();
    });

    it("should initialize with provided annotations", () => {
      const initialAnnotations: Annotation[] = [
        {
          ...createAnnotationData(),
          id: "test-1",
          created: new Date(),
          modified: new Date(),
        },
      ];

      const { result } = renderHook(() => useAnnotations(initialAnnotations));
      
      expect(result.current.annotations).toHaveLength(1);
      expect(result.current.annotations[0].id).toBe("test-1");
    });
  });

  describe("addAnnotation", () => {
    it("should add a new annotation with generated ID and timestamps", () => {
      const { result } = renderHook(() => useAnnotations());
      const annotationData = createAnnotationData();
      
      let addedId: string;
      act(() => {
        addedId = result.current.addAnnotation(annotationData);
      });
      
      expect(result.current.annotations).toHaveLength(1);
      expect(result.current.annotations[0].id).toBe(addedId!);
      expect(result.current.annotations[0].created).toBeDefined();
      expect(result.current.annotations[0].modified).toBeDefined();
      expect(result.current.annotations[0].type).toBe("text");
    });

    it("should generate unique IDs for multiple annotations", () => {
      const { result } = renderHook(() => useAnnotations());
      const annotationData = createAnnotationData();
      
      let id1: string = "";
      let id2: string = "";
      act(() => {
        id1 = result.current.addAnnotation(annotationData);
        id2 = result.current.addAnnotation(annotationData);
      });
      
      expect(result.current.annotations).toHaveLength(2);
      expect(id1).not.toBe(id2);
      expect(result.current.annotations[0].id).not.toBe(result.current.annotations[1].id);
    });

    it("should return the generated ID", () => {
      const { result } = renderHook(() => useAnnotations());
      const annotationData = createAnnotationData();
      
      let returnedId: string;
      act(() => {
        returnedId = result.current.addAnnotation(annotationData);
      });
      
      expect(returnedId!).toBeTruthy();
      expect(result.current.annotations[0].id).toBe(returnedId!);
    });
  });

  describe("updateAnnotation", () => {
    it("should update an existing annotation", () => {
      const { result } = renderHook(() => useAnnotations());
      const annotationData = createAnnotationData({ value: "Original" });
      
      let addedId: string;
      act(() => {
        addedId = result.current.addAnnotation(annotationData);
      });
      
      act(() => {
        result.current.updateAnnotation(addedId!, { value: "Updated" });
      });
      
      expect(result.current.annotations[0].value).toBe("Updated");
    });

    it("should update the modified timestamp", async () => {
      const { result } = renderHook(() => useAnnotations());
      const annotationData = createAnnotationData();
      
      let addedId: string;
      act(() => {
        addedId = result.current.addAnnotation(annotationData);
      });
      
      const originalModified = result.current.annotations[0].modified.getTime();
      
      // Wait a bit to ensure timestamp changes
      await new Promise((resolve) => setTimeout(resolve, 10));
      
      act(() => {
        result.current.updateAnnotation(addedId!, { value: "Updated" });
      });
      
      expect(result.current.annotations[0].modified.getTime()).toBeGreaterThan(originalModified);
    });

    it("should not modify other annotations", () => {
      const { result } = renderHook(() => useAnnotations());
      
      let id1: string, id2: string;
      act(() => {
        id1 = result.current.addAnnotation(createAnnotationData({ value: "First" }));
        id2 = result.current.addAnnotation(createAnnotationData({ value: "Second" }));
      });
      
      act(() => {
        result.current.updateAnnotation(id1!, { value: "First Updated" });
      });
      
      expect(result.current.annotations[0].value).toBe("First Updated");
      expect(result.current.annotations[1].value).toBe("Second");
    });

    it("should do nothing if annotation ID not found", () => {
      const { result } = renderHook(() => useAnnotations());
      
      act(() => {
        result.current.addAnnotation(createAnnotationData({ value: "Test" }));
      });
      
      act(() => {
        result.current.updateAnnotation("non-existent-id", { value: "Updated" });
      });
      
      expect(result.current.annotations[0].value).toBe("Test");
    });
  });

  describe("deleteAnnotation", () => {
    it("should delete an annotation by ID", () => {
      const { result } = renderHook(() => useAnnotations());
      
      let addedId: string;
      act(() => {
        addedId = result.current.addAnnotation(createAnnotationData());
      });
      
      expect(result.current.annotations).toHaveLength(1);
      
      act(() => {
        result.current.deleteAnnotation(addedId!);
      });
      
      expect(result.current.annotations).toHaveLength(0);
    });

    it("should clear selection if deleted annotation was selected", () => {
      const { result } = renderHook(() => useAnnotations());
      
      let addedId: string;
      act(() => {
        addedId = result.current.addAnnotation(createAnnotationData());
        result.current.selectAnnotation(addedId!);
      });
      
      expect(result.current.selectedAnnotationId).toBe(addedId!);
      
      act(() => {
        result.current.deleteAnnotation(addedId!);
      });
      
      expect(result.current.selectedAnnotationId).toBeUndefined();
    });

    it("should not clear selection if deleted annotation was not selected", () => {
      const { result } = renderHook(() => useAnnotations());
      
      let id1: string, id2: string;
      act(() => {
        id1 = result.current.addAnnotation(createAnnotationData());
        id2 = result.current.addAnnotation(createAnnotationData());
        result.current.selectAnnotation(id1!);
      });
      
      act(() => {
        result.current.deleteAnnotation(id2!);
      });
      
      expect(result.current.selectedAnnotationId).toBe(id1!);
    });
  });

  describe("clearAnnotations", () => {
    it("should remove all annotations", () => {
      const { result } = renderHook(() => useAnnotations());
      
      act(() => {
        result.current.addAnnotation(createAnnotationData());
        result.current.addAnnotation(createAnnotationData());
        result.current.addAnnotation(createAnnotationData());
      });
      
      expect(result.current.annotations).toHaveLength(3);
      
      act(() => {
        result.current.clearAnnotations();
      });
      
      expect(result.current.annotations).toHaveLength(0);
    });

    it("should clear selection", () => {
      const { result } = renderHook(() => useAnnotations());
      
      let addedId: string;
      act(() => {
        addedId = result.current.addAnnotation(createAnnotationData());
        result.current.selectAnnotation(addedId!);
      });
      
      expect(result.current.selectedAnnotationId).toBe(addedId!);
      
      act(() => {
        result.current.clearAnnotations();
      });
      
      expect(result.current.selectedAnnotationId).toBeUndefined();
    });
  });

  describe("getAnnotation", () => {
    it("should return annotation by ID", () => {
      const { result } = renderHook(() => useAnnotations());
      
      let addedId: string;
      act(() => {
        addedId = result.current.addAnnotation(createAnnotationData({ value: "Test" }));
      });
      
      const annotation = result.current.getAnnotation(addedId!);
      
      expect(annotation).toBeDefined();
      expect(annotation?.value).toBe("Test");
    });

    it("should return undefined for non-existent ID", () => {
      const { result } = renderHook(() => useAnnotations());
      
      const annotation = result.current.getAnnotation("non-existent");
      
      expect(annotation).toBeUndefined();
    });
  });

  describe("getAnnotationsForPage", () => {
    it("should return annotations for specific page", () => {
      const { result } = renderHook(() => useAnnotations());
      
      act(() => {
        result.current.addAnnotation(createAnnotationData({ page: 1 }));
        result.current.addAnnotation(createAnnotationData({ page: 2 }));
        result.current.addAnnotation(createAnnotationData({ page: 1 }));
      });
      
      const page1Annotations = result.current.getAnnotationsForPage(1);
      const page2Annotations = result.current.getAnnotationsForPage(2);
      
      expect(page1Annotations).toHaveLength(2);
      expect(page2Annotations).toHaveLength(1);
    });

    it("should return empty array for page with no annotations", () => {
      const { result } = renderHook(() => useAnnotations());
      
      act(() => {
        result.current.addAnnotation(createAnnotationData({ page: 1 }));
      });
      
      const page2Annotations = result.current.getAnnotationsForPage(2);
      
      expect(page2Annotations).toEqual([]);
    });
  });

  describe("selectAnnotation", () => {
    it("should select an annotation by ID", () => {
      const { result } = renderHook(() => useAnnotations());
      
      let addedId: string;
      act(() => {
        addedId = result.current.addAnnotation(createAnnotationData());
      });
      
      act(() => {
        result.current.selectAnnotation(addedId!);
      });
      
      expect(result.current.selectedAnnotationId).toBe(addedId!);
    });

    it("should clear selection when undefined is passed", () => {
      const { result } = renderHook(() => useAnnotations());
      
      let addedId: string;
      act(() => {
        addedId = result.current.addAnnotation(createAnnotationData());
        result.current.selectAnnotation(addedId!);
      });
      
      expect(result.current.selectedAnnotationId).toBe(addedId!);
      
      act(() => {
        result.current.selectAnnotation(undefined);
      });
      
      expect(result.current.selectedAnnotationId).toBeUndefined();
    });
  });

  describe("getSelectedAnnotation", () => {
    it("should return the selected annotation", () => {
      const { result } = renderHook(() => useAnnotations());
      
      let addedId: string;
      act(() => {
        addedId = result.current.addAnnotation(createAnnotationData({ value: "Selected" }));
        result.current.selectAnnotation(addedId!);
      });
      
      const selected = result.current.getSelectedAnnotation();
      
      expect(selected).toBeDefined();
      expect(selected?.value).toBe("Selected");
    });

    it("should return undefined when no annotation is selected", () => {
      const { result } = renderHook(() => useAnnotations());
      
      act(() => {
        result.current.addAnnotation(createAnnotationData());
      });
      
      const selected = result.current.getSelectedAnnotation();
      
      expect(selected).toBeUndefined();
    });
  });
});
