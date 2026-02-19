import { useState, useCallback, useEffect } from "react";
import type { SignatureData } from "../../types/signature.types";
import { SignatureTypeInput, SIGNATURE_FONTS } from "./SignatureTypeInput";
import styles from "./SignatureCapture.module.scss";

// ---------------------------------------------------------------------------
// Utility — render typed signature to a data URL using an off-screen canvas
// ---------------------------------------------------------------------------

/**
 * Renders `text` in `fontFamily` on an off-screen canvas and returns
 * a PNG data URL (base64-encoded).
 */
function typedSignatureToDataUrl(text: string, fontFamily: string): string {
  const canvas = document.createElement("canvas");
  const fontSize = 48;
  const padding = 12;

  // Measure first with a rough canvas to determine width
  const ctx = canvas.getContext("2d")!;
  ctx.font = `${fontSize}px ${fontFamily}`;
  const measured = ctx.measureText(text);
  const width = Math.ceil(measured.width) + padding * 2;
  const height = fontSize + padding * 2;

  canvas.width = width;
  canvas.height = height;

  // Transparent background (already default)
  // Re-apply font after resize (resizing resets state)
  ctx.font = `${fontSize}px ${fontFamily}`;
  ctx.fillStyle = "#11182f";
  ctx.textBaseline = "middle";
  ctx.fillText(text, padding, height / 2);

  return canvas.toDataURL("image/png");
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export interface SignatureCaptureProps {
  /** ID of the signature annotation field that triggered the modal */
  fieldId: string;
  /** Initial signer name (when editing existing signature) */
  initialName?: string;
  /** Initial font index (when editing existing signature) */
  initialFontIndex?: number;
  /** Called when user confirms signature */
  onCapture: (fieldId: string, signature: SignatureData) => void;
  /** Called when user dismisses modal */
  onClose: () => void;
}

/**
 * SignatureCapture modal — allows the user to type their name as a signature,
 * choose a cursive font style and preview the result before applying.
 */
export function SignatureCapture({
  fieldId,
  initialName = "",
  initialFontIndex = 0,
  onCapture,
  onClose,
}: SignatureCaptureProps) {
  const [name, setName] = useState(initialName);
  const [fontIndex, setFontIndex] = useState(initialFontIndex);

  // Update state when initial props change (e.g., when editing different signature fields)
  useEffect(() => {
    setName(initialName);
    setFontIndex(initialFontIndex);
  }, [initialName, initialFontIndex]);

  const handleApply = useCallback(() => {
    if (!name.trim()) return;

    const fontFamily = SIGNATURE_FONTS[fontIndex]?.family ?? SIGNATURE_FONTS[0].family;
    const dataUrl = typedSignatureToDataUrl(name.trim(), fontFamily);

    const signature: SignatureData = {
      id: `sig-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: "typed",
      data: dataUrl,
      timestamp: new Date(),
      signerName: name.trim(),
      signerFontIndex: fontIndex,
    };

    onCapture(fieldId, signature);
    onClose();
  }, [name, fontIndex, fieldId, onCapture, onClose]);

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div
      className={styles.backdrop}
      onClick={handleBackdropClick}
      data-testid="signature-capture-backdrop"
    >
      <div className={styles.modal} data-testid="signature-capture-modal">
        {/* Header */}
        <div className={styles.header}>
          <h2 className={styles.title}>Create Your Signature</h2>
          <button
            type="button"
            className={styles.closeButton}
            onClick={onClose}
            aria-label="Close signature modal"
            data-testid="signature-modal-close"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className={styles.body}>
          <p className={styles.instructions}>
            Type your name and choose a style for your signature.
          </p>
          <SignatureTypeInput
            value={name}
            fontIndex={fontIndex}
            onChange={setName}
            onFontChange={setFontIndex}
          />
        </div>

        {/* Footer */}
        <div className={styles.footer}>
          <button
            type="button"
            className={styles.cancelButton}
            onClick={onClose}
            data-testid="signature-modal-cancel"
          >
            Cancel
          </button>
          <button
            type="button"
            className={styles.applyButton}
            onClick={handleApply}
            disabled={!name.trim()}
            data-testid="signature-modal-apply"
          >
            Apply Signature
          </button>
        </div>
      </div>
    </div>
  );
}
