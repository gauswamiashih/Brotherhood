import React, { useState, useEffect, useRef } from 'react';
import { AnimatePresence } from 'framer-motion';
import { Send, Sparkles, ArrowRight, Eye, RefreshCw } from 'lucide-react';
import { api } from '../services/api';
import { ProductQuickViewModal } from '../components/ProductQuickViewModal';

interface Message {
  role: 'user' | 'model';
  text: string;
  products?: any[];
}

export const AiStylist: React.FC = () => {
  
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'model',
      text: 'Greetings. I am your digital Couture Stylist. Tell me about the event, silhouettes, color schemes, or specific boutique craftsmanship you desire, and I will curate combinations matching Palanpurs exclusive inventories.',
    },
  ]);
  const [inputVal, setInputVal] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Quick View Product state
  const [quickViewProduct, setQuickViewProduct] = useState<any>(null);

  const scrollRef = useRef<HTMLDivElement>(null);

  // Suggestion options
  const suggestions = [
    { label: 'Traditional Wedding Wear', text: 'Recommend me an elegant traditional outfit for a Gujarati wedding ritual.' },
    { label: 'Modern Streetwear', text: 'Suggest some modern streetwear items with a luxury twist.' },
    { label: 'Minimalist Cocktail Fitting', text: 'I need a sleek, minimalist dress or suit fitting for a cocktail event.' },
    { label: 'Hand-Crafted Artistry', text: 'Show me some hand-embroidered or traditional zari work couture.' },
  ];

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim() || loading) return;

    const userMsg: Message = { role: 'user', text: textToSend };
    setMessages((prev) => [...prev, userMsg]);
    setInputVal('');
    setLoading(true);

    try {
      // Map message log to gemini history format: Array<{ role: 'user'|'model', text: string }>
      const historyPayload = messages.map((m) => ({
        role: m.role,
        text: m.text,
      }));

      const res = await api.post('/ai/stylist', {
        message: textToSend,
        history: historyPayload,
      });

      const assistantMsg: Message = {
        role: 'model',
        text: res.data.reply,
        products: res.data.products || [],
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err) {
      console.error('Failed to query stylist:', err);
      setMessages((prev) => [
        ...prev,
        {
          role: 'model',
          text: 'Apologies. My styling coordinates encountered an issue. Please check your network or try again shortly.',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSendMessage(inputVal);
  };

  const clearChat = () => {
    setMessages([
      {
        role: 'model',
        text: 'Greetings. I am your digital Couture Stylist. Tell me about the event, silhouettes, color schemes, or specific boutique craftsmanship you desire, and I will curate combinations matching Palanpurs exclusive inventories.',
      },
    ]);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 min-h-[85vh] flex flex-col">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4 shrink-0">
        <div>
          <div className="flex items-center space-x-2">
            <Sparkles className="w-5 h-5 text-luxury-gold animate-pulse" />
            <h1 className="text-2xl font-bold font-serif text-white tracking-wide uppercase">Couture AI Stylist</h1>
          </div>
          <p className="text-[11px] text-gray-500 mt-1 uppercase tracking-widest font-semibold">
            Custom wardrobe recommendations from Palanpurs elite boutiques
          </p>
        </div>

        <button
          onClick={clearChat}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-luxury-border border-opacity-35 text-[10px] uppercase font-bold text-gray-400 hover:text-white hover:border-luxury-gold transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Reset Salon
        </button>
      </div>

      <div className="flex-grow flex flex-col lg:flex-row gap-6 h-[65vh] min-h-[500px]">
        {/* Left Side: Chat Session Console */}
        <div className="flex-grow flex flex-col glass-panel rounded-2xl border border-luxury-border overflow-hidden bg-[#090214] bg-opacity-95">
          {/* Stylist Status Bar */}
          <div className="px-5 py-3 border-b border-luxury-border border-opacity-35 bg-luxury-purpleDeep bg-opacity-20 flex justify-between items-center shrink-0">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-full bg-luxury-purpleDeep border border-luxury-gold flex items-center justify-center text-luxury-gold font-bold">
                <Sparkles className="w-4 h-4 fill-luxury-gold text-luxury-gold" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white tracking-wide">Couture AI</h4>
                <span className="text-[8px] text-luxury-gold font-bold uppercase tracking-wider">Expert Stylist Agent</span>
              </div>
            </div>
            <div className="flex items-center space-x-1.5 text-[9px] text-gray-500 uppercase font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-ping"></span>
              <span>Active Consult</span>
            </div>
          </div>

          {/* Chat scroll logs container */}
          <div
            ref={scrollRef}
            className="flex-grow p-6 overflow-y-auto space-y-6 scrollbar-thin scrollbar-thumb-luxury-border"
          >
            {messages.map((msg, index) => {
              const isAI = msg.role === 'model';
              return (
                <div key={index} className={`flex ${isAI ? 'justify-start' : 'justify-end'} flex-col space-y-3`}>
                  <div className={`flex ${isAI ? 'justify-start' : 'justify-end'}`}>
                    <div
                      className={`max-w-[80%] px-4 py-3 rounded-2xl text-xs leading-relaxed ${
                        isAI
                          ? 'bg-luxury-purpleDeep text-gray-200 border border-luxury-border border-opacity-25 rounded-tl-none font-light'
                          : 'bg-luxury-gold text-black rounded-tr-none font-medium shadow-goldGlow'
                      }`}
                    >
                      <p>{msg.text}</p>
                    </div>
                  </div>

                  {/* Recommendation metadata carousel below text bubble */}
                  {isAI && msg.products && msg.products.length > 0 && (
                    <div className="pl-0 sm:pl-4 space-y-2 mt-1">
                      <div className="text-[9px] font-bold text-luxury-gold uppercase tracking-wider flex items-center gap-1">
                        <Sparkles className="w-3 h-3 fill-luxury-gold" /> Recommended Palanpur Inventory:
                      </div>
                      <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-luxury-border max-w-full">
                        {msg.products.map((p) => (
                          <div
                            key={p.id}
                            className="w-[180px] shrink-0 glass-panel rounded-xl overflow-hidden border border-luxury-border border-opacity-40 bg-luxury-black bg-opacity-45 p-2.5 flex flex-col space-y-2 hover:border-luxury-gold transition-colors"
                          >
                            <img
                              src={p.image_url}
                              alt={p.name}
                              className="w-full h-[120px] object-cover rounded-lg"
                            />
                            <div className="min-w-0">
                              <h5 className="text-[11px] font-bold text-white truncate">{p.name}</h5>
                              <p className="text-[8.5px] text-gray-500 truncate mt-0.5">{p.shop_name}</p>
                            </div>
                            <div className="flex justify-between items-center mt-auto pt-1.5 border-t border-luxury-border border-opacity-15">
                              <span className="text-[10px] font-extrabold text-luxury-gold">
                                ₹{Number(p.price).toLocaleString()}
                              </span>
                              <button
                                onClick={() => setQuickViewProduct(p)}
                                className="text-[9px] bg-luxury-purpleLight text-luxury-gold px-2 py-0.5 rounded border border-luxury-gold border-opacity-25 uppercase font-bold flex items-center gap-1 hover:bg-luxury-gold hover:text-black transition-colors"
                              >
                                <Eye className="w-2.5 h-2.5" /> View
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}

            {/* Thinking indicator */}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-luxury-purpleDeep text-gray-400 border border-luxury-border border-opacity-25 px-4 py-3 rounded-2xl rounded-tl-none text-xs flex items-center space-x-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-luxury-gold animate-bounce"></span>
                  <span className="w-1.5 h-1.5 rounded-full bg-luxury-gold animate-bounce [animation-delay:0.2s]"></span>
                  <span className="w-1.5 h-1.5 rounded-full bg-luxury-gold animate-bounce [animation-delay:0.4s]"></span>
                  <span className="text-[10px] font-light pl-1.5">Consulting design files...</span>
                </div>
              </div>
            )}
          </div>

          {/* Form chat input footer */}
          <form
            onSubmit={handleFormSubmit}
            className="p-4 border-t border-luxury-border border-opacity-35 bg-luxury-purpleDeep bg-opacity-15 flex gap-3 shrink-0"
          >
            <input
              type="text"
              placeholder="Ask about design colors, fabrics, or wedding matching advice..."
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              className="luxury-input py-2.5 px-4 text-xs flex-grow"
              disabled={loading}
              required
            />
            <button
              type="submit"
              disabled={loading || !inputVal.trim()}
              className="bg-luxury-gold hover:bg-opacity-90 text-black text-xs font-bold uppercase px-6 py-2.5 rounded-lg shadow-goldGlow transition-colors flex items-center justify-center gap-1.5 shrink-0"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Ask</span>
            </button>
          </form>
        </div>

        {/* Right Side: Quick Suggestions Chips Sidebar */}
        <div className="w-full lg:w-[280px] shrink-0 flex flex-col space-y-4">
          <div className="glass-panel p-5 rounded-2xl border border-luxury-border bg-luxury-purpleDeep bg-opacity-15 h-full">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-3">Styling Prompts</h3>
            <p className="text-[10.5px] text-gray-500 mb-5 leading-relaxed font-light">
              Select one of the exclusive style parameters to configure an automatic inquiry:
            </p>

            <div className="space-y-3.5">
              {suggestions.map((s, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(s.text)}
                  disabled={loading}
                  className="w-full p-3.5 rounded-xl border border-luxury-border border-opacity-35 bg-luxury-black bg-opacity-40 text-left hover:border-luxury-gold transition-colors flex flex-col space-y-1.5 group"
                >
                  <span className="text-[10px] font-bold text-luxury-gold uppercase tracking-wider group-hover:underline">
                    {s.label}
                  </span>
                  <span className="text-[9.5px] text-gray-400 font-light leading-relaxed truncate-3-lines">
                    "{s.text}"
                  </span>
                  <div className="text-[8.5px] text-gray-500 font-bold uppercase tracking-widest flex items-center gap-1 mt-1 pt-1.5 border-t border-luxury-border border-opacity-10">
                    Send prompt <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* QUICK VIEW PRODUCT DIALOG */}
      <AnimatePresence>
        {quickViewProduct && (
          <ProductQuickViewModal
            product={quickViewProduct}
            onClose={() => setQuickViewProduct(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};
