import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

const mdComponents = {
  p: ({ children }) => (
    <p className="text-mist-soft text-[15px] leading-relaxed font-body mb-3 last:mb-0">
      {children}
    </p>
  ),
  strong: ({ children }) => <strong className="text-mist font-semibold">{children}</strong>,
  em: ({ children }) => <em className="text-mist-soft italic">{children}</em>,
  ul: ({ children }) => (
    <ul className="list-disc pl-5 space-y-1.5 mb-3 text-mist-soft text-[15px] font-body">
      {children}
    </ul>
  ),
  ol: ({ children }) => (
    <ol className="list-decimal pl-5 space-y-1.5 mb-3 text-mist-soft text-[15px] font-body">
      {children}
    </ol>
  ),
  li: ({ children }) => <li className="leading-relaxed">{children}</li>,
  h1: ({ children }) => (
    <h3 className="font-display text-lg text-mist mt-1 mb-2">{children}</h3>
  ),
  h2: ({ children }) => (
    <h3 className="font-display text-lg text-mist mt-1 mb-2">{children}</h3>
  ),
  h3: ({ children }) => (
    <h4 className="font-body font-semibold text-mist text-sm uppercase tracking-wide mt-1 mb-2">
      {children}
    </h4>
  ),
  code: ({ children }) => (
    <code className="font-mono text-[13px] bg-mist/10 px-1.5 py-0.5 rounded text-gold-light">
      {children}
    </code>
  ),
  blockquote: ({ children }) => (
    <blockquote className="border-l-2 border-gold pl-3 text-mist-faint italic mb-3">
      {children}
    </blockquote>
  ),
  blockquote: ({ children }) => (
    <blockquote className="border-l-2 border-gold pl-3 text-mist-faint italic mb-3">
      {children}
    </blockquote>
  ),
  table: ({ children }) => (
    <div className="overflow-x-auto mb-3 rounded-lg border border-mist/15">
      <table className="w-full text-sm font-body border-collapse">{children}</table>
    </div>
  ),
  thead: ({ children }) => <thead className="bg-mist/[0.06]">{children}</thead>,
  th: ({ children }) => (
    <th className="text-left px-3 py-2 text-mist font-semibold border-b border-mist/15">
      {children}
    </th>
  ),
  td: ({ children }) => (
    <td className="px-3 py-2 text-mist-soft border-b border-mist/10">{children}</td>
  ),
};

export default function AIAnalyst({ status, text, error, onGenerate, disabled }) {
  const isStreaming = status === "streaming";
  const isConnecting = status === "connecting";

  return (
    <div className="glass-card p-6 md:p-7">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-1">
        <div>
          <h2 className="font-display text-xl text-mist">AI Analyst's Note</h2>
          <p className="text-sm text-mist-faint">
            A personalized read on your projection, written as it thinks.
          </p>
        </div>
        <button
          type="button"
          onClick={onGenerate}
          disabled={disabled || isStreaming || isConnecting}
          className="btn-shine font-body font-semibold text-sm text-vault-deep px-4 py-2.5 rounded-lg shadow-glow-gold hover:brightness-110 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:brightness-100 transition-[filter] whitespace-nowrap"
        >
          {isConnecting
            ? "Connecting…"
            : isStreaming
            ? "Writing…"
            : text
            ? "Regenerate Analysis"
            : "Generate AI Analysis"}
        </button>
      </div>

      <div className="mt-5 bg-vault-deep/60 bg-ledger-dark rounded-xl border border-mist/10 min-h-[160px] p-5 md:p-6 relative overflow-hidden">
        {error && (
          <div className="flex items-start gap-2 text-brick-light text-sm font-body">
            <span className="mt-0.5">⚠</span>
            <p>{error}</p>
          </div>
        )}

        {!error && isConnecting && (
          <div className="flex items-center gap-2 text-mist-faint text-sm font-mono">
            <span className="flex gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-gold-light motion-safe:animate-bounce [animation-delay:-0.3s]" />
              <span className="w-1.5 h-1.5 rounded-full bg-gold-light motion-safe:animate-bounce [animation-delay:-0.15s]" />
              <span className="w-1.5 h-1.5 rounded-full bg-gold-light motion-safe:animate-bounce" />
            </span>
            Reaching the analyst…
          </div>
        )}

        {!error && !isConnecting && !text && (
          <p className="text-mist-faint text-sm font-body italic">
            Your note will appear here once generated — expect a read on your trajectory
            and a suggestion or two, in plain language.
          </p>
        )}

        {!error && text && (
          <div>
<ReactMarkdown remarkPlugins={[remarkGfm]} components={mdComponents}>{text}</ReactMarkdown>            {isStreaming && (
              <span className="inline-block w-[2px] h-[1em] bg-gold-light align-middle motion-safe:animate-blink" />
            )}
          </div>
        )}
      </div>

      <p className="text-[11px] text-mist-faint mt-3 font-body">
        Generated by AI for educational purposes only — not licensed financial advice.
      </p>
    </div>
  );
}
