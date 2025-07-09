import React, { useState } from 'react';
import { X, Star } from 'lucide-react';
import { Badge } from "@/components/ui/badge";

interface ChatModalProps {
  open: boolean;
  onClose: () => void;
  card: {
    id: string;
    name: string;
    image?: string;
    joining_fee?: string;
    joining_fee_text?: string;
    annual_fee?: string;
    key_features?: string[];
    rating?: number;
    user_rating_count?: number;
    tags?: any[];
    [key: string]: any;
  };
}

export const ChatModal: React.FC<ChatModalProps> = ({ open, onClose, card }) => {
  const [messages, setMessages] = useState([
    { sender: 'system', text: `Ask anything about "${card.name}". Here are some details:\nJoining Fee: ${card.joining_fee_text || card.joining_fee || 'N/A'}\nKey Features: ${(card.key_features || []).join(', ')}` }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  if (!open) return null;

  // Helper for category/tag
  const getCategory = () => {
    if (Array.isArray(card.tags) && card.tags.length > 0) {
      const tag = card.tags[0];
      return typeof tag === 'string' ? tag : (tag?.name || tag?.header || '');
    }
    return '';
  };

  const handleSend = async () => {
    if (!input.trim()) return;
    setMessages([...messages, { sender: 'user', text: input }]);
    setInput('');
    setLoading(true);
    try {
      const res = await fetch('http://localhost:54321/functions/v1/ask-ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cardId: card.id, question: input })
      });
      const data = await res.json();
      setMessages(msgs => [...msgs, { sender: 'ai', text: data.answer }]);
    } catch (e) {
      setMessages(msgs => [...msgs, { sender: 'ai', text: 'Sorry, there was an error.' }]);
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg relative flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <div className="font-semibold text-lg">Ask AI about {card.name}</div>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded">
            <X className="w-5 h-5" />
          </button>
        </div>
        {/* Card summary */}
        <div className="flex items-center gap-4 px-6 py-4">
          <div className="w-16 h-12 bg-gradient-to-br from-primary/80 to-primary/40 rounded-lg flex items-center justify-center">
            {card.image ? (
              <img src={card.image} alt={card.name} className="w-full h-full object-cover rounded-lg" />
            ) : (
              <span className="text-white font-bold text-lg">{card.name?.[0]}</span>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-semibold text-base truncate">{card.name}</div>
            <div className="flex items-center gap-2 mt-1">
              {getCategory() && <Badge className="text-xs bg-primary/10 text-primary">{getCategory()}</Badge>}
              <span className="text-xs text-muted-foreground">Joining Fee: <span className="font-medium text-foreground">{card.joining_fee_text || card.joining_fee || 'N/A'}</span></span>
            </div>
            <div className="flex items-center gap-2 mt-1">
              <Star className="h-4 w-4 fill-accent text-accent mr-1" />
              <span className="text-xs font-medium">{card.rating ?? 'N/A'}</span>
              {card.user_rating_count > 0 && (
                <span className="text-xs text-muted-foreground">({card.user_rating_count} ratings)</span>
              )}
            </div>
          </div>
        </div>
        <div className="border-t" />
        {/* Chat area */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-2 bg-gray-50">
          {messages.map((msg, idx) => (
            <div key={idx} className={`text-sm ${msg.sender === 'user' ? 'text-right' : 'text-left'} ${msg.sender === 'ai' ? 'text-blue-700' : ''}`}>
              <span className={`block rounded px-3 py-2 inline-block max-w-[90%] ${msg.sender === 'user' ? 'bg-primary/10 text-primary' : msg.sender === 'ai' ? 'bg-blue-100' : 'bg-gray-100'}`}>{msg.text}</span>
            </div>
          ))}
          {loading && (
            <div className="text-sm text-blue-700 text-left">
              <span className="block bg-blue-100 rounded px-3 py-2 inline-block max-w-[90%]">AI is typing...</span>
            </div>
          )}
        </div>
        <div className="border-t" />
        {/* Input area */}
        <div className="flex items-center px-6 py-3 bg-white rounded-b-xl gap-2">
          <input
            className="flex-1 border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 bg-gray-50"
            placeholder="Type your question..."
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && !loading) handleSend(); }}
            autoFocus
            disabled={loading}
          />
          <button
            className="bg-primary text-white px-4 py-2 rounded font-medium disabled:opacity-50 transition"
            onClick={handleSend}
            disabled={!input.trim() || loading}
          >Send</button>
        </div>
      </div>
    </div>
  );
}; 