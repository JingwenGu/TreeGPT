import { useState } from "react";
import "./App.css";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

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
    <div style={{ padding: 24, maxWidth: 2000, margin: "0 auto", fontFamily: "sans-serif", }}>
      {/* <h1>GPT Wrapper</h1> */}

      <div style={{ 
        // border: "1px solid #ccc", 
        padding: 16, borderRadius: 8, marginBottom: 16, minHeight: 400, background: "#ffffff", 
      }}>
        {messages.length === 0 ? (<p style={{color: "#666", textAlign: "center"}}>You'd better start talking.</p>) : (
          messages.map((msg, idx) => (
            <div key={idx} style={{ display: "flex", width: "100%", justifyContent: msg.role === "user" ? "flex-end" : "flex-start", marginBottom: 12 }}>
            <div style={{
              maxWidth: "100%",
              width: msg.role === "assistant" ? "100%" : "auto",
              padding: "10px 14px",
              borderRadius: 12,
              background: msg.role === "user" ? "#e5e7eb" : "#fafafa",
              // whiteSpace: "pre-wrap",
              boxSizing: "border-box",
            }}>
              <div style={{ marginTop: 4 }}>
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.content}</ReactMarkdown>
              </div>
            </div>
          </div>
          ))
        )}
        {loading && (<div style={{ color: "#666", marginTop: 8 }}>Putting on my thinking cap...</div>)}
      </div>

      <textarea
        className="chat-input"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        rows={6}
        style={{ width: "100%", marginBottom: 12 }}
        placeholder="Looks like someone forgot how to type."
      />

      {/* <button onClick={sendMessage} disabled={loading}>
        {loading ? "Sending..." : "Send"}
      </button> */}

      {error && (
        <div style={{ marginTop: 16, color: "red" }}>
          Error: {error}
        </div>
      )}
    </div>
  );
}