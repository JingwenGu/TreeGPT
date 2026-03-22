import { useState } from "react";
import "./App.css";

type Message = {
  role: "user" | "assistant";
  content: string;
};

export default function App() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function sendMessage() {
    const trimmed = input.trim();
    if (!trimmed) return;

    const userMessage: Message = {
      role: "user",
      content: trimmed,
    }

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: trimmed,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Request failed");
      }

      const assistantMessage: Message = {
        role: "assistant",
        content: data.reply,
      }
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  return (
    <div style={{ padding: 24, maxWidth: 800, margin: "0 auto", fontFamily: "sans-serif", }}>
      <h1>GPT Wrapper</h1>

      <div style={{ border: "1px solid #ccc", padding: 16, borderRadius: 8, marginBottom: 16, minHeight: 400, background: "#fafafa", }}>
        {messages.length === 0 ? (<p style={{color: "#666"}}>No messages yet. Start a conversation!</p>) : (
          messages.map((msg, idx) => (
            <div key={idx} style={{ display: "flex", justifyContent: msg.role === "user" ? "flex-end" : "flex-start", marginBottom: 12 }}>
            <div style={{maxWidth: "70%", padding: "10px 14px", borderRadius: 12, background: msg.role === "user" ? "#dbeafe" : "#e5e7eb", whiteSpace: "pre-wrap", }}>
              <strong>{msg.role === "user" ? "You" : "Assistant"}</strong>
              <div style={{marginTop: 4}}>{msg.content}</div>
            </div>
          </div>
          ))
        )}
        {loading && (<div style={{ color: "#666", marginTop: 8 }}>Thinking...</div>)}
      </div>

      <textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
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
    </div>
  );
}