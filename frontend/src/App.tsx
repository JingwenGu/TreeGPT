import { useState } from "react";
import "./App.css";

export default function App() {
  const [input, setInput] = useState("");
  const [reply, setReply] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function sendMessage() {
    if (!input.trim()) return;

    setLoading(true);
    setError("");
    setReply("");

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: input,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Request failed");
      }

      setReply(data.reply);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ padding: 24, maxWidth: 700, margin: "0 auto" }}>
      <h1>GPT Wrapper</h1>

      <textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        rows={6}
        style={{ width: "100%", marginBottom: 12 }}
        placeholder="Type your message here..."
      />

      <button onClick={sendMessage} disabled={loading}>
        {loading ? "Sending..." : "Send"}
      </button>

      {error && (
        <div style={{ marginTop: 16, color: "red" }}>
          Error: {error}
        </div>
      )}

      {reply && (
        <div style={{ marginTop: 24 }}>
          <h2>Assistant</h2>
          <div style={{ whiteSpace: "pre-wrap" }}>{reply}</div>
        </div>
      )}
    </div>
  );
}