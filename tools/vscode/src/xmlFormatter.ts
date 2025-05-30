import * as vscode from 'vscode';

/**
 * Interface for formatter options
 */
interface XmluiFormatterOptions {
  insertSpaces: boolean;
  tabSize: number;
  newLine: string;
  indentEmptyLines: boolean;
  preserveAttributeLineBreaks: boolean;
  preserveScriptContent: boolean;
  maxLineLength: number;
  indentBindingExpressions: boolean;
  sortAttributes: boolean;
}

/**
 * Class for capturing segments that need special handling
 */
class ProtectedSegment {
  constructor(
    public readonly content: string,
    public readonly placeholder: string
  ) {}
}

export class XMLFormatter {
  private protectedSegments: ProtectedSegment[] = [];
  private segmentCounter = 0;
  
  /**
   * Format XML content
   * 
   * @param content The XML content to format
   * @param options VS Code formatting options
   * @returns Formatted XML content
   */
  async format(content: string, options: vscode.FormattingOptions): Promise<string> {
    // Reset state
    this.protectedSegments = [];
    this.segmentCounter = 0;
    
    // Get the XML formatter settings
    const insertSpaces = options.insertSpaces;
    const tabSize = options.tabSize;
    
    // Get XMLUI-specific settings from configuration
    const config = vscode.workspace.getConfiguration('xmlui.format');
    const enabled = config.get<boolean>('enabled', true);
    const preserveAttributeLineBreaks = config.get<boolean>('preserveAttributeLineBreaks', true);
    const preserveScriptContent = config.get<boolean>('preserveScriptContent', true);
    const maxLineLength = config.get<number>('maxLineLength', 120);
    const indentBindingExpressions = config.get<boolean>('indentBindingExpressions', false);
    const sortAttributes = config.get<boolean>('sortAttributes', false);
    
    // If formatting is disabled, return the original content
    if (!enabled) {
      return content;
    }
    
    // Create options for the XML formatter
    const formatterOptions: XmluiFormatterOptions = {
      insertSpaces,
      tabSize,
      newLine: '\n',
      indentEmptyLines: false,
      // XMLUI-specific settings
      preserveAttributeLineBreaks,
      preserveScriptContent,
      maxLineLength,
      indentBindingExpressions,
      sortAttributes
    };
    
    try {
      // Pre-process content to protect special segments
      let processedContent = content;
      
      // Protect script content first
      if (formatterOptions.preserveScriptContent) {
        processedContent = this.protectScriptBlocks(processedContent);
      }
      
      // Protect binding expressions
      processedContent = this.protectBindingExpressions(processedContent);
      
      // Format as XML
      let formatted = this.formatXml(processedContent, formatterOptions);
      
      // Apply any XMLUI-specific formatting rules
      formatted = this.applyXmluiRules(formatted, formatterOptions);
      
      // Restore protected segments
      formatted = this.restoreProtectedSegments(formatted);
      
      return formatted;
    } catch (error) {
      console.error('Error formatting XMLUI document:', error);
      // Return original content on error
      return content;
    }
  }
  
  /**
   * Protect script blocks from formatting
   */
  private protectScriptBlocks(content: string): string {
    const scriptBlockRegex = /(<script[^>]*>)([\s\S]*?)(<\/script>)/g;
    
    return content.replace(scriptBlockRegex, (match, openTag, scriptContent, closeTag) => {
      const placeholder = this.createPlaceholder();
      this.protectedSegments.push(new ProtectedSegment(scriptContent, placeholder));
      return openTag + placeholder + closeTag;
    });
  }
  
  /**
   * Protect binding expressions from formatting
   */
  private protectBindingExpressions(content: string): string {
    // Protect complex binding expressions like {`Hello, ${userName}!`}
    const complexBindingRegex = /({`[\s\S]*?`})/g;
    let result = content.replace(complexBindingRegex, (match) => {
      const placeholder = this.createPlaceholder();
      this.protectedSegments.push(new ProtectedSegment(match, placeholder));
      return placeholder;
    });
    
    // Protect simple binding expressions like {isLoggedIn ? 'Logout' : 'Login'}
    const simpleBindingRegex = /({[^{}\n]*})/g;
    result = result.replace(simpleBindingRegex, (match) => {
      const placeholder = this.createPlaceholder();
      this.protectedSegments.push(new ProtectedSegment(match, placeholder));
      return placeholder;
    });
    
    return result;
  }
  
  /**
   * Create a unique placeholder for protected content
   */
  private createPlaceholder(): string {
    const placeholder = `__XMLUI_PROTECTED_${this.segmentCounter++}__`;
    return placeholder;
  }
  
  /**
   * Restore protected segments in the formatted content
   */
  private restoreProtectedSegments(content: string): string {
    let result = content;
    
    // Restore from the last added to the first to avoid placeholder conflicts
    for (let i = this.protectedSegments.length - 1; i >= 0; i--) {
      const segment = this.protectedSegments[i];
      result = result.replace(segment.placeholder, segment.content);
    }
    
    return result;
  }
  
