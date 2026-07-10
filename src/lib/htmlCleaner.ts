import DOMPurify from "dompurify";

export interface CleanerOptions {
  removeTagAttributes: boolean;
  removeInlineStyles: boolean;
  removeClassesAndIds: boolean;
  removeAllTags: boolean;
  removeSuccessiveNbsps: boolean;
  removeEmptyTags: boolean;
  removeTagsWithOneNbsp: boolean;
  removeSpanTags: boolean;
  removeImages: boolean;
  removeLinks: boolean;
  removeTables: boolean;
  replaceTableTagsWithDivs: boolean;
  removeComments: boolean;
  setNewLinesAndTextIndents: boolean;
}

export function cleanHtml(rawHtml: string, options: CleanerOptions): string {
  if (typeof window === "undefined") {
    return rawHtml; // SSR fallback
  }

  let html = rawHtml;

  // 1. Remove HTML comments
  if (options.removeComments) {
    html = html.replace(/<!--[\s\S]*?-->/g, '');
  }

  // 2. Normalize &nbsp; entities and unicode \u00A0 to the literal string &nbsp; for consistent processing
  // The browser DOM and rich text editors produce \u00A0 (non-breaking space) characters.
  // We normalize them all to &nbsp; entities first for reliable regex matching.
  html = html.replace(/\u00A0/g, '&nbsp;');

  // 3. Remove tags that contain only a single &nbsp; (e.g. <p>&nbsp;</p>)
  if (options.removeTagsWithOneNbsp) {
    html = html.replace(/<([a-z][a-z0-9]*)\b[^>]*>\s*&nbsp;\s*<\/\1>/gi, '');
  }

  // 4. Remove successive &nbsp; sequences (2 or more consecutive)
  if (options.removeSuccessiveNbsps) {
    html = html.replace(/(&nbsp;\s*){2,}/g, ' ');
    // Also replace remaining single &nbsp; with regular spaces for clean output
    html = html.replace(/&nbsp;/g, ' ');
  }

  // Determine FORBID_TAGS and FORBID_ATTR based on options
  const forbidTags: string[] = ['script', 'iframe', 'noscript', 'canvas', 'form', 'button', 'input', 'style'];
  if (!options.removeAllTags) {
    if (options.removeSpanTags) forbidTags.push('span');
    if (options.removeImages) forbidTags.push('img', 'picture', 'source', 'svg');
    if (options.removeLinks) forbidTags.push('a');
    if (options.removeTables) forbidTags.push('table', 'thead', 'tbody', 'tr', 'td', 'th', 'tfoot', 'caption', 'colgroup', 'col');
  }

  const forbidAttr: string[] = ['on*'];
  if (options.removeInlineStyles) forbidAttr.push('style');
  if (options.removeClassesAndIds) forbidAttr.push('class', 'id');

  // DOMPurify execution
  const purifyConfig: Record<string, unknown> = {
    FORBID_TAGS: forbidTags,
    FORBID_ATTR: forbidAttr,
    ALLOW_DATA_ATTR: false,
    RETURN_TRUSTED_TYPE: false,
  };
  
  if (options.removeAllTags) {
    purifyConfig.ALLOWED_TAGS = [];
  }

  const purified = DOMPurify.sanitize(html, purifyConfig) as unknown as string;

  // Parse into DOM for structural manipulation
  const parser = new DOMParser();
  const doc = parser.parseFromString(purified, "text/html");
  const body = doc.body;

  // Remove tag attributes (keep essential ones like src, href, alt)
  if (options.removeTagAttributes) {
    const elements = body.querySelectorAll("*");
    elements.forEach(el => {
      const tag = el.tagName.toLowerCase();
      const keepAttrs: string[] = [];
      if (!options.removeImages && tag === 'img') keepAttrs.push('src', 'alt', 'width', 'height');
      if (!options.removeLinks && tag === 'a') keepAttrs.push('href', 'target', 'rel');
      
      const attrsToRemove: string[] = [];
      for (let i = 0; i < el.attributes.length; i++) {
        if (!keepAttrs.includes(el.attributes[i].name)) {
          attrsToRemove.push(el.attributes[i].name);
        }
      }
      attrsToRemove.forEach(attr => el.removeAttribute(attr));
    });
  }

  // Replace table tags with <div>s
  if (options.replaceTableTagsWithDivs && !options.removeTables && !options.removeAllTags) {
    const tableTagsOrder = ['th', 'td', 'tr', 'thead', 'tbody', 'tfoot', 'table'];
    tableTagsOrder.forEach(tag => {
      const els = body.querySelectorAll(tag);
      els.forEach(el => {
        const div = doc.createElement('div');
        div.innerHTML = el.innerHTML;
        el.parentNode?.replaceChild(div, el);
      });
    });
  }

  // Remove empty tags
  if (options.removeEmptyTags && !options.removeAllTags) {
    const selfClosing = new Set(['img', 'br', 'hr', 'input', 'meta', 'link']);
    let removedEmpty = true;
    while (removedEmpty) {
      removedEmpty = false;
      const allElements = body.querySelectorAll("*");
      allElements.forEach((el) => {
        const tag = el.tagName.toLowerCase();
        if (!selfClosing.has(tag)) {
          const content = el.innerHTML.replace(/&nbsp;/g, '').replace(/\u00A0/g, '').trim();
          if (content === "") {
            el.remove();
            removedEmpty = true;
          }
        }
      });
    }
  }

  // Get final HTML
  let finalHtml = body.innerHTML;

  // Clean up any remaining \u00A0 characters in the output
  finalHtml = finalHtml.replace(/\u00A0/g, ' ');

  // Set new lines and text indents (pretty print)
  if (options.setNewLinesAndTextIndents) {
    finalHtml = finalHtml.replace(/></g, '>\n<');
  }

  // Final cleanup: collapse multiple spaces into one
  finalHtml = finalHtml.replace(/  +/g, ' ');

  return finalHtml.trim();
}
