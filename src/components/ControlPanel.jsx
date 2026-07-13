import { currency } from "../lib/currency.js";

const RISK_OPTIONS = [
  { value: "conservative", label: "Low" },
  { value: "moderate", label: "Medium" },
  { value: "aggressive", label: "High" },
];

function Field({ label, value, displayValue, onChange, min, max, step, eyebrow }) {
  const percent = ((value - min) / (max - min)) * 100;

  return (
    <div className="py-5 first:pt-0 last:pb-0">
      <div className="flex items-baseline justify-between mb-3">
        <div>
          <p className="text-[11px] uppercase tracking-[0.14em] text-mist-faint font-body font-medium">
            {eyebrow}
          </p>
          <p className="text-sm text-mist-soft font-body">{label}</p>
        </div>
        <p className="font-mono text-lg text-gold-light font-medium tabular-nums">
          {displayValue}
        </p>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        style={{ "--range-progress": `${percent}%` }}
        aria-label={label}
      />
      <div className="flex justify-between mt-1.5 text-[11px] font-mono text-mist-faint">
        <span>{typeof min === "number" && min >= 1000 ? currency.format(min) : min}</span>
        <span>{typeof max === "number" && max >= 1000 ? currency.format(max) : max}</span>
      </div>
    </div>
  );
}

export default function ControlPanel({ form, onChange }) {
  return (
    <div className="glass-card p-6 md:p-7 motion-safe:animate-fade-up">
      <div className="flex items-center justify-between mb-1">
        <h2 className="font-display text-xl text-mist">Your Inputs</h2>
        <span className="text-[10px] font-mono uppercase tracking-widest text-mist-faint border border-mist/15 rounded-full px-2.5 py-1">
          Ledger 01
        </span>
      </div>
      <p className="text-sm text-mist-faint mb-2">
        Adjust the numbers — the projection updates automatically.
      </p>

      <div className="divide-y divide-mist/10">
        <Field
          eyebrow="Principal"
          label="Current savings"
          value={form.currentSavings}
          displayValue={currency.format(form.currentSavings)}
          onChange={(v) => onChange({ currentSavings: v })}
          min={0}
          max={5000000}
          step={5000}
        />
        <Field
          eyebrow="Recurring"
          label="Monthly contribution"
          value={form.monthlyContribution}
          displayValue={currency.format(form.monthlyContribution)}
          onChange={(v) => onChange({ monthlyContribution: v })}
          min={0}
          max={200000}
          step={500}
        />
        <Field
          eyebrow="Horizon"
          label="Investment period"
          value={form.years}
          displayValue={`${form.years} yr${form.years === 1 ? "" : "s"}`}
          onChange={(v) => onChange({ years: v })}
          min={1}
          max={50}
          step={1}
        />

        <div className="py-5 last:pb-0">
          <p className="text-[11px] uppercase tracking-[0.14em] text-mist-faint font-body font-medium mb-3">
            Appetite
          </p>
          <div className="grid grid-cols-3 gap-2">
            {RISK_OPTIONS.map((opt) => {
              const active = form.riskAppetite === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => onChange({ riskAppetite: opt.value })}
                  className={`rounded-lg py-2.5 text-sm font-body font-medium border transition-all duration-200 ${
                    active
                      ? "bg-gradient-to-br from-emerald-bright to-emerald-dark text-mist border-emerald-bright shadow-glow-emerald"
                      : "bg-mist/[0.03] text-mist-soft border-mist/15 hover:border-emerald-bright/50 hover:bg-mist/[0.06]"
                  }`}
                  aria-pressed={active}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
          <p className="text-xs text-mist-faint mt-2.5">Risk appetite — shapes the assumed annual return.</p>
        </div>
      </div>
    </div>
  );
}