  /**
   * Basic XML formatting implementation
   */
  private formatXml(xml: string, options: XmluiFormatterOptions): string {
    const { tabSize, insertSpaces, newLine } = options;
    const indent = insertSpaces ? ' '.repeat(tabSize) : '\t';
    
    let formatted = '';
    let indentLevel = 0;
    let inTag = false;
    let inContent = false;
    let tagName = '';
    
    // Normalize line endings
    xml = xml.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
    
    // Remove existing whitespace between tags
    xml = xml.replace(/>\s+</g, '><');
    
    // Split by < and process each segment
    const segments = xml.split('<');
    
    for (let i = 0; i < segments.length; i++) {
      if (segments[i].length === 0) continue;
      
      const isClosingTag = segments[i].startsWith('/');
      const isSelfClosingTag = segments[i].includes('/>');
      
      if (isClosingTag) {
        indentLevel--;
        if (i > 0) formatted += newLine;
        formatted += indent.repeat(indentLevel) + '<' + segments[i];
      } else {
        if (i > 0) formatted += newLine;
        formatted += indent.repeat(indentLevel) + '<' + segments[i];
        
        if (!isSelfClosingTag) {
          // Extract tag name for proper handling of indentation
          const tagMatch = segments[i].match(/^([^\s>]+)/);
          if (tagMatch) {
            tagName = tagMatch[1];
            
            // Skip indentation increase for special tags like comments, CDATA, etc.
            if (!tagName.startsWith('!') && !tagName.startsWith('?')) {
              indentLevel++;
            }
          }
        }
      }
    }
    
    // Format attributes
    if (options.maxLineLength > 0) {
      formatted = this.formatAttributes(formatted, options);
    }
    
    return formatted.trim();
  }
  
  /**
   * Format element attributes for better readability
   */
  private formatAttributes(content: string, options: XmluiFormatterOptions): string {
    const { maxLineLength, tabSize, insertSpaces, newLine } = options;
    const indent = insertSpaces ? ' '.repeat(tabSize) : '\t';
    const tagRegex = /<([^\s/>]+)((?:\s+[^\s=]+="[^"]*")+)(\s*\/?>)/g;
    
    return content.replace(tagRegex, (match, tagName, attributesPart, tagEnd) => {
      // Extract attributes
      const attributeRegex = /\s+([^\s=]+)="([^"]*)"/g;
      const attributes: { name: string; value: string }[] = [];
      let attrMatch;
      
      while ((attrMatch = attributeRegex.exec(attributesPart)) !== null) {
        attributes.push({ name: attrMatch[1], value: attrMatch[2] });
      }
      
      // Sort attributes if configured
      if (options.sortAttributes) {
        attributes.sort((a, b) => a.name.localeCompare(b.name));
      }
      
      // Calculate line length with all attributes on a single line
      const singleLineTag = `<${tagName} ${attributes.map(a => `${a.name}="${a.value}"`).join(' ')}${tagEnd}`;
      
      // If it fits on a single line and under the limit, return as is
      if (singleLineTag.length <= maxLineLength) {
        return `<${tagName} ${attributes.map(a => `${a.name}="${a.value}"`).join(' ')}${tagEnd}`;
      }
      
      // Otherwise, format with one attribute per line
      const currentIndent = indent.repeat(
        content.substring(0, content.indexOf(match)).split('\n').pop()?.search(/\S/) ?? 0
      );
      const attrIndent = currentIndent + indent;
      
      const formattedAttributes = attributes.map(a => `${newLine}${attrIndent}${a.name}="${a.value}"`).join('');
      
      return `<${tagName}${formattedAttributes}${newLine}${currentIndent}${tagEnd}`;
    });
  }
  
  /**
   * Apply XMLUI-specific formatting rules
   */
  private applyXmluiRules(content: string, options: XmluiFormatterOptions): string {
    let result = content;
    
    // Format specific XMLUI elements like <App>, <Page>, etc.
    result = this.formatXmluiComments(result, options);
    
    // Format variable declarations in App tags
    result = this.formatVarDeclarations(result, options);
    
    return result;
  }
  
  /**
   * Format XMLUI comments
   */
  private formatXmluiComments(content: string, options: XmluiFormatterOptions): string {
    const { newLine } = options;
    
    // Add proper spacing for comments
    return content.replace(/(<\!--.*?--\>)/g, (match) => {
      return newLine + match + newLine;
    });
  }
  
  /**
   * Format var declarations in App tags
   */
  private formatVarDeclarations(content: string, options: XmluiFormatterOptions): string {
    const { tabSize, insertSpaces } = options;
    const indent = insertSpaces ? ' '.repeat(tabSize) : '\t';
    
    return content.replace(/<App\s+(var\.[^\s=]+="[^"]*")+/g, (match) => {
      // Extract var declarations
      const varRegex = /(var\.[^\s=]+)="([^"]*)"/g;
      const vars: { name: string; value: string }[] = [];
      let varMatch;
      
      while ((varMatch = varRegex.exec(match)) !== null) {
        vars.push({ name: varMatch[1], value: varMatch[2] });
      }
      
      // Format vars on separate lines
      return `<App\n${indent}${vars.map(v => `${v.name}="${v.value}"`).join(`\n${indent}`)}`;
    });
  }
}
