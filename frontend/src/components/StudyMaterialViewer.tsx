import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Copy, Check, Terminal, BookOpen, Bookmark } from 'lucide-react';

interface StudyMaterialViewerProps {
  content: string;
  title?: string;
  authorType?: string;
  createdAt?: string;
}

export const StudyMaterialViewer: React.FC<StudyMaterialViewerProps> = ({
  content,
  title,
  authorType,
  createdAt,
}) => {
  const [copiedCodeId, setCopiedCodeId] = useState<string | null>(null);

  const handleCopy = (codeText: string, id: string) => {
    navigator.clipboard.writeText(codeText);
    setCopiedCodeId(id);
    setTimeout(() => setCopiedCodeId(null), 2000);
  };

  return (
    <div className="bg-white dark:bg-[#161917] rounded-3xl p-6 sm:p-8 border border-[#E3E5DE] dark:border-[#262A27] shadow-xs space-y-6 transition-colors">
      {/* Header Info */}
      {(title || authorType) && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#F0F1EC] dark:border-[#262A27] gap-2">
          <div className="flex items-center space-x-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-pastel-mintBtn"></span>
            <span className="text-[11px] font-bold font-mono tracking-wider uppercase px-2.5 py-0.5 rounded-full bg-[#F0F1EC] dark:bg-[#202422] text-[#525752] dark:text-[#A3AAA4] border border-[#E3E5DE] dark:border-[#2E3330]">
              {authorType || 'SYSTEM'} CURRICULUM
            </span>
            {title && <h2 className="text-base font-bold text-[#161917] dark:text-white">{title}</h2>}
          </div>
          {createdAt && (
            <span className="text-[11px] font-mono text-[#888F89] dark:text-[#767C77]">
              Updated {new Date(createdAt).toLocaleDateString()}
            </span>
          )}
        </div>
      )}

      {/* Structured Readable Markdown Document */}
      <div className="prose prose-stone dark:prose-invert max-w-none text-[#161917] dark:text-[#E8EAE6]">
        <ReactMarkdown
          components={{
            h1: ({ children }) => (
              <h1 className="text-2xl font-extrabold text-[#161917] dark:text-white tracking-tight mt-6 mb-3 pb-2 border-b border-[#E3E5DE] dark:border-[#262A27] flex items-center space-x-2">
                <span>{children}</span>
              </h1>
            ),
            h2: ({ children }) => (
              <h2 className="text-lg font-bold text-[#161917] dark:text-white tracking-tight mt-6 mb-2.5 flex items-center space-x-2">
                <span className="w-1.5 h-4 rounded-full bg-amber-400"></span>
                <span>{children}</span>
              </h2>
            ),
            h3: ({ children }) => (
              <h3 className="text-xs font-bold text-[#888F89] dark:text-[#767C77] uppercase tracking-wider mt-5 mb-2">
                {children}
              </h3>
            ),
            p: ({ children }) => (
              <p className="text-[13.5px] leading-relaxed text-[#383E3A] dark:text-[#D1D5DB] mb-3.5 font-sans">
                {children}
              </p>
            ),
            ul: ({ children }) => (
              <ul className="my-3 space-y-2 pl-2">
                {children}
              </ul>
            ),
            ol: ({ children }) => (
              <ol className="my-3 space-y-2 list-decimal list-inside pl-2 text-sm text-[#383E3A] dark:text-[#D1D5DB]">
                {children}
              </ol>
            ),
            li: ({ children }) => (
              <li className="text-[13.5px] text-[#383E3A] dark:text-[#D1D5DB] leading-relaxed flex items-start space-x-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-pastel-mintBtn mt-2 shrink-0"></span>
                <span className="flex-1">{children}</span>
              </li>
            ),
            blockquote: ({ children }) => (
              <div className="my-4 p-4 rounded-2xl bg-[#FCE8A6]/40 dark:bg-[#3B2B00]/40 border border-amber-300/60 dark:border-amber-700/60 text-[#553E00] dark:text-[#FCE8A6] text-xs leading-relaxed flex items-start space-x-3">
                <Bookmark className="w-4 h-4 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
                <div className="font-sans space-y-1">{children}</div>
              </div>
            ),
            code: ({ inline, className, children, ...props }: any) => {
              const match = /language-(\w+)/.exec(className || '');
              const codeString = String(children).replace(/\n$/, '');
              const blockId = `code_${Math.abs(codeString.slice(0, 30).split('').reduce((a, b) => a + b.charCodeAt(0), 0))}`;
              const isCopied = copiedCodeId === blockId;

              if (inline) {
                return (
                  <code className="px-1.5 py-0.5 rounded-md bg-[#E8EAE3] dark:bg-[#202422] text-[#161917] dark:text-[#E8EAE6] font-mono text-[12px] font-semibold border border-[#DEE0D8] dark:border-[#2E3330]">
                    {children}
                  </code>
                );
              }

              return (
                <div className="my-5 rounded-2xl bg-[#161917] text-[#F3F4F1] border border-[#2B302C] overflow-hidden shadow-md">
                  {/* Code Block Window Header */}
                  <div className="flex items-center justify-between px-4 py-2 bg-[#1F2320] border-b border-[#2B302C] text-xs font-mono">
                    <div className="flex items-center space-x-2">
                      <div className="flex space-x-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#EF4444]/70"></span>
                        <span className="w-2.5 h-2.5 rounded-full bg-[#F59E0B]/70"></span>
                        <span className="w-2.5 h-2.5 rounded-full bg-[#10B981]/70"></span>
                      </div>
                      <span className="text-[11px] text-[#A6ADA8] uppercase tracking-wider ml-1 font-semibold">
                        {match ? match[1] : 'code'}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleCopy(codeString, blockId)}
                      className="flex items-center space-x-1.5 px-2 py-1 rounded-md bg-[#2A302C] hover:bg-[#363C38] text-slate-300 hover:text-white transition-colors text-[11px]"
                    >
                      {isCopied ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-400" />
                          <span className="text-emerald-400 font-semibold">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3 text-slate-400" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Code Body */}
                  <pre className="p-4 overflow-x-auto text-[12.5px] font-mono leading-relaxed text-[#F3F4F1] bg-[#161917]">
                    <code>{codeString}</code>
                  </pre>
                </div>
              );
            },
            table: ({ children }) => (
              <div className="my-4 overflow-x-auto rounded-2xl border border-[#E3E5DE] dark:border-[#262A27]">
                <table className="min-w-full divide-y divide-[#E3E5DE] dark:divide-[#262A27] text-xs font-mono">
                  {children}
                </table>
              </div>
            ),
            thead: ({ children }) => (
              <thead className="bg-[#F5F6F2] dark:bg-[#202422] text-[#161917] dark:text-white font-semibold">{children}</thead>
            ),
            th: ({ children }) => (
              <th className="px-4 py-2.5 text-left font-bold">{children}</th>
            ),
            td: ({ children }) => (
              <td className="px-4 py-2 text-[#383E3A] dark:text-[#D1D5DB] border-t border-[#E3E5DE] dark:border-[#262A27]">{children}</td>
            ),
            hr: () => <hr className="my-6 border-[#E3E5DE] dark:border-[#262A27]" />
          }}
        >
          {content}
        </ReactMarkdown>
      </div>
    </div>
  );
};
