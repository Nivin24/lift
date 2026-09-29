import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface MarkdownViewProps {
  content: string;
  isDark?: boolean;
}

export const MarkdownView: React.FC<MarkdownViewProps> = ({ content, isDark = true }) => {
  if (!content) return null;

  const lines = content.split('\n');
  const elements: React.ReactNode[] = [];
  let inCodeBlock = false;
  let codeBuffer: string[] = [];
  let codeLang = '';

  const renderInlineFormatted = (text: string, textStyle: any) => {
    // Splits by inline code `...` and bold **...**
    const parts = text.split(/(`[^`]+`|\*\*[^*]+\*\*)/g);
    return parts.map((part, index) => {
      if (part.startsWith('`') && part.endsWith('`')) {
        const codeText = part.slice(1, -1);
        return (
          <Text
            key={index}
            style={[
              styles.inlineCode,
              {
                backgroundColor: isDark ? '#222824' : '#E8EAE2',
                color: isDark ? '#9DE8BA' : '#161917',
                borderColor: isDark ? '#2E3631' : '#D8DBD2',
              },
            ]}
          >
            {codeText}
          </Text>
        );
      } else if (part.startsWith('**') && part.endsWith('**')) {
        const boldText = part.slice(2, -2);
        return (
          <Text key={index} style={[textStyle, { fontWeight: '700', color: isDark ? '#FFFFFF' : '#161917' }]}>
            {boldText}
          </Text>
        );
      }
      return (
        <Text key={index} style={textStyle}>
          {part}
        </Text>
      );
    });
  };

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];
    const trimmed = rawLine.trim();

    // Code block start / end
    if (trimmed.startsWith('```')) {
      if (inCodeBlock) {
        // End code block
        elements.push(
          <View
            key={`code-${i}`}
            style={[
              styles.codeBlockCard,
              {
                backgroundColor: isDark ? '#0D0F0E' : '#1E221F',
                borderColor: isDark ? '#2A302C' : '#333833',
              },
            ]}
          >
            {codeLang ? (
              <View style={styles.codeHeader}>
                <Text style={styles.codeLangText}>{codeLang.toUpperCase()}</Text>
              </View>
            ) : null}
            <Text style={styles.codeBlockText}>{codeBuffer.join('\n')}</Text>
          </View>
        );
        codeBuffer = [];
        codeLang = '';
        inCodeBlock = false;
      } else {
        inCodeBlock = true;
        codeLang = trimmed.slice(3).trim();
      }
      continue;
    }

    if (inCodeBlock) {
      codeBuffer.push(rawLine);
      continue;
    }

    // Empty line
    if (!trimmed) {
      elements.push(<View key={`empty-${i}`} style={{ height: 6 }} />);
      continue;
    }

    // Headings
    if (trimmed.startsWith('### ')) {
      elements.push(
        <Text key={`h3-${i}`} style={[styles.h3, { color: isDark ? '#FFFFFF' : '#161917' }]}>
          {renderInlineFormatted(trimmed.slice(4), [styles.h3, { color: isDark ? '#FFFFFF' : '#161917' }])}
        </Text>
      );
      continue;
    }
    if (trimmed.startsWith('## ')) {
      elements.push(
        <Text key={`h2-${i}`} style={[styles.h2, { color: isDark ? '#FFFFFF' : '#161917' }]}>
          {renderInlineFormatted(trimmed.slice(3), [styles.h2, { color: isDark ? '#FFFFFF' : '#161917' }])}
        </Text>
      );
      continue;
    }
    if (trimmed.startsWith('# ')) {
      elements.push(
        <Text key={`h1-${i}`} style={[styles.h1, { color: isDark ? '#FFFFFF' : '#161917' }]}>
          {renderInlineFormatted(trimmed.slice(2), [styles.h1, { color: isDark ? '#FFFFFF' : '#161917' }])}
        </Text>
      );
      continue;
    }

    // Blockquote
    if (trimmed.startsWith('> ')) {
      elements.push(
        <View
          key={`quote-${i}`}
          style={[
            styles.quoteBox,
            {
              borderLeftColor: isDark ? '#9DE8BA' : '#161917',
              backgroundColor: isDark ? '#1C221F' : '#EFF1EA',
            },
          ]}
        >
          <Text style={[styles.quoteText, { color: isDark ? '#D1D5DB' : '#374151' }]}>
            {renderInlineFormatted(trimmed.slice(2), [styles.quoteText, { color: isDark ? '#D1D5DB' : '#374151' }])}
          </Text>
        </View>
      );
      continue;
    }

    // Unordered List item
    if (trimmed.startsWith('- ') || trimmed.startsWith('* ') || trimmed.startsWith('• ')) {
      elements.push(
        <View key={`li-${i}`} style={styles.listItemRow}>
          <View style={[styles.bulletDot, { backgroundColor: isDark ? '#9DE8BA' : '#161917' }]} />
          <Text style={[styles.bodyText, { color: isDark ? '#D1D5DB' : '#2D312E', flex: 1 }]}>
            {renderInlineFormatted(trimmed.slice(2), [styles.bodyText, { color: isDark ? '#D1D5DB' : '#2D312E' }])}
          </Text>
        </View>
      );
      continue;
    }

    // Numbered List item
    const numMatch = trimmed.match(/^(\d+)\.\s+(.+)$/);
    if (numMatch) {
      elements.push(
        <View key={`num-${i}`} style={styles.listItemRow}>
          <Text style={[styles.numPrefix, { color: isDark ? '#9DE8BA' : '#161917' }]}>{numMatch[1]}.</Text>
          <Text style={[styles.bodyText, { color: isDark ? '#D1D5DB' : '#2D312E', flex: 1 }]}>
            {renderInlineFormatted(numMatch[2], [styles.bodyText, { color: isDark ? '#D1D5DB' : '#2D312E' }])}
          </Text>
        </View>
      );
      continue;
    }

    // Regular Paragraph
    elements.push(
      <Text key={`p-${i}`} style={[styles.bodyText, { color: isDark ? '#D1D5DB' : '#2D312E' }]}>
        {renderInlineFormatted(trimmed, [styles.bodyText, { color: isDark ? '#D1D5DB' : '#2D312E' }])}
      </Text>
    );
  }

  return <View style={styles.container}>{elements}</View>;
};

