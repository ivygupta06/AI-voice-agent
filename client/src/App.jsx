import { useEffect, useRef, useState } from "react";

export default function App() {
  const [messages, setMessages] = useState([]);
  const [isListening, setIsListening] = useState(false);

  const recognitionRef = useRef(null);
  const sessionRef = useRef({});

  /* ---------- INIT SPEECH ---------- */
  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Speech recognition not supported. Use Chrome.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.continuous = false;

    recognition.onresult = (e) => {
      const text = e.results[0][0].transcript.trim();
      handleUserMessage(text);
    };

    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);

    recognitionRef.current = recognition;
  }, []);

  /* ---------- SPEAK AGENT ---------- */
  useEffect(() => {
    const last = messages[messages.length - 1];
    if (last?.role === "agent") {
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(
        new SpeechSynthesisUtterance(last.text)
      );
    }
  }, [messages]);

  /* ---------- SEND TO BACKEND ---------- */
  const handleUserMessage = async (text) => {
  if (!text) return;

  setMessages((prev) => [...prev, { role: "user", text }]);

  try {
    const res = await fetch("http://localhost:5000/api/agent", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: text,
        session: sessionRef.current, // SEND MEMORY
      }),
    });

    const data = await res.json();

    // ✅ SAVE MEMORY FOR NEXT TURN
    sessionRef.current = data.session || sessionRef.current;

    setMessages((prev) => [
      ...prev,
      { role: "agent", text: data.reply },
    ]);
  } catch (err) {
    console.error(err);
    setMessages((prev) => [
      ...prev,
      { role: "agent", text: "Sorry, something went wrong." },
    ]);
  }
};


  /* ---------- START LISTEN ---------- */
  const startListening = () => {
    window.speechSynthesis.cancel();
    recognitionRef.current.start();
    setIsListening(true);
  };

  /* ---------- UI ---------- */
  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h1 style={styles.title}>Restaurant Booking Voice Agent</h1>

        <button
          onClick={startListening}
          style={{
            ...styles.button,
            backgroundColor: isListening ? "#ef4444" : "#10b981",
          }}
        >
          {isListening ? "Listening..." : "Start Talking"}
        </button>

        <div style={styles.chat}>
          {messages.map((m, i) => (
            <div
              key={i}
              style={{
                ...styles.message,
                alignSelf:
                  m.role === "user" ? "flex-end" : "flex-start",
                background:
                  m.role === "user" ? "#f3f4f6" : "#e0f2fe",
              }}
            >
              <strong>{m.role === "user" ? "You" : "Agent"}</strong>
              <p style={{ marginTop: 6 }}>{m.text}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ---------- STYLES ---------- */

const styles = {
  page: {
    height: "100vh",
    width: "100vw",
    background: "linear-gradient(135deg, #000000, #1f2937)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  card: {
    width: "90%",
    maxWidth: "800px",
    height: "90vh",
    background: "white",
    borderRadius: 20,
    padding: 24,
    display: "flex",
    flexDirection: "column",
  },
  title: {
    textAlign: "center",
    fontSize: 36,
    marginBottom: 20,
    color: "#1f2937",
  },
  button: {
    alignSelf: "center",
    padding: "14px 28px",
    borderRadius: 999,
    border: "none",
    color: "white",
    fontSize: 18,
    fontWeight: 600,
    cursor: "pointer",
    marginBottom: 20,
  },
  chat: {
    flex: 1,
    overflowY: "auto",
    display: "flex",
    flexDirection: "column",
    gap: 12,
    padding: 12,
  },
  message: {
    maxWidth: "70%",
    padding: 14,
    borderRadius: 14,
    fontSize: 16,
    color: "#111827",
  },
};
