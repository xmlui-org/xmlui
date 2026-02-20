/**
 * Coordinate mapping utilities for PDF annotations
 * 
 * PDF coordinate system: origin at bottom-left, Y-axis points up
 * Screen coordinate system: origin at top-left, Y-axis points down
 */

import { Position, Size } from "../types/annotation.types";

/**
 * PDF page viewport information
 */
export interface PageViewport {
  /** Page width in PDF points */
  width: number;
  /** Page height in PDF points */
  height: number;
  /** Current scale/zoom level */
  scale: number;
}

/**
 * Convert screen coordinates to PDF coordinates
 * 
 * @param screenX - X position in screen pixels (relative to page)
 * @param screenY - Y position in screen pixels (relative to page, top-left origin)
 * @param viewport - Page viewport information
 * @returns Position in PDF coordinates (bottom-left origin)
 */
export function screenToPdfCoordinates(
  screenX: number,
  screenY: number,
  viewport: PageViewport
): Position {
  // Convert screen pixels to PDF points
  const pdfX = screenX / viewport.scale;
  
  // Flip Y-axis: screen Y=0 is top, PDF Y=0 is bottom
  const pdfY = viewport.height - (screenY / viewport.scale);
  
  return { x: pdfX, y: pdfY };
}

/**
 * Convert PDF coordinates to screen coordinates
 * 
 * @param pdfX - X position in PDF points
 * @param pdfY - Y position in PDF points (bottom-left origin)
 * @param viewport - Page viewport information
 * @returns Position in screen pixels (top-left origin)
 */
export function pdfToScreenCoordinates(
  pdfX: number,
  pdfY: number,
  viewport: PageViewport
): Position {
  // Convert PDF points to screen pixels
  const screenX = pdfX * viewport.scale;
  
  // Flip Y-axis: PDF Y=0 is bottom, screen Y=0 is top
  const screenY = (viewport.height - pdfY) * viewport.scale;
  
  return { x: screenX, y: screenY };
}

/**
 * Convert PDF size to screen size
 * 
 * @param pdfWidth - Width in PDF points
 * @param pdfHeight - Height in PDF points
 * @param viewport - Page viewport information
 * @returns Size in screen pixels
 */
export function pdfToScreenSize(
  pdfWidth: number,
  pdfHeight: number,
  viewport: PageViewport
): Size {
  return {
    width: pdfWidth * viewport.scale,
    height: pdfHeight * viewport.scale,
  };
}

/**
 * Convert screen size to PDF size
 * 
 * @param screenWidth - Width in screen pixels
 * @param screenHeight - Height in screen pixels
 * @param viewport - Page viewport information
 * @returns Size in PDF points
 */
export function screenToPdfSize(
  screenWidth: number,
  screenHeight: number,
  viewport: PageViewport
): Size {
  return {
    width: screenWidth / viewport.scale,
    height: screenHeight / viewport.scale,
  };
}

/**
 * Clamp position to page boundaries
 * 
 * @param position - Position to clamp
 * @param size - Size of the element
 * @param viewport - Page viewport information
 * @returns Clamped position that keeps element within page bounds
 */
export function clampPositionToPage(
  position: Position,
  size: Size,
  viewport: PageViewport
): Position {
  return {
    x: Math.max(0, Math.min(position.x, viewport.width - size.width)),
    y: Math.max(0, Math.min(position.y, viewport.height - size.height)),
  };
}
