import { useEffect, useState } from "react";
import "./App.css";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";

import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";

import "katex/dist/katex.min.css";

type Message = {
  role: "user" | "assistant";
  content: string;
};

const STORAGE_KEY = "chat_messages";

export default function App() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return [];
    try {
      return JSON.parse(saved);
    } catch {
      console.error("Failed to parse chat messages from localStorage");
      return [];
    }
  }
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
  });

  async function sendMessage() {
    const trimmed = input.trim();
    if (!trimmed) return;

    const userMessage: Message = {
      role: "user",
      content: trimmed,
    }

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
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
          messages: updatedMessages,
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
    <div style={{ padding: 24, paddingBottom: 220, maxWidth: 2000, margin: "0 auto", fontFamily: "sans-serif", }}>
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
                <ReactMarkdown 
                remarkPlugins={[remarkGfm, remarkMath]}
                rehypePlugins={[rehypeKatex]}
                components={{
                  code({ children, className }) {
                    const match = /language-(\w+)/.exec(className || "");
                    const codeString = String(children).replace(/\n$/, "");

                    if (match) {
                      return (
                        <SyntaxHighlighter Pretag="div" language={match[1]} style={oneDark}>
                          {codeString}
                        </SyntaxHighlighter>
                      )
                    }
                    return <code className={className}>{children}</code>;
                  }
                }}>{msg.content}</ReactMarkdown>
              </div>
            </div>
          </div>
          ))
        )}
        {loading && (<div style={{ color: "#666", marginTop: 8 }}>Putting on my thinking cap...</div>)}
      </div>

      <div
        style={{
          position: "fixed",
          left: "50%",
          bottom: 0,
          transform: "translateX(-50%)",
          width: "70%",
          background: "#ffffff",
          paddingTop: 8,
        }}
      >
        <textarea
          className="chat-input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          rows={6}
          style={{ width: "100%", marginBottom: 12 }}
          placeholder="Looks like someone forgot how to type."
        />
      </div>

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