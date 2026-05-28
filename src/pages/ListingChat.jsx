import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useI18n } from '@/lib/i18n';
import { Send, ChevronLeft, Lock, AlertTriangle, Loader2 } from 'lucide-react';
import { format, isToday, isYesterday } from 'date-fns';
import { toast } from 'sonner';

const SENSITIVE_PATTERNS = [
  /\b(\+?[\d\s\-().]{7,})\b/g,
  /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g,
  /(https?:\/\/|www\.)[^\s]+/gi,
];

function containsSensitiveData(text) {
  return SENSITIVE_PATTERNS.some(p => { p.lastIndex = 0; return p.test(text); });
}

function formatMsgTime(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isToday(d)) return format(d, 'HH:mm');
  if (isYesterday(d)) return 'Вчера ' + format(d, 'HH:mm');
  return format(d, 'dd.MM HH:mm');
}

const fallbackImage = 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=200&h=150&fit=crop';

export default function ListingChat() {
  const { listingId } = useParams();
  const { lang } = useI18n();
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [userLoading, setUserLoading] = useState(true);
  const [thread, setThread] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [blocked, setBlocked] = useState(false);
  const [sending, setSending] = useState(false);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);
  const initialScrollDone = useRef(false);

  // Форсирай scroll до горе при mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    base44.auth.me()
      .then(u => { setUser(u); setUserLoading(false); })
      .catch(() => {
        setUserLoading(false);
        base44.auth.redirectToLogin(window.location.href);
      });
  }, []);

  const { data: listing, isLoading: listingLoading } = useQuery({
    queryKey: ['listing-chat', listingId],
    queryFn: async () => {
      const res = await base44.entities.Listing.filter({ id: listingId });
      return res[0] || null;
    },
    enabled: !!listingId,
  });

  // Find or create chat thread
  useEffect(() => {
    if (!user?.email || !listing) return;
    if (user.email === listing.owner_email) return; // owner viewing own listing — do nothing

    base44.entities.ChatThread.list('-created_date', 100)
      .then(async (allThreads) => {
        const existing = allThreads.find(t =>
          t.listing_id === listingId &&
          t.participant_emails?.includes(user.email) &&
          t.participant_emails?.includes(listing.owner_email)
        );
        if (existing) {
          setThread(existing);
        } else {
          const created = await base44.entities.ChatThread.create({
            listing_id: listingId,
            participant_emails: [user.email, listing.owner_email],
            participant_names: [user.full_name || user.email, listing.owner_name || listing.owner_email],
            is_unlocked: false,
          });
          setThread(created);
        }
      })
      .catch(() => {});
  }, [user?.email, listing?.id]);

  const { data: paidBooking } = useQuery({
    queryKey: ['paid-booking', listingId, user?.email],
    queryFn: async () => {
      const bookings = await base44.entities.Booking.filter({ renter_email: user.email });
      return bookings.find(b =>
        b.listing_id === listingId &&
        ['paid', 'item_sent', 'active', 'returning', 'returned', 'completed'].includes(b.status)
      ) || null;
    },
    enabled: !!user?.email && !!listingId,
  });

  const isUnlocked = !!paidBooking || !!thread?.is_unlocked;

  useEffect(() => {
    if (paidBooking && thread && !thread.is_unlocked) {
      base44.entities.ChatThread.update(thread.id, { is_unlocked: true })
        .then(updated => setThread(updated))
        .catch(() => {});
    }
  }, [paidBooking, thread?.id]);

  // Load messages
  useEffect(() => {
    if (!thread?.id) return;
    base44.entities.ChatMessage.filter({ thread_id: thread.id }, 'created_date')
      .then(setMessages)
      .catch(() => {});
  }, [thread?.id]);

  // Real-time subscription
  useEffect(() => {
    if (!thread?.id) return;
    const unsubscribe = base44.entities.ChatMessage.subscribe((event) => {
      if (event.data?.thread_id === thread.id && event.type === 'create') {
        setMessages(prev => {
          if (prev.find(m => m.id === event.data.id)) return prev;
          return [...prev, event.data];
        });
      }
    });
    return unsubscribe;
  }, [thread?.id]);

  // Auto-scroll — само при нови съобщения, не при initial load
  useEffect(() => {
    if (!initialScrollDone.current) {
      initialScrollDone.current = true;
      return;
    }
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    if (!newMessage.trim() || !thread || sending) return;

    if (!isUnlocked && containsSensitiveData(newMessage)) {
      setBlocked(true);
      return;
    }
    setBlocked(false);
    setSending(true);
    const content = newMessage;
    setNewMessage('');

    try {
      await base44.entities.ChatMessage.create({
        thread_id: thread.id,
        sender_email: user.email,
        sender_name: user.full_name || user.email,
        content,
      });
      await base44.entities.ChatThread.update(thread.id, {
        last_message: content,
        last_message_at: new Date().toISOString(),
      });
      base44.entities.Notification.create({
        user_email: listing.owner_email,
        type: 'system',
        title: lang === 'bg' ? 'Ново съобщение' : 'New message',
        message: `${user.full_name || user.email}: ${content.substring(0, 60)}`,
        link: `/listing/${listingId}/chat`,
      }).catch(() => {});
    } finally {
      setSending(false);
      inputRef.current?.focus();
    }
  };

  if (userLoading || listingLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <Loader2 className="w-6 h-6 animate-spin text-[#7b2ff7]" />
      </div>
    );
  }

  const ownerName = listing?.owner_name || (lang === 'bg' ? 'Собственик' : 'Owner');
  const ownerInitial = ownerName[0]?.toUpperCase() || '?';
  const listingImage = listing?.images?.[0] || fallbackImage;

  return (
    <div className="flex flex-col bg-[#f5f5f5] h-full" style={{ minHeight: 0 }}>

      {/* ── HEADER ── */}
      <div className="bg-white border-b border-gray-100 px-3 py-2 flex items-center gap-2.5 shrink-0">
        <button
          onClick={() => navigate(-1)}
          className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors shrink-0"
        >
          <ChevronLeft className="w-5 h-5 text-gray-600" />
        </button>

        {/* Avatar */}
        <div className="w-9 h-9 rounded-full gradient-bg flex items-center justify-center shrink-0">
          <span className="text-white font-bold text-sm">{ownerInitial}</span>
        </div>

        {/* Name + listing title */}
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-gray-900 text-[14px] leading-tight">{ownerName}</p>
          {listing && (
            <p className="text-[11px] text-gray-400 truncate leading-tight mt-0.5">{listing.title}</p>
          )}
        </div>

        {/* Listing thumbnail */}
        {listing && (
          <Link to={`/listing/${listing.id}`} className="shrink-0 ml-1">
            <img
              src={listingImage}
              alt={listing.title}
              onError={e => { e.target.src = fallbackImage; }}
              className="w-10 h-10 rounded-lg object-cover border border-gray-100"
            />
          </Link>
        )}
      </div>

      {/* ── LOCK BANNER ── */}
      {!isUnlocked && (
        <div className="mx-3 mt-2 shrink-0 flex items-center gap-2 bg-amber-50 border border-amber-100 rounded-xl px-3 py-2">
          <Lock className="w-3.5 h-3.5 text-amber-500 shrink-0" />
          <p className="text-[11px] text-amber-700 leading-snug">
            <span className="font-semibold">{lang === 'bg' ? 'Без контактни данни' : 'No contact info'} — </span>
            {lang === 'bg' ? 'Телефон, имейл и линкове се отключват след плащане' : 'Phone, email & links unlock after payment'}
          </p>
        </div>
      )}

      {/* ── MESSAGES ── */}
      <div className="flex-1 overflow-y-auto px-3 pt-3 pb-2">

        {/* Empty state */}
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center gap-2 text-center py-8">
            <div className="w-12 h-12 rounded-2xl gradient-bg flex items-center justify-center">
              <Send className="w-5 h-5 text-white" />
            </div>
            <p className="font-semibold text-gray-700 text-sm">
              {lang === 'bg' ? `Чат с ${ownerName}` : `Chat with ${ownerName}`}
            </p>
            <p className="text-xs text-gray-400 max-w-[220px]">
              {lang === 'bg' ? 'Попитай за наличност, детайли или условия за наем' : 'Ask about availability, details or rental terms'}
            </p>
          </div>
        )}

        {/* Bubbles */}
        <div className="space-y-1">
          {messages.map((msg, idx) => {
            const isMe = msg.sender_email === user?.email;
            const prevMsg = messages[idx - 1];
            const isNewGroup = !prevMsg || prevMsg.sender_email !== msg.sender_email;
            const nextMsg = messages[idx + 1];
            const isLastInGroup = !nextMsg || nextMsg.sender_email !== msg.sender_email;

            return (
              <div
                key={msg.id}
                className={`flex items-end gap-1.5 ${isMe ? 'justify-end' : 'justify-start'} ${isNewGroup ? 'mt-3' : 'mt-0.5'}`}
              >
                {/* Received: avatar spacer */}
                {!isMe && (
                  <div className="w-7 h-7 shrink-0 mb-0.5">
                    {isLastInGroup && (
                      <div className="w-7 h-7 rounded-full gradient-bg flex items-center justify-center">
                        <span className="text-white text-[10px] font-bold">{ownerInitial}</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Bubble */}
                <div className={`max-w-[72%] flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                  <div className={`
                    px-3.5 py-2.5 text-[13.5px] leading-relaxed break-words
                    ${isMe
                      ? 'gradient-bg text-white rounded-2xl rounded-br-sm'
                      : 'bg-white text-gray-800 rounded-2xl rounded-bl-sm border border-gray-100 shadow-sm'
                    }
                  `}>
                    {msg.content}
                  </div>
                  {isLastInGroup && (
                    <p className="text-[10px] text-gray-400 mt-0.5 px-1">
                      {formatMsgTime(msg.created_date)}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div ref={bottomRef} className="h-1" />
      </div>

      {/* ── BLOCKED WARNING ── */}
      {blocked && (
        <div className="mx-3 mb-1 flex items-center gap-2 bg-red-50 border border-red-100 rounded-xl px-3 py-2 shrink-0">
          <AlertTriangle className="w-3.5 h-3.5 text-red-500 shrink-0" />
          <p className="text-[11px] text-red-600">
            {lang === 'bg' ? 'Не можеш да споделяш контактни данни преди плащане' : 'Cannot share contact data before payment'}
          </p>
        </div>
      )}

      {/* ── INPUT BAR ── */}
      <div className="bg-white border-t border-gray-100 px-3 py-2.5 flex items-center gap-2 shrink-0" style={{ boxShadow: '0 -2px 8px rgba(0,0,0,0.04)' }}>
        <input
          ref={inputRef}
          value={newMessage}
          onChange={e => { setNewMessage(e.target.value); setBlocked(false); }}
          placeholder={lang === 'bg' ? 'Запитай за наличност или детайли...' : 'Ask about availability or details...'}
          onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
          disabled={!thread}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="sentences"
          spellCheck="false"
          inputMode="text"
          className="flex-1 bg-[#f0f2f5] rounded-full px-4 py-2.5 text-sm text-gray-800 placeholder-gray-400 outline-none focus:ring-2 focus:ring-[#7b2ff7]/25 transition-all border-0 min-w-0"
        />
        <button
          onClick={sendMessage}
          disabled={!newMessage.trim() || sending || !thread}
          className="w-10 h-10 rounded-full gradient-bg flex items-center justify-center shrink-0 hover:opacity-90 transition-all disabled:opacity-40 disabled:cursor-not-allowed active:scale-95"
        >
          {sending
            ? <Loader2 className="w-4 h-4 animate-spin text-white" />
            : <Send className="w-4 h-4 text-white" />
          }
        </button>
      </div>

    </div>
  );
}