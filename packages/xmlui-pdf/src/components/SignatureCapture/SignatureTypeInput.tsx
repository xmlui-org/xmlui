import { useState } from "react";
import styles from "./SignatureCapture.module.scss";

/**
 * Available signature fonts — system/web-safe cursive fonts
 * displayed with their own typeface.
 */
export const SIGNATURE_FONTS: { label: string; family: string }[] = [
  { label: "Cursive Style 1", family: "'Brush Script MT', 'Brush Script Std', cursive" },
  { label: "Cursive Style 2", family: "'Lucida Handwriting', 'Lucida Calligraphy', cursive" },
  { label: "Cursive Style 3", family: "'Bradley Hand', 'Bradley Hand ITC', cursive" },
  { label: "Cursive Style 4", family: "'Apple Chancery', 'Segoe Script', cursive" },
];

export interface SignatureTypeInputProps {
  /** Current name value */
  value: string;
  /** Selected font family index (index into SIGNATURE_FONTS) */
  fontIndex: number;
  onChange: (value: string) => void;
  onFontChange: (index: number) => void;
}

/**
 * SignatureTypeInput — renders a name text input, font selector
 * and a live preview of the typed signature in the selected font.
 */
export function SignatureTypeInput({
  value,
  fontIndex,
  onChange,
  onFontChange,
}: SignatureTypeInputProps) {
  const selectedFont = SIGNATURE_FONTS[fontIndex] ?? SIGNATURE_FONTS[0];

  return (
    <div className={styles.typeInput}>
      {/* Name input */}
      <input
        type="text"
        className={styles.nameInput}
        placeholder="Type your full name"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        autoFocus
        data-testid="signature-name-input"
      />

      {/* Font selector */}
      <div className={styles.fontSelector}>
        {SIGNATURE_FONTS.map((font, i) => (
          <button
            key={i}
            type="button"
            className={`${styles.fontOption} ${i === fontIndex ? styles.fontSelected : ""}`}
            style={{ fontFamily: font.family }}
            onClick={() => onFontChange(i)}
            data-testid={`font-option-${i}`}
          >
            {value || "Your Signature"}
          </button>
        ))}
      </div>

      {/* Live preview */}
      <div className={styles.signaturePreview} data-testid="signature-preview">
        <span
          className={styles.signaturePreviewText}
          style={{ fontFamily: selectedFont.family }}
        >
          {value || "Your Signature"}
        </span>
      </div>
    </div>
  );
}
