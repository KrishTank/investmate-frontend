// Base URL of the FastAPI backend.
//
// In production, VITE_API_URL is baked in at BUILD time (Vite env vars are
// compile-time, not runtime — see the Dockerfile changes for how this gets
// passed in during `docker build`).
//
// Locally (npm run dev), Vite automatically reads a `.env` file in the
// frontend project root if one exists. If VITE_API_URL isn't set anywhere,
// this falls back to localhost:8000 so local dev keeps working unchanged.
export const API_BASE = import.meta.env.VITE_API_URL || "https://typeinvestmatebackend-8c90x2ja.b4a.run";
/**
 * Calls POST /api/portfolio/simulate and returns the parsed PortfolioResult.
 * Throws an Error with a human-readable message on failure.
 */
export async function simulatePortfolio(input, signal) {
  let response;
  try {
    response = await fetch(`${API_BASE}/api/portfolio/simulate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
      signal,
    });
  } catch (err) {
    if (err.name === "AbortError") throw err;
    throw new Error(
      `Could not reach the Investmate backend at ${API_BASE}. Is it running?`
    );
  }

  if (!response.ok) {
    let detail = `Request failed with status ${response.status}`;
    try {
      const body = await response.json();
      detail = body.detail || detail;
    } catch {
      /* response wasn't JSON — keep default detail */
    }
    throw new Error(detail);
  }

  return response.json();
}

/**
 * Calls GET /api/market/data and returns real market data (mutual funds,
 * stocks, gold, IPOs, real estate).
 */
export async function fetchMarketData(signal) {
  let response;
  try {
    response = await fetch(`${API_BASE}/api/market/data`, { signal });
  } catch (err) {
    if (err.name === "AbortError") throw err;
    throw new Error(
      `Could not reach the Investmate backend at ${API_BASE}. Is it running?`
    );
  }

  if (!response.ok) {
    let detail = `Request failed with status ${response.status}`;
    try {
      const body = await response.json();
      detail = body.detail || detail;
    } catch {
      /* not JSON */
    }
    throw new Error(detail);
  }

  return response.json();
}

/**
 * Opens a streaming connection to POST /api/market/recommend — same SSE
 * shape as streamAiAnalysis, but the "done" event also carries the raw
 * market_data payload that was fed to the model.
 *
 * callbacks: { onChunk(text), onDone(meta), onError(message) }
 */
export function streamMarketRecommendation(payload, callbacks) {
  const controller = new AbortController();

  (async () => {
    let response;
    try {
      response = await fetch(`${API_BASE}/api/market/recommend`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });
    } catch (err) {
      if (err.name === "AbortError") return;
      callbacks.onError?.(
        `Could not reach the Investmate backend at ${API_BASE}. Is it running?`
      );
      return;
    }

    if (!response.ok || !response.body) {
      callbacks.onError?.(`Market recommendation request failed (status ${response.status}).`);
      return;
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

    try {
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const events = buffer.split("\n\n");
        buffer = events.pop() ?? "";

        for (const rawEvent of events) {
          const line = rawEvent.trim();
          if (!line.startsWith("data:")) continue;

          const jsonStr = line.slice(5).trim();
          if (!jsonStr) continue;

          let parsed;
          try {
            parsed = JSON.parse(jsonStr);
          } catch {
            continue;
          }

          if (parsed.type === "chunk") {
            callbacks.onChunk?.(parsed.content ?? "");
          } else if (parsed.type === "error") {
            callbacks.onError?.(parsed.message ?? "The AI service returned an error.");
          } else if (parsed.type === "done") {
            callbacks.onDone?.(parsed);
          }
        }
      }
    } catch (err) {
      if (err.name !== "AbortError") {
        callbacks.onError?.("The connection to the AI service was interrupted.");
      }
    } finally {
      callbacks.onDone?.();
    }
  })();

  return () => controller.abort();
}

/**
 * Opens a streaming connection to POST /api/chat/stream and invokes callbacks
 * as Server-Sent Events arrive. Returns a function that aborts the stream.
 *
 * callbacks: { onChunk(text), onDone(meta), onError(message) }
 */
export function streamAiAnalysis(payload, callbacks) {
  const controller = new AbortController();

  (async () => {
    let response;
    try {
      response = await fetch(`${API_BASE}/api/chat/stream`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });
    } catch (err) {
      if (err.name === "AbortError") return;
      callbacks.onError?.(
        `Could not reach the Investmate backend at ${API_BASE}. Is it running?`
      );
      return;
    }

    if (!response.ok || !response.body) {
      callbacks.onError?.(`AI analysis request failed (status ${response.status}).`);
      return;
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

    try {
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        // SSE events are separated by a blank line ("\n\n")
        const events = buffer.split("\n\n");
        buffer = events.pop() ?? ""; // last item may be incomplete — keep it buffered

        for (const rawEvent of events) {
          const line = rawEvent.trim();
          if (!line.startsWith("data:")) continue;

          const jsonStr = line.slice(5).trim();
          if (!jsonStr) continue;

          let parsed;
          try {
            parsed = JSON.parse(jsonStr);
          } catch {
            continue; // skip malformed chunk rather than crashing the stream
          }

          if (parsed.type === "chunk") {
            callbacks.onChunk?.(parsed.content ?? "");
          } else if (parsed.type === "error") {
            callbacks.onError?.(parsed.message ?? "The AI service returned an error.");
          } else if (parsed.type === "done") {
            callbacks.onDone?.(parsed);
          }
        }
      }
    } catch (err) {
      if (err.name !== "AbortError") {
        callbacks.onError?.("The connection to the AI service was interrupted.");
      }
    } finally {
      callbacks.onDone?.();
    }
  })();

  return () => controller.abort();
}
