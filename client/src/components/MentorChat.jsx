import { useState, useRef, useEffect } from 'react';
import Modal from './common/Modal';
import api from '../api/axios';

export default function MentorChat({ pathId, goalTitle, isOpen, onClose }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([
        {
          role: 'assistant',
          content: `Hey! I'm your "Future Self" — the version of you who already achieved the goal "${goalTitle}". Ask me anything about the journey ahead, what to focus on, or how to stay on track. I'm here to help based on your actual roadmap and progress.\n\n⚠️ This is an AI simulation for planning purposes, not a real prediction.`,
        },
      ]);
    }
  }, [isOpen, goalTitle, messages.length]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const sendMessage = async () => {
    const trimmed = input.trim();
    if (!trimmed || loading) return;

    setInput('');
    setError('');

    const userMsg = { role: 'user', content: trimmed };
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setLoading(true);

    try {
      // Send only user/assistant messages (skip the initial greeting for context)
      const conversationHistory = updatedMessages
        .filter((m, i) => i > 0) // skip the initial greeting
        .map((m) => ({ role: m.role, content: m.content }));

      const { data } = await api.post(`/paths/${pathId}/mentor-chat`, {
        userMessage: trimmed,
        conversationHistory: conversationHistory.slice(0, -1), // exclude the current message (sent separately)
      });

      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: data.message },
      ]);
    } catch (err) {
      const errMsg =
        err.response?.data?.message || 'Failed to get mentor response. Please try again.';
      setError(errMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="🤖 Talk to your Future Self">
      <div className="mentor-chat-container">
        <div className="mentor-chat-messages">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`mentor-chat-bubble ${
                msg.role === 'user' ? 'mentor-chat-user' : 'mentor-chat-assistant'
              }`}
            >
              {msg.role === 'assistant' && (
                <span className="mentor-chat-avatar">🤖</span>
              )}
              <div className="mentor-chat-text">
                {msg.content.split('\n').map((line, j) => (
                  <span key={j}>
                    {line}
                    {j < msg.content.split('\n').length - 1 && <br />}
                  </span>
                ))}
              </div>
            </div>
          ))}

          {loading && (
            <div className="mentor-chat-bubble mentor-chat-assistant">
              <span className="mentor-chat-avatar">🤖</span>
              <div className="mentor-chat-text">
                <span className="mentor-chat-typing">
                  <span className="mentor-dot"></span>
                  <span className="mentor-dot"></span>
                  <span className="mentor-dot"></span>
                </span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {error && (
          <div
            className="text-xs font-medium px-3 py-2 rounded-lg mb-2"
            style={{
              background: 'rgba(255, 92, 122, 0.1)',
              border: '1px solid rgba(255, 92, 122, 0.2)',
              color: 'var(--danger)',
            }}
          >
            {error}
          </div>
        )}

        <div className="mentor-chat-input-row">
          <textarea
            ref={inputRef}
            className="mentor-chat-input"
            placeholder="Ask your future self anything..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={1}
            disabled={loading}
          />
          <button
            className="btn-primary mentor-chat-send"
            onClick={sendMessage}
            disabled={loading || !input.trim()}
            aria-label="Send message"
          >
            {loading ? (
              <span className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} />
            ) : (
              '→'
            )}
          </button>
        </div>

        <p className="mentor-chat-disclaimer">
          ⚠ AI simulation for planning purposes — not a real future prediction.
        </p>
      </div>
    </Modal>
  );
}
