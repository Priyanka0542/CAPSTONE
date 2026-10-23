import { useState, useEffect, useRef } from 'react';
import { FiFlag, FiSend } from 'react-icons/fi';
import api from '../../api/axios';

export default function ChatWindow({ goalSlug, goalTitle, currentUserId }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState('');
  const [rateLimit, setRateLimit] = useState(null);
  const messagesEndRef = useRef(null);
  const pollingRef = useRef(null);
  const lastMessageTimeRef = useRef(null);

  // Initial load and polling
  useEffect(() => {
    if (!goalSlug) {
      setInitialLoading(false);
      return;
    }

    let isMounted = true;
    lastMessageTimeRef.current = null;
    setInitialLoading(true);
    setError('');

    const fetchInitialMessages = async () => {
      try {
        const { data } = await api.get(`/community/${goalSlug}/messages`);
        if (!isMounted) return;
        const msgList = data.messages || [];
        setMessages(msgList);
        if (msgList.length > 0) {
          lastMessageTimeRef.current = new Date(msgList[msgList.length - 1].createdAt);
        }
      } catch (err) {
        if (!isMounted) return;
        if (err.response?.status === 403) {
          setError(err.response?.data?.message || 'You must be pursuing this career path to view its group messages.');
        } else {
          console.error('Failed to fetch messages:', err);
        }
      } finally {
        if (isMounted) {
          setInitialLoading(false);
        }
      }
    };

    fetchInitialMessages();

    // Poll for new incoming messages every 3 seconds
    const pollNewMessages = async () => {
      if (!lastMessageTimeRef.current) {
        try {
          const { data } = await api.get(`/community/${goalSlug}/messages`);
          if (!isMounted) return;
          const msgList = data.messages || [];
          if (msgList.length > 0) {
            setMessages(msgList);
            lastMessageTimeRef.current = new Date(msgList[msgList.length - 1].createdAt);
          }
        } catch (err) {
          if (err.response?.status === 403 && pollingRef.current) {
            clearInterval(pollingRef.current);
          }
        }
        return;
      }

      try {
        const since = lastMessageTimeRef.current.toISOString();
        const { data } = await api.get(`/community/${goalSlug}/messages?since=${encodeURIComponent(since)}`);
        if (!isMounted) return;
        if (data.messages && data.messages.length > 0) {
          setMessages((prev) => {
            const existingIds = new Set(prev.map((m) => m._id));
            const newMsgs = data.messages.filter((m) => !existingIds.has(m._id));
            if (newMsgs.length === 0) return prev;
            return [...prev, ...newMsgs];
          });
          lastMessageTimeRef.current = new Date(data.messages[data.messages.length - 1].createdAt);
        }
      } catch (err) {
        if (err.response?.status === 403 && pollingRef.current) {
          clearInterval(pollingRef.current);
        }
      }
    };

    pollingRef.current = setInterval(pollNewMessages, 3000);

    return () => {
      isMounted = false;
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

      setMessages((prev) => {
        const exists = prev.some((m) => m._id === data.message._id);
        return exists ? prev : [...prev, data.message];
      });
      lastMessageTimeRef.current = new Date(data.message.createdAt);
    } catch (err) {
      if (err.response?.status === 429) {
        setRateLimit(err.response.data.retryAfter || 3);
        const countdown = setInterval(() => {
          setRateLimit((prev) => {
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
      <div className="flex-1 overflow-y-auto space-y-3.5 p-4" style={{ background: 'var(--void-black)' }}>
        {initialLoading && (
          <div className="flex justify-center items-center h-full py-12">
            <div className="spinner" style={{ width: 28, height: 28 }} />
          </div>
        )}

        {!initialLoading && messages.length === 0 && !error && (
          <div className="flex flex-col items-center justify-center h-full text-center py-12 px-4">
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center text-2xl mb-3"
              style={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)' }}
            >
              💬
            </div>
            <h3 className="text-sm font-semibold text-starlight mb-1">
              Welcome to the {goalTitle || 'Path'} Group Chat!
            </h3>
            <p className="text-xs text-dust-gray max-w-sm">
              This is a shared group conversation with everyone pursuing this path. Say hello and share how your preparation is going!
            </p>
          </div>
        )}

        {messages.map((msg) => {
          const isMe = Boolean(currentUserId && String(msg.userId) === String(currentUserId));
          const initial = (msg.displayName || '?').charAt(0).toUpperCase();

          return (
            <div
              key={msg._id}
              className={`flex gap-2.5 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}
            >
              {/* Avatar */}
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-starlight flex-shrink-0 shadow-sm"
                style={{
                  background: isMe
                    ? 'linear-gradient(135deg, var(--comet-violet), var(--aurora-teal))'
                    : 'var(--card-bg)',
                  border: isMe ? 'none' : '1px solid var(--card-border)',
                }}
                title={msg.displayName}
              >
                {initial}
              </div>

              {/* Message bubble container */}
              <div className={`max-w-[75%] sm:max-w-[70%] ${isMe ? 'text-right' : 'text-left'}`}>
                {/* Sender Name */}
                <div className="flex items-center gap-1.5 mb-1 px-1">
                  {isMe ? (
                    <span className="text-xs font-semibold text-comet-violet ml-auto">
                      You
                    </span>
                  ) : (
                    <span className="text-xs font-semibold text-aurora-teal">
                      {msg.displayName}
                    </span>
                  )}
                </div>

                {/* Message bubble */}
                <div
                  className={`p-3 rounded-2xl text-sm leading-relaxed ${
                    isMe
                      ? 'bg-comet-violet text-white rounded-tr-none shadow-md'
                      : 'text-starlight rounded-tl-none'
                  }`}
                  style={
                    !isMe
                      ? {
                          background: 'var(--card-bg)',
                          border: '1px solid var(--card-border)',
                        }
                      : {}
                  }
                >
                  {msg.message}
                </div>

                {/* Time & actions */}
                <div className={`flex items-center gap-2 mt-1 px-1 ${isMe ? 'justify-end' : 'justify-start'}`}>
                  <span className="text-[11px] text-dust-gray">
                    {new Date(msg.createdAt).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                  {!isMe && (
                    <button
                      onClick={() => reportMessage(msg._id)}
                      className="text-xs text-dust-gray hover:text-meteor-red transition-colors p-0.5"
                      title="Report message"
                    >
                      <FiFlag size={12} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Error */}
      {error && (
        <div className="px-4 py-2 text-xs bg-meteor-red/10 border-t border-b border-meteor-red/20 text-meteor-red font-medium">
          {error}
        </div>
      )}

      {/* Input */}
      <div className="p-4 border-t" style={{ borderColor: 'var(--card-border)' }}>
        <div className="flex gap-2">
          <textarea
            className="input-field flex-1 resize-none"
            placeholder={
              goalTitle
                ? `Message your fellow ${goalTitle} companions...`
                : 'Type a message to the group...'
            }
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={1}
            disabled={loading || !!rateLimit || !!error}
          />
          <button
            className="btn-primary px-4"
            onClick={sendMessage}
            disabled={loading || !input.trim() || !!rateLimit || !!error}
          >
            {rateLimit ? (
              <span className="text-xs font-semibold">{rateLimit}s</span>
            ) : loading ? (
              <div className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} />
            ) : (
              <FiSend size={16} />
            )}
          </button>
        </div>
        {rateLimit && (
          <div className="text-xs text-dust-gray mt-1">
            Please wait a moment before sending another message...
          </div>
        )}
      </div>
    </div>
  );
}