const styles = StyleSheet.create({
  container: {
    gap: 6,
  },
  h1: {
    fontSize: 18,
    fontWeight: '800',
    marginTop: 8,
    marginBottom: 4,
    letterSpacing: -0.2,
  },
  h2: {
    fontSize: 15,
    fontWeight: '700',
    marginTop: 6,
    marginBottom: 3,
    letterSpacing: -0.1,
  },
  h3: {
    fontSize: 13.5,
    fontWeight: '700',
    marginTop: 4,
    marginBottom: 2,
  },
  bodyText: {
    fontSize: 13,
    lineHeight: 20,
    fontWeight: '400',
  },
  inlineCode: {
    fontFamily: 'monospace',
    fontSize: 11.5,
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 5,
    borderWidth: 1,
  },
  codeBlockCard: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
    marginVertical: 4,
    overflow: 'hidden',
  },
  codeHeader: {
    borderBottomWidth: 1,
    borderBottomColor: '#2C332E',
    paddingBottom: 4,
    marginBottom: 8,
  },
  codeLangText: {
    fontSize: 9.5,
    fontFamily: 'monospace',
    fontWeight: '700',
    color: '#8E958F',
    letterSpacing: 0.5,
  },
  codeBlockText: {
    fontFamily: 'monospace',
    fontSize: 11.5,
    lineHeight: 17,
    color: '#E6EAE8',
  },
  quoteBox: {
    borderLeftWidth: 3,
    borderRadius: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginVertical: 4,
  },
  quoteText: {
    fontSize: 12.5,
    lineHeight: 18,
    fontStyle: 'italic',
  },
  listItemRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginVertical: 1.5,
  },
  bulletDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    marginTop: 8,
  },
  numPrefix: {
    fontSize: 12.5,
    fontFamily: 'monospace',
    fontWeight: '700',
    width: 20,
  },
});
