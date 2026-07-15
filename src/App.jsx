import { useEffect, useRef, useState } from "react";
import ControlPanel from "./components/ControlPanel.jsx";
import WealthChart from "./components/WealthChart.jsx";
import AIAnalyst from "./components/AIAnalyst.jsx";
import ReturnSeal from "./components/ReturnSeal.jsx";
import MarketExplorer from "./components/MarketExplorer.jsx";
import { simulatePortfolio, streamAiAnalysis } from "./api.js";
import { useCountUp } from "./useCountUp.js";
import { currency } from "./lib/currency.js";

const DEFAULT_FORM = {
  currentSavings: 1500000, // ₹15L
  monthlyContribution: 25000,
  years: 20,
  riskAppetite: "moderate",
};

export default function App() {
  const [form, setForm] = useState(DEFAULT_FORM);
  const [result, setResult] = useState(null);
  const [chartStatus, setChartStatus] = useState("idle"); // idle | loading | ready | error
  const [chartError, setChartError] = useState(null);

  const [aiStatus, setAiStatus] = useState("idle"); // idle | connecting | streaming | done | error
  const [aiText, setAiText] = useState("");
  const [aiError, setAiError] = useState(null);

  const debounceRef = useRef(null);
  const abortRef = useRef(null);
  const stopStreamRef = useRef(null);

  function updateForm(patch) {
    setForm((prev) => ({ ...prev, ...patch }));
  }

  // Debounced fetch to /api/portfolio/simulate whenever inputs change.
  useEffect(() => {
    clearTimeout(debounceRef.current);
    abortRef.current?.abort();

    debounceRef.current = setTimeout(async () => {
      const controller = new AbortController();
      abortRef.current = controller;
      setChartStatus("loading");
      setChartError(null);

      try {
        const payload = {
          current_savings: form.currentSavings,
          monthly_contribution: form.monthlyContribution,
          years: form.years,
          risk_appetite: form.riskAppetite,
        };
        const data = await simulatePortfolio(payload, controller.signal);
        setResult(data);
        setChartStatus("ready");
      } catch (err) {
        if (err.name === "AbortError") return;
        setChartStatus("error");
        setChartError(err.message);
      }
    }, 400);

    return () => clearTimeout(debounceRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.currentSavings, form.monthlyContribution, form.years, form.riskAppetite]);

  function handleGenerateAnalysis() {
    if (!result) return;

    stopStreamRef.current?.();
    setAiStatus("connecting");
    setAiText("");
    setAiError(null);

    const payload = {
      portfolio: {
        current_savings: form.currentSavings,
        monthly_contribution: form.monthlyContribution,
        years: form.years,
        risk_appetite: form.riskAppetite,
      },
      result_summary: result,
      user_question: "Give me a personalized read on this portfolio trajectory.",
    };

    let firstChunkReceived = false;

    stopStreamRef.current = streamAiAnalysis(payload, {
      onChunk: (chunk) => {
        if (!firstChunkReceived) {
          firstChunkReceived = true;
          setAiStatus("streaming");
        }
        setAiText((prev) => prev + chunk);
      },
      onError: (message) => {
        setAiError(message);
        setAiStatus("error");
      },
      onDone: () => {
        setAiStatus((prev) => (prev === "error" ? prev : "done"));
      },
    });
  }

  useEffect(() => () => stopStreamRef.current?.(), []);

  const finalBalance = useCountUp(result?.final_balance ?? 0, 700);
  const totalContributed = result?.total_contributed;
  const totalInterest = result?.total_interest_earned;

  return (
    <div className="relative min-h-screen bg-vault text-mist overflow-x-hidden">
      {/* Ambient background: gradient wash + drifting glow blobs + grain */}
      <div className="fixed inset-0 bg-vault-radial" aria-hidden="true" />
      <div
        className="fixed -top-24 -left-24 w-[420px] h-[420px] rounded-full bg-emerald-bright/20 blur-[110px] motion-safe:animate-drift-slow"
        aria-hidden="true"
      />
      <div
        className="fixed top-1/3 -right-32 w-[380px] h-[380px] rounded-full bg-gold/20 blur-[120px] motion-safe:animate-drift"
        aria-hidden="true"
      />
      <div className="relative">
        <header className="border-b border-mist/10">
          <div className="max-w-6xl mx-auto px-5 md:px-8 py-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-gold-light to-gold-dark flex items-center justify-center shadow-glow-gold">
                <span className="font-display text-vault text-lg leading-none">₹</span>
              </div>
              <div>
                <h1 className="font-display text-xl md:text-2xl leading-tight text-mist">
                  InvestMate
                </h1>
                <p className="text-[11px] font-mono uppercase tracking-[0.16em] text-mist-faint">
                  Where Savings Meet Strategy
                </p>
              </div>
            </div>
            <span
              className={`hidden sm:flex items-center gap-1.5 text-xs font-mono px-3 py-1.5 rounded-full border ${
                chartStatus === "error"
                  ? "border-brick/40 text-brick"
                  : "border-mist/15 text-mist-faint"
              }`}
            >
              <span className="relative flex w-1.5 h-1.5">
                <span
                  className={`absolute inline-flex h-full w-full rounded-full ${
                    chartStatus === "error" ? "bg-brick" : "bg-emerald-bright motion-safe:animate-pulse-ring"
                  }`}
                />
                <span
                  className={`relative inline-flex rounded-full h-1.5 w-1.5 ${
                    chartStatus === "error" ? "bg-brick" : "bg-emerald-bright"
                  }`}
                />
              </span>
                 {chartStatus === "error" ? "backend offline" : "live"}            </span>
          </div>
        </header>

        <main className="max-w-6xl mx-auto px-5 md:px-8 py-8 md:py-10 space-y-6">
          {/* Hero stat row */}
          <section className="glass-card p-6 md:p-8 flex flex-wrap items-center justify-between gap-6 motion-safe:animate-fade-up">
            <div>
              <p className="text-[11px] uppercase tracking-[0.14em] text-mist-faint font-medium mb-2">
                Projected balance · Year {form.years}
              </p>
              <p className="font-display text-4xl md:text-5xl tabular-nums bg-gradient-to-r from-gold-bright via-gold-light to-mist bg-clip-text text-transparent">
                {result ? currency.format(finalBalance) : "—"}
              </p>
              <div className="flex flex-wrap gap-x-6 gap-y-1 mt-3 text-sm font-mono text-mist-soft">
                <span>
                  <span className="text-moss-light">●</span> Contributed{" "}
                  {totalContributed != null ? currency.format(totalContributed) : "—"}
                </span>
                <span>
                  <span className="text-gold-light">●</span> Growth{" "}
                  {totalInterest != null ? currency.format(totalInterest) : "—"}
                </span>
              </div>
            </div>
            <ReturnSeal
              annualReturn={result?.annual_return_used}
              riskAppetite={form.riskAppetite}
            />
          </section>

          {/* Controls + Chart */}
          <section className="grid grid-cols-1 lg:grid-cols-[340px_1fr] gap-6">
            <ControlPanel form={form} onChange={updateForm} />

            <div className="glass-card p-6 md:p-7 motion-safe:animate-fade-up [animation-delay:80ms]">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-display text-xl text-mist">Growth Curve</h2>
                {chartStatus === "loading" && (
                  <span className="text-xs font-mono text-mist-faint motion-safe:animate-pulse">
                    recalculating…
                  </span>
                )}
              </div>

              {chartStatus === "error" ? (
                <div className="h-[280px] md:h-[340px] flex flex-col items-center justify-center text-center gap-2 border border-dashed border-brick/40 rounded-xl">
                  <p className="text-brick text-sm font-medium">{chartError}</p>
                  <p className="text-mist-faint text-xs font-mono">
                    Start the backend: uvicorn main:app --reload --port 8000
                  </p>
                </div>
              ) : (
                <WealthChart data={result?.chart_data} />
              )}
            </div>
          </section>

          {/* Market Explorer */}
          <section className="motion-safe:animate-fade-up [animation-delay:110ms]">
            <MarketExplorer
              riskAppetite={form.riskAppetite}
              years={form.years}
              monthlyContribution={form.monthlyContribution}
            />
          </section>

          {/* AI Analyst */}
          <section className="motion-safe:animate-fade-up [animation-delay:140ms]">
            <AIAnalyst
              status={aiStatus}
              text={aiText}
              error={aiError}
              onGenerate={handleGenerateAnalysis}
              disabled={!result || chartStatus === "error"}
            />
          </section>

          <footer className="text-center text-xs text-mist-faint font-mono pt-4 pb-8">
            InvestMate — figures are illustrative projections, not guarantees.
          </footer>
        </main>
      </div>
    </div>
  );
}
