import { useState, useEffect, useRef } from "react";
import { useAuth } from "./AuthContext";
import styles from "./ChatAssistant.module.css";

export default function ChatAssistant() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Array<{ role: string; text: string }>>([]);
  const [loading, setLoading] = useState(false);
  const chatBodyRef = useRef<HTMLDivElement>(null);

  // Always fetch conversation history from backend when chat is opened
  useEffect(() => {
    if (open) {
      setLoading(true);
      fetch("/api/agent/conversation", {
        method: "GET",
        credentials: "include"
      })
        .then(res => res.json())
        .then(data => {
          // If backend returns messages as { sender, content }
          if (Array.isArray(data.history) && data.history.length > 0) {
            setMessages(data.history.map((msg: any) => ({ role: msg.role || msg.sender, text: msg.content })));
          } else if (Array.isArray(data.messages) && data.messages.length > 0) {
            setMessages(data.messages.map((msg: any) => ({ role: msg.role || msg.sender, text: msg.content })));
          } else {
            setMessages([{ role: "assistant", text: "How can I help you today?" }]);
          }
        })
        .catch(() => {
          setMessages([{ role: "assistant", text: "How can I help you today?" }]);
        })
        .finally(() => setLoading(false));
    }
  }, [open]);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (chatBodyRef.current) {
      chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!user) return;
    if (!input.trim()) return;
    const userMsg = { role: "user", text: input };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setLoading(true);
    try {
      const res = await fetch("/api/agent/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ message: input })
      });
      const data = await res.json();
      if (data && data.response) {
        // If session ended, reset messages to thank you only
        if (data.action?.intent?.action === "end_session") {
          setMessages([{ role: "assistant", text: data.response }]);
        } else {
          setMessages(prev => [...prev, { role: "assistant", text: data.response }]);
        }
      } else {
        setMessages(prev => [...prev, { role: "assistant", text: "Sorry, I didn't get a response." }]);
      }
    } catch {
      setMessages(prev => [...prev, { role: "assistant", text: "Error connecting to assistant." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating chat button */}
      <button
        className={styles.chatButton}
        onClick={() => setOpen(true)}
        aria-label="Open AI Assistant Chat"
      >
        <span style={{ fontSize: 32 }}>💬</span>
      </button>
      {/* Chat modal/drawer */}
      {open && (
        <div className={styles.chatModal}>
          <div className={styles.chatHeader}>
            <span>Fresh Food AI Agent</span>
            <button className={styles.closeButton} onClick={() => setOpen(false)} aria-label="Close Chat">×</button>
          </div>
          <div className={styles.chatBody} ref={chatBodyRef}>
            {loading && <div style={{ textAlign: "center", color: "#ff9800" }}>Loading...</div>}
            <div>
              {messages.map((msg, i) => (
                <div key={i} style={{
                  marginBottom: "0.75rem",
                  textAlign: msg.role === "user" ? "right" : "left"
                }}>
                  <span style={{
                    background: msg.role === "user" ? "#e0f7fa" : "#f5f5f5",
                    color: "#222",
                    borderRadius: "16px",
                    padding: "0.75rem 1.25rem",
                    display: "inline-block",
                    maxWidth: "80%",
                    fontSize: "1.05rem",
                    boxShadow: "0 1px 4px rgba(0,0,0,0.07)",
                    border: "1px solid #e0e0e0"
                  }}>{msg.text}</span>
                </div>
              ))}
            </div>
            {!user && (
              <div style={{ textAlign: "center", color: "#ff9800", marginTop: "1rem" }}>
                Please log in to use the chat assistant.
              </div>
            )}
          </div>
          <form className={styles.chatInputRow} onSubmit={e => { e.preventDefault(); handleSend(); }}>
            <input
              className={styles.chatInput}
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Type your message..."
              autoFocus
              disabled={loading || !user}
            />
            <button className={styles.sendButton} type="submit" disabled={loading || !user}>Send</button>
          </form>
        </div>
      )}
    </>
  );
}
