const RISK_LABELS = {
  conservative: "Low risk",
  moderate: "Medium risk",
  aggressive: "High risk",
};

export default function ReturnSeal({ annualReturn, riskAppetite }) {
  if (annualReturn == null) return null;

  return (
    <div
      key={`${riskAppetite}-${annualReturn}`}
      className="motion-safe:animate-seal-in shrink-0 -rotate-6 select-none group"
      title="Assumed annual return, derived from risk appetite"
    >
      <div className="relative w-24 h-24 rounded-full bg-gradient-to-br from-gold-light/25 to-gold-dark/25 border-2 border-dashed border-gold flex flex-col items-center justify-center shadow-glow-gold transition-transform duration-300 group-hover:scale-105 group-hover:rotate-3">
        <div className="absolute inset-2 rounded-full border border-gold/50" />
        <span className="font-display text-2xl bg-gradient-to-b from-gold-bright to-gold-dark bg-clip-text text-transparent leading-none">
          {annualReturn}%
        </span>
        <span className="font-mono text-[9px] uppercase tracking-wider text-gold-light/90 mt-1">
          {RISK_LABELS[riskAppetite] ?? "assumed"}
        </span>
      </div>
    </div>
  );
}