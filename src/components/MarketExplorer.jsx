import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { fetchMarketData, streamMarketRecommendation } from "../api.js";
import { currency } from "../lib/currency.js";

const TABS = [
  { id: "mutual_funds", label: "SIP / Mutual Funds" },
  { id: "stocks", label: "Stocks" },
  { id: "gold", label: "Gold" },
  { id: "real_estate", label: "Real Estate" },
  { id: "ipos", label: "IPOs" },
];

const mdComponents = {
  p: ({ children }) => (
    <p className="text-mist-soft text-[15px] leading-relaxed font-body mb-3 last:mb-0">
      {children}
    </p>
  ),
  strong: ({ children }) => <strong className="text-mist font-semibold">{children}</strong>,
  ul: ({ children }) => (
    <ul className="list-disc pl-5 space-y-1.5 mb-3 text-mist-soft text-[15px] font-body">
      {children}
    </ul>
  ),
  li: ({ children }) => <li className="leading-relaxed">{children}</li>,
  h3: ({ children }) => (
    <h4 className="font-body font-semibold text-mist text-sm uppercase tracking-wide mt-3 mb-2">
      {children}
    </h4>
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

function StatPill({ label, value, tone = "mist" }) {
  const toneClass =
    tone === "gold"
      ? "text-gold-light"
      : tone === "emerald"
      ? "text-emerald-bright"
      : "text-mist-soft";
  return (
    <span className="font-mono text-xs">
      <span className="text-mist-faint">{label} </span>
      <span className={toneClass}>{value}</span>
    </span>
  );
}

function MutualFundsPanel({ data }) {
  if (!data?.length) return <EmptyState text="No mutual fund data available." />;
  return (
    <div className="grid sm:grid-cols-2 gap-3">
      {data.map((mf) => (
        <div
          key={mf.scheme_code}
          className="rounded-xl border border-mist/10 bg-mist/[0.03] p-4"
        >
          <p className="text-[10px] uppercase tracking-widest text-mist-faint font-mono mb-1">
            {mf.category?.replace("_", " ")}
          </p>
          <p className="text-sm text-mist font-body font-medium mb-2">{mf.scheme_name}</p>
          {mf.unavailable ? (
            <p className="text-xs text-brick-light font-mono">{mf.error}</p>
          ) : (
            <div className="flex flex-wrap gap-x-4 gap-y-1">
              <StatPill label="NAV" value={`₹${mf.latest_nav}`} tone="gold" />
              <StatPill
                label="3yr CAGR"
                value={mf.cagr_3y_percent != null ? `${mf.cagr_3y_percent}%` : "N/A"}
                tone="emerald"
              />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function StocksPanel({ data }) {
  if (!data?.length) return <EmptyState text="No stock data available." />;
  return (
    <div className="grid sm:grid-cols-2 gap-3">
      {data.map((s) => (
        <div key={s.symbol} className="rounded-xl border border-mist/10 bg-mist/[0.03] p-4">
          <p className="text-sm text-mist font-body font-medium mb-2">{s.name}</p>
          {s.unavailable ? (
            <p className="text-xs text-brick-light font-mono">{s.error}</p>
          ) : (
            <div className="flex flex-wrap gap-x-4 gap-y-1">
              <StatPill label="Price" value={currency.format(s.current_price_inr)} tone="gold" />
              <StatPill
                label="3yr CAGR"
                value={s.cagr_3y_percent != null ? `${s.cagr_3y_percent}%` : "N/A"}
                tone="emerald"
              />
              {s.day_change_percent != null && (
                <StatPill
                  label="Today"
                  value={`${s.day_change_percent > 0 ? "+" : ""}${s.day_change_percent}%`}
                />
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function GoldPanel({ data }) {
  if (!data || data.unavailable) return <EmptyState text="Live gold price unavailable right now." />;
  return (
    <div className="rounded-xl border border-mist/10 bg-mist/[0.03] p-5">
      <p className="font-display text-3xl text-gold-light mb-1">
        {currency.format(data.inr_per_10_gram_24k)}
        <span className="text-sm text-mist-faint font-body"> / 10g (24k)</span>
      </p>
      <p className="text-sm text-mist-soft font-mono">
        {currency.format(data.inr_per_gram_24k)} / gram · ${data.usd_per_troy_oz} per troy oz
      </p>
    </div>
  );
}

function RealEstatePanel({ data }) {
  if (!data) return <EmptyState text="No real estate data available." />;
  return (
    <div>
      <p className="text-xs text-mist-faint font-body italic mb-3">{data.message}</p>
      <div className="grid sm:grid-cols-2 gap-3">
        {data.data?.map((r) => (
          <div key={r.city} className="rounded-xl border border-mist/10 bg-mist/[0.03] p-4">
            <p className="text-sm text-mist font-body font-medium mb-1">{r.city}</p>
            <StatPill label="Avg 5yr" value={`~${r.avg_cagr_5y_percent}%/yr`} tone="emerald" />
            <p className="text-xs text-mist-faint mt-1">{r.note}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function IposPanel({ data }) {
  return <EmptyState text={data?.message || "Live IPO data isn't available right now."} />;
}

function EmptyState({ text }) {
  return (
    <div className="text-sm text-mist-faint font-body italic border border-dashed border-mist/15 rounded-xl p-6 text-center">
      {text}
    </div>
  );
}

export default function MarketExplorer({ riskAppetite, years, monthlyContribution }) {
  const [activeTab, setActiveTab] = useState("mutual_funds");
  const [marketData, setMarketData] = useState(null);
  const [status, setStatus] = useState("loading"); // loading | ready | error
  const [error, setError] = useState(null);

  const [aiStatus, setAiStatus] = useState("idle");
  const [aiText, setAiText] = useState("");
  const [aiError, setAiError] = useState(null);
  const stopStreamRef = useRef(null);

  useEffect(() => {
    const controller = new AbortController();
    setStatus("loading");
    fetchMarketData(controller.signal)
      .then((data) => {
        setMarketData(data);
        setStatus("ready");
      })
      .catch((err) => {
        if (err.name === "AbortError") return;
        setError(err.message);
        setStatus("error");
      });
    return () => controller.abort();
  }, []);

  useEffect(() => () => stopStreamRef.current?.(), []);

  function handleGetRecommendation() {
    stopStreamRef.current?.();
    setAiStatus("connecting");
    setAiText("");
    setAiError(null);

    let firstChunk = false;
    stopStreamRef.current = streamMarketRecommendation(
      { risk_appetite: riskAppetite, years, monthly_contribution: monthlyContribution },
      {
        onChunk: (chunk) => {
          if (!firstChunk) {
            firstChunk = true;
            setAiStatus("streaming");
          }
          setAiText((prev) => prev + chunk);
        },
        onError: (message) => {
          setAiError(message);
          setAiStatus("error");
        },
        onDone: () => setAiStatus((prev) => (prev === "error" ? prev : "done")),
      }
    );
  }

  const isStreaming = aiStatus === "streaming";
  const isConnecting = aiStatus === "connecting";

  return (
    <div className="glass-card p-6 md:p-7">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-1">
        <div>
          <h2 className="font-display text-xl text-mist">Market Explorer</h2>
          <p className="text-sm text-mist-faint">
            Real market data across asset classes — no guarantees, just the numbers.
          </p>
        </div>
        <button
          type="button"
          onClick={handleGetRecommendation}
          disabled={status !== "ready" || isStreaming || isConnecting}
          className="btn-shine font-body font-semibold text-sm text-vault-deep px-4 py-2.5 rounded-lg shadow-glow-gold hover:brightness-110 disabled:opacity-40 disabled:cursor-not-allowed transition-[filter] whitespace-nowrap"
        >
          {isConnecting ? "Connecting…" : isStreaming ? "Writing…" : "Get AI Comparison"}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 mt-5 mb-4">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`px-3 py-1.5 rounded-full text-xs font-mono uppercase tracking-wide border transition-colors ${
              activeTab === tab.id
                ? "bg-gold/20 border-gold text-gold-light"
                : "border-mist/15 text-mist-faint hover:border-mist/30"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {status === "loading" && (
        <p className="text-sm text-mist-faint font-mono motion-safe:animate-pulse">
          Fetching live market data…
        </p>
      )}
      {status === "error" && (
        <p className="text-sm text-brick-light font-body">{error}</p>
      )}
      {status === "ready" && marketData && (
        <>
          {activeTab === "mutual_funds" && <MutualFundsPanel data={marketData.mutual_funds} />}
          {activeTab === "stocks" && <StocksPanel data={marketData.stocks} />}
          {activeTab === "gold" && <GoldPanel data={marketData.gold} />}
          {activeTab === "real_estate" && <RealEstatePanel data={marketData.real_estate} />}
          {activeTab === "ipos" && <IposPanel data={marketData.ipos} />}
        </>
      )}

      {/* AI comparison output */}
      {(aiText || aiError || isConnecting) && (
        <div className="mt-5 bg-vault-deep/60 bg-ledger-dark rounded-xl border border-mist/10 min-h-[100px] p-5 md:p-6">
          {aiError && <p className="text-brick-light text-sm font-body">⚠ {aiError}</p>}
          {!aiError && isConnecting && (
            <p className="text-mist-faint text-sm font-mono">Reaching the analyst…</p>
          )}
          {!aiError && aiText && (
            <ReactMarkdown remarkPlugins={[remarkGfm]} components={mdComponents}>
              {aiText}
            </ReactMarkdown>
          )}
        </div>
      )}

      <p className="text-[11px] text-mist-faint mt-4 font-body">
        Educational information only, not investment advice. Past performance (CAGR) does not
        guarantee future returns. Consult a SEBI-registered financial advisor before investing.
      </p>
    </div>
  );
}
