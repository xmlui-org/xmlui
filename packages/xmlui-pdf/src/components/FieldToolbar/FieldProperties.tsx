import { useState, useEffect } from "react";
import type { Annotation } from "../../types/annotation.types";
import styles from "./FieldProperties.module.scss";

export interface FieldPropertiesProps {
  annotation: Annotation | null;
  onUpdate: (id: string, updates: Partial<Annotation>) => void;
}

/**
 * FieldProperties component - Properties panel for editing annotation settings
 */
export function FieldProperties({ annotation, onUpdate }: FieldPropertiesProps) {
  const [label, setLabel] = useState("");
  const [placeholder, setPlaceholder] = useState("");
  const [required, setRequired] = useState(false);
  const [fontSize, setFontSize] = useState(14);
  const [fontFamily, setFontFamily] = useState("Arial");

  // Update local state when annotation changes
  useEffect(() => {
    if (annotation) {
      setLabel(annotation.properties.label || "");
      setPlaceholder(annotation.properties.placeholder || "");
      setRequired(annotation.properties.required || false);
      setFontSize(annotation.properties.fontSize || 14);
      setFontFamily(annotation.properties.fontFamily || "Arial");
    }
  }, [annotation]);

  if (!annotation) {
    return (
      <div className={styles.propertiesPanel} data-testid="field-properties">
        <div className={styles.emptyState}>
          Select an annotation to edit properties
        </div>
      </div>
    );
  }

  const handleLabelChange = (value: string) => {
    setLabel(value);
    onUpdate(annotation.id, {
      properties: { ...annotation.properties, label: value },
    });
  };

  const handlePlaceholderChange = (value: string) => {
    setPlaceholder(value);
    onUpdate(annotation.id, {
      properties: { ...annotation.properties, placeholder: value },
    });
  };

  const handleRequiredChange = (checked: boolean) => {
    setRequired(checked);
    onUpdate(annotation.id, {
      properties: { ...annotation.properties, required: checked },
    });
  };

  const handleFontSizeChange = (value: number) => {
    setFontSize(value);
    onUpdate(annotation.id, {
      properties: { ...annotation.properties, fontSize: value },
    });
  };

  const handleFontFamilyChange = (value: string) => {
    setFontFamily(value);
    onUpdate(annotation.id, {
      properties: { ...annotation.properties, fontFamily: value },
    });
  };

  const showTextProperties = annotation.type === "text";

  return (
    <div className={styles.propertiesPanel} data-testid="field-properties">
      <div className={styles.header}>
        <h3 className={styles.title}>Field Properties</h3>
        <div className={styles.annotationType}>{annotation.type}</div>
      </div>

      <div className={styles.propertyGroup}>
        <label htmlFor="field-label" className={styles.propertyLabel}>
          Label
        </label>
        <input
          id="field-label"
          type="text"
          value={label}
          onChange={(e) => handleLabelChange(e.target.value)}
          className={styles.input}
          placeholder="Field label"
          data-testid="property-label"
        />
      </div>

      {showTextProperties && (
        <div className={styles.propertyGroup}>
          <label htmlFor="field-placeholder" className={styles.propertyLabel}>
            Placeholder
          </label>
          <input
            id="field-placeholder"
            type="text"
            value={placeholder}
            onChange={(e) => handlePlaceholderChange(e.target.value)}
            className={styles.input}
            placeholder="Placeholder text"
            data-testid="property-placeholder"
          />
        </div>
      )}

      <div className={styles.propertyGroup}>
        <label className={styles.checkboxLabel}>
          <input
            type="checkbox"
            checked={required}
            onChange={(e) => handleRequiredChange(e.target.checked)}
            className={styles.checkbox}
            data-testid="property-required"
          />
          <span>Required field</span>
        </label>
      </div>

      {showTextProperties && (
        <>
          <div className={styles.propertyGroup}>
            <label htmlFor="field-font-size" className={styles.propertyLabel}>
              Font Size
            </label>
            <input
              id="field-font-size"
              type="number"
              value={fontSize}
              onChange={(e) => handleFontSizeChange(Number(e.target.value))}
              min={8}
              max={72}
              className={styles.input}
              data-testid="property-font-size"
            />
          </div>

          <div className={styles.propertyGroup}>
            <label htmlFor="field-font-family" className={styles.propertyLabel}>
              Font Family
            </label>
            <select
              id="field-font-family"
              value={fontFamily}
              onChange={(e) => handleFontFamilyChange(e.target.value)}
              className={styles.select}
              data-testid="property-font-family"
            >
              <option value="Arial">Arial</option>
              <option value="Helvetica">Helvetica</option>
              <option value="Times New Roman">Times New Roman</option>
              <option value="Courier New">Courier New</option>
              <option value="Georgia">Georgia</option>
              <option value="Verdana">Verdana</option>
            </select>
          </div>
        </>
      )}
    </div>
  );
}
