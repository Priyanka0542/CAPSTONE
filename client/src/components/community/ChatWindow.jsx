import { useState, useEffect, useRef } from 'react';
import { FiFlag, FiSend } from 'react-icons/fi';
import api from '../../api/axios';

export default function ChatWindow({ goalSlug, currentUserId }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [rateLimit, setRateLimit] = useState(null);
  const [lastMessageTime, setLastMessageTime] = useState(null);
  const messagesEndRef = useRef(null);
  const pollingRef = useRef(null);

  // Initial load and polling
  useEffect(() => {
    if (!goalSlug) return;

    const fetchMessages = async () => {
      try {
        const since = lastMessageTime ? lastMessageTime.toISOString() : undefined;
        const url = since 
          ? `/community/${goalSlug}/messages?since=${since}`
          : `/community/${goalSlug}/messages`;
        
        const { data } = await api.get(url);
        
        if (since && data.messages.length > 0) {
          // Append new messages
          setMessages(prev => [...prev, ...data.messages]);
          // Update last message time
          const latestTime = new Date(data.messages[data.messages.length - 1].createdAt);
          setLastMessageTime(latestTime);
        } else if (!since) {
          // Initial load
          setMessages(data.messages);
          if (data.messages.length > 0) {
            setLastMessageTime(new Date(data.messages[data.messages.length - 1].createdAt));
          }
        }
      } catch (err) {
        console.error('Failed to fetch messages:', err);
      }
    };

    // Initial load
    fetchMessages();

    // Poll every 5 seconds
    pollingRef.current = setInterval(fetchMessages, 5000);

    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
      }
    };
  }, [goalSlug]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    const trimmed = input.trim();
    if (!trimmed || loading || rateLimit) return;

    setInput('');
    setError('');
    setLoading(true);

    try {
      const { data } = await api.post(`/community/${goalSlug}/messages`, {
        message: trimmed,
      });

      setMessages(prev => [...prev, data.message]);
      setLastMessageTime(new Date(data.message.createdAt));
    } catch (err) {
      if (err.response?.status === 429) {
        setRateLimit(err.response.data.retryAfter || 3);
        // Countdown
        const countdown = setInterval(() => {
          setRateLimit(prev => {
            if (prev <= 1) {
              clearInterval(countdown);
              return null;
            }
            return prev - 1;
          });
        }, 1000);
      } else {
        setError(err.response?.data?.message || 'Failed to send message');
      }
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

  const reportMessage = async (messageId) => {
    try {
      await api.post(`/community/${goalSlug}/messages/${messageId}/report`);
      alert('Message reported for moderation.');
    } catch (err) {
      alert('Failed to report message.');
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-3 p-4" style={{ background: 'var(--void-black)' }}>
        {messages.length === 0 && (
          <div className="text-center py-8 text-dust-gray text-sm">
            No messages yet. Start the conversation!
          </div>
        )}
        {messages.map((msg) => (
          <div
            key={msg._id}
            className={`flex gap-2 ${msg.userId === currentUserId ? 'flex-row-reverse' : ''}`}
          >
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-starlight flex-shrink-0"
              style={{ 
                background: msg.userId === currentUserId 
                  ? 'linear-gradient(135deg, var(--comet-violet), var(--aurora-teal))'
                  : 'var(--card-bg)',
                border: msg.userId !== currentUserId ? '1px solid var(--card-border)' : 'none'
              }}
            >
              {msg.displayName.charAt(0).toUpperCase()}
            </div>
            <div className={`max-w-[70%] ${msg.userId === currentUserId ? 'text-right' : ''}`}>
              <div className="text-xs text-dust-gray mb-1">{msg.displayName}</div>
            <div
              className={`p-3 rounded-lg text-sm ${
                msg.userId === currentUserId
                  ? 'bg-comet-violet/20 text-starlight'
                  : 'bg-card-bg text-starlight'
              }`}
              style={msg.userId !== currentUserId ? { background: 'var(--card-bg)', border: '1px solid var(--card-border)' } : {}}
            >
              {msg.message}
            </div>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs text-dust-gray">
                {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
              {msg.userId !== currentUserId && (
                <button
                  onClick={() => reportMessage(msg._id)}
                  className="text-xs text-dust-gray hover:text-meteor-red transition-colors"
                  title="Report message"
                >
                  <FiFlag size={12} />
                </button>
              )}
            </div>
          </div>
        </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Error */}
      {error && (
        <div className="px-4 py-2 text-xs text-meteor-red">{error}</div>
      )}

      {/* Input */}
      <div className="p-4 border-t" style={{ borderColor: 'var(--card-border)' }}>
        <div className="flex gap-2">
          <textarea
            className="input-field flex-1 resize-none"
            placeholder="Type a message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={1}
            disabled={loading || !!rateLimit}
          />
          <button
            className="btn-primary px-4"
            onClick={sendMessage}
            disabled={loading || !input.trim() || !!rateLimit}
          >
            {rateLimit ? (
              <span className="text-xs">{rateLimit}s</span>
            ) : loading ? (
              <div className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} />
            ) : (
              <FiSend size={16} />
            )}
          </button>
        </div>
        {rateLimit && (
          <div className="text-xs text-dust-gray mt-1">Wait a moment before sending again...</div>
        )}
      </div>
    </div>
  );
}
