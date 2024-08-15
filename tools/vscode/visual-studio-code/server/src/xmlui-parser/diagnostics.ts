export interface DiagnosticMessage {
  code: string;
  category: DiagnosticCategory;
  message: string;
}

export enum DiagnosticCategory {
  Warning,
  Error,
  Suggestion,
  Message,
}

export function diagnosticCategoryName(d: { category: DiagnosticCategory }, lowerCase = true): string {
  const name = DiagnosticCategory[d.category];
  return lowerCase ? name.toLowerCase() : name;
}

export const Diag_Invalid_Character: DiagnosticMessage = {
  code: "W001",
  category: DiagnosticCategory.Error,
  message: "Invalid character.",
};

export const Diag_Unterminated_String_Literal: DiagnosticMessage = {
  code: "W002",
  category: DiagnosticCategory.Error,
  message: "Unterminated string literal.",
};

export const Diag_Unexpected_End_Of_Text: DiagnosticMessage = {
  code: "W003",
  category: DiagnosticCategory.Error,
  message: "Unexpected end of text.",
};

export const Diag_Hexadecimal_Digit_Expected: DiagnosticMessage = {
  code: "W004",
  category: DiagnosticCategory.Error,
  message: "Hexadecimal digit expected.",
};

export const Diag_Invalid_Extended_Unicode_Escape: DiagnosticMessage = {
  code: "W005",
  category: DiagnosticCategory.Error,
  message: "An extended Unicode escape value must be between 0x0 and 0x10FFFF inclusive.",
};

export const Diag_Unterminated_Unicode_Escape_Sequence: DiagnosticMessage = {
  code: "W006",
  category: DiagnosticCategory.Error,
  message: "Unterminated Unicode escape sequence.",
};

export const Diag_Unterminated_Comment: DiagnosticMessage = {
  code: "W007",
  category: DiagnosticCategory.Error,
  message: "Unterminated comment",
};

export const Diag_Unterminated_CData: DiagnosticMessage = {
  code: "W008",
  category: DiagnosticCategory.Error,
  message: "Unterminated CDATA section",
};

export const Diag_Unterminated_Script: DiagnosticMessage = {
  code: "W009",
  category: DiagnosticCategory.Error,
  message: "Unterminated script section",
};
