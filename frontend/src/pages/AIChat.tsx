import { useEffect, useRef, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { Send, Sparkles, Lightbulb } from 'lucide-react';
import { aiApi } from '@/api/aiApi';
import GlassCard from '@/components/ui/GlassCard';
import Spinner from '@/components/ui/Spinner';
import type { ChatMessage } from '@/types';

const SUGGESTIONS = [
  'I only have eggs and milk. What can I make?',
  'Can I eat pizza today and stay on track?',
  'What should I eat after my workout?',
  'Suggest a high-protein breakfast.',
];

export default function AIChat() {
  const queryClient = useQueryClient();
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  const { data } = useQuery({ queryKey: ['chat-history'], queryFn: () => aiApi.chatHistory() });
  const messages: ChatMessage[] = data?.data.messages || [];

  const chatMutation = useMutation({
    mutationFn: aiApi.chat,
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['chat-history'] });
      if (res.data.offline) {
        toast('AI is offline — showing a general tip instead of a personalized answer', { icon: 'ℹ️' });
      }
    },
    onError: (err: any) => {
      queryClient.invalidateQueries({ queryKey: ['chat-history'] });
      toast.error(err?.response?.data?.message || 'AI coach is unavailable right now');
    },
  });

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, chatMutation.isPending]);

  const send = (text: string) => {
    if (!text.trim()) return;
    chatMutation.mutate(text);
    setInput('');
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] max-w-3xl mx-auto">
      <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-4 pr-1">
        {messages.length === 0 && (
          <GlassCard className="text-center">
            <Sparkles className="mx-auto text-brand-500 mb-2" size={28} />
            <h3 className="font-display font-bold text-slate-800 dark:text-slate-100 mb-1">Your AI Coach is ready</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">Ask about meals, macros, workouts — anything.</p>
            <div className="grid sm:grid-cols-2 gap-2">
              {SUGGESTIONS.map((s) => (
                <button key={s} onClick={() => send(s)} className="text-left text-xs p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 hover:bg-brand-50 dark:hover:bg-brand-900/20 text-slate-600 dark:text-slate-300 flex items-start gap-2">
                  <Lightbulb size={14} className="text-brand-500 mt-0.5 shrink-0" /> {s}
                </button>
              ))}
            </div>
          </GlassCard>
        )}

        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm whitespace-pre-wrap ${
                m.role === 'user'
                  ? 'bg-brand-600 text-white rounded-br-md'
                  : 'glass-card rounded-bl-md text-slate-700 dark:text-slate-200'
              }`}
            >
              {m.content}
            </div>
          </div>
        ))}

        {chatMutation.isPending && (
          <div className="flex justify-start">
            <div className="glass-card rounded-2xl rounded-bl-md px-4 py-3"><Spinner size={18} /></div>
          </div>
        )}
      </div>

      <form
        onSubmit={(e) => { e.preventDefault(); send(input); }}
        className="mt-4 flex items-center gap-2 glass-card p-2"
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask your AI coach anything..."
          className="flex-1 bg-transparent px-3 py-2 text-sm outline-none text-slate-800 dark:text-slate-100 placeholder-slate-400"
        />
        <button type="submit" className="h-10 w-10 rounded-xl bg-brand-600 text-white flex items-center justify-center shrink-0 hover:bg-brand-700 transition">
          <Send size={16} />
        </button>
      </form>
    </div>
  );
}
