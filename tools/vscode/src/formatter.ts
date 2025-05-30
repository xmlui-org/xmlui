import * as vscode from 'vscode';
import { XMLFormatter } from './xmlFormatter';

// Custom formatter provider for XMLUI files
export class XmluiFormattingProvider implements vscode.DocumentFormattingEditProvider {
  private xmlFormatter: XMLFormatter;

  constructor() {
    // Initialize with XML formatter as the base
    this.xmlFormatter = new XMLFormatter();
  }

  async provideDocumentFormattingEdits(
    document: vscode.TextDocument,
    options: vscode.FormattingOptions
  ): Promise<vscode.TextEdit[]> {
    // Get the document text
    const text = document.getText();
    
    // Format using the XML formatter with potential customizations
    const formattedText = await this.xmlFormatter.format(text, options);
    
    // Return a text edit that replaces the entire document
    const fullRange = new vscode.Range(
      document.positionAt(0),
      document.positionAt(text.length)
    );
    
    return [vscode.TextEdit.replace(fullRange, formattedText)];
  }
}
