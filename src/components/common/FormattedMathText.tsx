import React, { useMemo } from 'react';
import katex from 'katex';

export interface FormattedMathTextProps {
  text: string;
  className?: string;
  as?: 'span' | 'p' | 'div';
}

interface ParsedToken {
  type: 'text' | 'inline' | 'block';
  content: string;
}

// Single regex to capture common unescaped math expressions in educational texts
const UNESCAPED_MATH_REGEX = /(?:M_[XYZ]\([a-z]\)\s*=\s*E\[e\^\{[^\}]+\}\]|E\[e\^\{[^\}]+\}\]|M_\{[^\}]+\}(?:\([a-z]\))?|\\(?:hat|bar|tilde|vec)\{[^}]+\}(?:_[a-zA-Z0-9]+)?|E\[[^\]]+\]|Var\([^\)]+\)|Cov\([^\)]+\)|\\[a-zA-Z]+(?:\^\{[^\}]+\}|\^[a-zA-Z0-9]+)?(?:_\{[^\}]+\}|_[a-zA-Z0-9]+)?|\b[fMg]_[XYZW]\([a-zA-Z0-9\s\-+]+\)|\b[fMg]_[XYZW]\b|\b[HeyxSZXY]_[01in]\b|\bR\^2\b|\bR²\b)/g;

function parseFormattedText(raw: string): ParsedToken[] {
  if (!raw) return [];

  // 1. Protect existing $$ ... $$ and $ ... $
  const existingTokens: string[] = [];
  const placeholderPrefix = `___MATH_RAW_${Date.now()}_`;

  let s = raw.replace(/(\$\$[\s\S]+?\$\$|\$[^\$]+?\$)/g, (match) => {
    existingTokens.push(match);
    return `${placeholderPrefix}${existingTokens.length - 1}___`;
  });

  // 2. Wrap unescaped math patterns in $...$
  s = s.replace(UNESCAPED_MATH_REGEX, (match) => `$${match}$`);

  // 3. Restore protected tokens
  s = s.replace(new RegExp(`${placeholderPrefix}(\\d+)___`, 'g'), (_, idx) => existingTokens[Number(idx)]);

  // 4. Split by math delimiters
  const parts = s.split(/(\$\$[\s\S]+?\$\$|\$[^\$]+?\$)/g);

  return parts
    .filter((part) => part.length > 0)
    .map((part): ParsedToken => {
      if (part.startsWith('$$') && part.endsWith('$$')) {
        return { type: 'block', content: part.slice(2, -2).trim() };
      }
      if (part.startsWith('$') && part.endsWith('$')) {
        return { type: 'inline', content: part.slice(1, -1).trim() };
      }
      return { type: 'text', content: part };
    });
}

function renderMathHtml(math: string, displayMode: boolean): string {
  try {
    return katex.renderToString(math, {
      displayMode,
      throwOnError: false,
    });
  } catch (err) {
    return `<span class="katex-error text-red-500 font-mono text-xs">${math}</span>`;
  }
}

export const FormattedMathText: React.FC<FormattedMathTextProps> = ({
  text,
  className = '',
  as = 'span',
}) => {
  const tokens = useMemo(() => parseFormattedText(text), [text]);

  if (!text) return null;

  const content = tokens.map((token, idx) => {
    if (token.type === 'text') {
      return <React.Fragment key={idx}>{token.content}</React.Fragment>;
    }

    if (token.type === 'block') {
      const html = renderMathHtml(token.content, true);
      return (
        <span
          key={idx}
          className="block my-2 overflow-x-auto text-center"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      );
    }

    // inline
    const html = renderMathHtml(token.content, false);
    return (
      <span
        key={idx}
        className="inline-math px-0.5 align-baseline"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    );
  });

  const Tag = as;
  return <Tag className={className}>{content}</Tag>;
};
