"use client";

import { useState } from "react";
import { MessageCircle, X, Send, Loader2, Sparkles } from "lucide-react";

interface ChatConciergeProps {
  propertyId: string;
  rules?: string[];
  description?: string;
}

export default function ChatConcierge({
  propertyId,
  rules = [],
  description = "",
}: ChatConciergeProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{ sender: "user" | "bot"; text: string }[]>([
    {
      sender: "bot",
      text: "Hello! I am your AI Stay Concierge. Ask me anything about house rules, capacity, parking, or check-in rules!",
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [loading, setLoading] = useState(false);

  // Local fallback matcher if API is unavailable or OpenAI key is missing
  const runLocalFallback = (text: string): string => {
    let reply = "I couldn't find a specific rule about that. Would you like me to connect you with the host?";
    const query = text.toLowerCase();

    if (query.includes("pet") || query.includes("dog") || query.includes("cat")) {
      const petRule = rules.find((r) => r.toLowerCase().includes("pet") || r.toLowerCase().includes("animal"));
      reply = petRule 
        ? `Regarding pets: "${petRule}"` 
        : "There are no specific rules restricting pets, but we recommend checking with the host.";
    } else if (query.includes("music") || query.includes("noise") || query.includes("dj") || query.includes("loud")) {
      const soundRule = rules.find((r) => r.toLowerCase().includes("music") || r.toLowerCase().includes("dj") || r.toLowerCase().includes("loud") || r.toLowerCase().includes("noise"));
      reply = soundRule 
        ? `Regarding music and noise guidelines: "${soundRule}"` 
        : "Loud music is generally restricted outdoors after 10:00 PM, but allowed indoors 24/7.";
    } else if (query.includes("check")) {
      const checkRule = rules.find((r) => r.toLowerCase().includes("check") || r.toLowerCase().includes("time"));
      reply = checkRule 
        ? `Our check-in/out policies state: "${checkRule}"` 
        : "Standard check-in is at 2:00 PM and check-out is at 11:00 AM.";
    } else if (query.includes("cook") || query.includes("food") || query.includes("kitchen") || query.includes("catering")) {
      const kitchenRule = rules.find((r) => r.toLowerCase().includes("kitchen") || r.toLowerCase().includes("food") || r.toLowerCase().includes("cook"));
      reply = kitchenRule 
        ? `Regarding food and kitchen options: "${kitchenRule}"` 
        : "Guests have full access to a fully equipped kitchen. Private chef services are available on request.";
    } else if (query.includes("pool") || query.includes("swim")) {
      const poolRule = rules.find((r) => r.toLowerCase().includes("pool") || r.toLowerCase().includes("swim"));
      reply = poolRule 
        ? `Swimming pool rules: "${poolRule}"` 
        : "The private pool is open 24/7. Swimming is at your own risk. Please follow standard safety precautions.";
    } else if (description && (query.includes("about") || query.includes("tell") || query.includes("describe"))) {
      reply = `Here is a summary of the property: "${description.substring(0, 150)}..."`;
    }

    return reply;
  };

  const handleSendMessage = async (text: string) => {
    if (!text.trim()) return;

    const newMessages = [...messages, { sender: "user" as const, text }];
    setMessages(newMessages);
    setInputValue("");
    setLoading(true);

    try {
      // Try live OpenAI Completion Endpoint
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          rules,
          description,
        }),
      });

      const data = await res.json();
      
      if (!res.ok || data.error) {
        // Fallback to local rule parsing if OpenAI key is missing/unconfigured
        console.warn("Live AI Concierge service unavailable, firing local fallback.", data.error);
        const fallbackText = runLocalFallback(text);
        setMessages((prev) => [...prev, { sender: "bot", text: fallbackText }]);
      } else {
        setMessages((prev) => [...prev, { sender: "bot", text: data.reply }]);
      }

    } catch (err) {
      console.warn("AI Chat API call failed, firing local fallback.", err);
      const fallbackText = runLocalFallback(text);
      setMessages((prev) => [...prev, { sender: "bot", text: fallbackText }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSendMessage(inputValue);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-40">
      
      {/* Floating Toggle Bubble */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="p-4 rounded-full bg-green-800 text-white shadow-xl hover:scale-105 hover:bg-green-700 transition-all duration-300 flex items-center justify-center relative group animate-fade-in"
        >
          <MessageCircle className="w-6 h-6" />
          <span className="absolute right-14 bg-slate-950/80 backdrop-blur-md text-white text-[10px] font-bold py-1.5 px-3 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap uppercase tracking-wider">
            Ask Stay Concierge
          </span>
        </button>
      )}

      {/* Chat Window Box */}
      {isOpen && (
        <div className="w-80 md:w-96 h-[450px] rounded-3xl overflow-hidden glass-panel shadow-2xl flex flex-col justify-between animate-fade-in border border-stone-200/40 dark:border-slate-800/40">
          
          {/* Header */}
          <div className="px-5 py-4 border-b border-stone-200/40 dark:border-slate-800/40 bg-green-800 text-white flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className="p-1 bg-white/10 rounded-lg">
                <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
              </div>
              <span className="font-bold text-sm">Stay Concierge</span>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-lg hover:bg-white/10 text-white/80 transition-colors"
            >
              <X className="w-4.5 h-4.5" />
            </button>
          </div>

          {/* Chat Logs */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 scroll-smooth">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"} animate-fade-in`}
              >
                <div
                  className={`p-3 rounded-2xl text-xs max-w-[80%] leading-relaxed ${
                    msg.sender === "user"
                      ? "bg-green-800 text-white rounded-tr-none"
                      : "bg-stone-100 dark:bg-slate-900 text-stone-800 dark:text-stone-200 rounded-tl-none border border-stone-200/10"
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}

            {/* Spinner reply */}
            {loading && (
              <div className="flex justify-start animate-fade-in">
                <div className="p-3 rounded-2xl bg-stone-100 dark:bg-slate-900 text-stone-400 rounded-tl-none border border-stone-200/10 flex items-center gap-1.5 text-xs">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" /> Thinking...
                </div>
              </div>
            )}
          </div>

          {/* Quick Prompts Suggestions */}
          <div className="px-4 py-2 flex gap-1.5 overflow-x-auto border-t border-stone-200/10 bg-stone-50/30 dark:bg-slate-950/20">
            {["Are pets allowed?", "Sound rules?", "Check-in time?"].map((prompt) => (
              <button
                key={prompt}
                type="button"
                onClick={() => handleSendMessage(prompt)}
                className="whitespace-nowrap px-3 py-1 rounded-full border border-stone-200/60 dark:border-slate-800/40 text-[10px] text-stone-500 hover:border-green-850 hover:text-green-850 dark:hover:text-green-400 transition-colors bg-white dark:bg-slate-950/50"
              >
                {prompt}
              </button>
            ))}
          </div>

          {/* Input field */}
          <div className="p-3 border-t border-stone-200/40 dark:border-slate-800/40 bg-white/50 dark:bg-slate-950/50 flex gap-2">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Ask rules, guidelines, capacity..."
              className="flex-1 px-4 py-2 rounded-xl border border-stone-200/60 dark:border-slate-800/40 bg-white dark:bg-slate-905/30 focus:outline-none focus:ring-2 focus:ring-green-800/20 text-xs"
            />
            <button
              onClick={() => handleSendMessage(inputValue)}
              className="p-2 rounded-xl bg-green-850 text-white hover:bg-green-800 shadow-md flex items-center justify-center"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>

        </div>
      )}

    </div>
  );
}
