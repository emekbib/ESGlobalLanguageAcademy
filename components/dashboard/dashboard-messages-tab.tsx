'use client';

import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  Send,
  Loader2,
  ArrowLeft,
  AlertCircle,
  MessageSquare,
  Search,
  CheckCheck,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  X,
  GraduationCap,
  User,
} from 'lucide-react';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';
import { isToday, isYesterday, format } from 'date-fns';

type Message = {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  created_at: string;
};

type Contact = {
  id: string;
  full_name: string;
  avatar_url: string | null;
  role: string;
};

function deduplicateMessages(msgs: Message[]): Message[] {
  const map = new Map<string, Message>();
  for (const m of msgs) {
    map.set(m.id, m);
  }
  return Array.from(map.values()).sort(
    (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  );
}

function formatMessageDate(dateStr: string): string {
  const d = new Date(dateStr);
  if (isToday(d)) return 'Today';
  if (isYesterday(d)) return 'Yesterday';
  return format(d, 'MMMM d, yyyy');
}

export default function DashboardMessagesTab({
  currentUser,
}: {
  currentUser: { id: string; role: string };
}) {
  const searchParams = useSearchParams();
  const targetContactId = searchParams?.get('contactId') || searchParams?.get('teacherId');

  const [contacts, setContacts] = useState<Contact[]>([]);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loadingContacts, setLoadingContacts] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const supabase = createSupabaseBrowserClient();

  useEffect(() => {
    let active = true;

    async function loadContacts() {
      try {
        const uniqueUserIds = new Set<string>();

        // 1. Check if currentUser has a teacher profile
        const { data: teacherProfile } = await supabase
          .from('teacher_profiles')
          .select('id')
          .eq('user_id', currentUser.id)
          .maybeSingle();

        const teacherProfileId = teacherProfile?.id;

        // 2. Query bookings using direct columns
        let bookingTeacherProfileIds: string[] = [];

        if (teacherProfileId) {
          const { data: bookings } = await supabase
            .from('bookings')
            .select('student_id, teacher_id')
            .or(`student_id.eq.${currentUser.id},teacher_id.eq.${teacherProfileId}`);

          if (bookings) {
            bookings.forEach((b) => {
              if (b.student_id && b.student_id !== currentUser.id) {
                uniqueUserIds.add(b.student_id);
              }
              if (b.teacher_id && b.teacher_id !== teacherProfileId) {
                bookingTeacherProfileIds.push(b.teacher_id);
              }
            });
          }
        } else {
          const { data: bookings } = await supabase
            .from('bookings')
            .select('student_id, teacher_id')
            .eq('student_id', currentUser.id);

          if (bookings) {
            bookings.forEach((b) => {
              if (b.teacher_id) bookingTeacherProfileIds.push(b.teacher_id);
            });
          }
        }

        // 2b. Resolve teacher_profile IDs -> user_ids
        if (bookingTeacherProfileIds.length > 0) {
          const uniqueTeacherProfileIds = Array.from(new Set(bookingTeacherProfileIds));
          const { data: teacherProfiles } = await supabase
            .from('teacher_profiles')
            .select('id, user_id')
            .in('id', uniqueTeacherProfileIds);

          if (teacherProfiles) {
            teacherProfiles.forEach((tp) => {
              if (tp.user_id && tp.user_id !== currentUser.id) {
                uniqueUserIds.add(tp.user_id);
              }
            });
          }
        }

        // 3. Also check direct messages for past conversations
        try {
          const { data: directMessages, error: msgError } = await supabase
            .from('messages')
            .select('sender_id, receiver_id')
            .or(`sender_id.eq.${currentUser.id},receiver_id.eq.${currentUser.id}`);

          if (!msgError && directMessages) {
            directMessages.forEach((m) => {
              if (m.sender_id && m.sender_id !== currentUser.id) uniqueUserIds.add(m.sender_id);
              if (m.receiver_id && m.receiver_id !== currentUser.id) uniqueUserIds.add(m.receiver_id);
            });
          }
        } catch {
          // Table might not exist yet
        }

        // 4. For students: Also fetch educators from profiles so student can message educators directly!
        if (currentUser.role === 'student') {
          const { data: educators } = await supabase
            .from('profiles')
            .select('user_id')
            .eq('role', 'teacher')
            .neq('user_id', currentUser.id);

          if (educators) {
            educators.forEach((e) => uniqueUserIds.add(e.user_id));
          }
        }

        // 5. For teachers: Also fetch students from profiles
        if (currentUser.role === 'teacher') {
          const { data: students } = await supabase
            .from('profiles')
            .select('user_id')
            .eq('role', 'student')
            .neq('user_id', currentUser.id);

          if (students) {
            students.forEach((s) => uniqueUserIds.add(s.user_id));
          }
        }

        // 6. Include target contact if provided in URL params
        if (targetContactId && targetContactId !== currentUser.id) {
          uniqueUserIds.add(targetContactId);
        }

        if (uniqueUserIds.size === 0) {
          if (active) {
            setContacts([]);
            setLoadingContacts(false);
          }
          return;
        }

        const { data: profiles } = await supabase
          .from('profiles')
          .select('user_id, full_name, avatar_url, role')
          .in('user_id', Array.from(uniqueUserIds));

        if (active && profiles) {
          const loadedContacts: Contact[] = profiles.map((p) => ({
            id: p.user_id,
            full_name: p.full_name || 'Academy Member',
            avatar_url: p.avatar_url,
            role: p.role || (currentUser.role === 'student' ? 'teacher' : 'student'),
          }));

          setContacts(loadedContacts);

          // Select contact from URL param, or first available contact
          if (targetContactId) {
            const found = loadedContacts.find((c) => c.id === targetContactId);
            if (found) setSelectedContact(found);
            else if (loadedContacts.length > 0) setSelectedContact(loadedContacts[0]);
          } else if (loadedContacts.length > 0) {
            setSelectedContact((prev) => prev || loadedContacts[0]);
          }
        }
      } catch (err: any) {
        console.error('Error loading contacts:', err?.message || err);
      } finally {
        if (active) setLoadingContacts(false);
      }
    }

    void loadContacts();

    return () => {
      active = false;
    };
  }, [currentUser.id, currentUser.role, targetContactId, supabase]);

  useEffect(() => {
    if (!selectedContact) return;

    setLoadingMessages(true);
    setSendError(null);

    async function loadMessages() {
      try {
        const { data, error } = await supabase
          .from('messages')
          .select('*')
          .or(
            `and(sender_id.eq.${currentUser.id},receiver_id.eq.${selectedContact?.id}),and(sender_id.eq.${selectedContact?.id},receiver_id.eq.${currentUser.id})`
          )
          .order('created_at', { ascending: true });

        if (!error && data) {
          setMessages((prev) => {
            const temps = prev.filter((m) => m.id.startsWith('temp-'));
            return deduplicateMessages([...data, ...temps]);
          });
          setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);

          // Mark incoming unread messages from this contact as read
          if (selectedContact) {
            void supabase
              .from('messages')
              .update({ read_at: new Date().toISOString() })
              .eq('sender_id', selectedContact.id)
              .eq('receiver_id', currentUser.id)
              .is('read_at', null);
          }
        } else if (error) {
          console.warn('Notice loading messages:', error.message);
        }
      } catch (err: any) {
        console.warn('Error loading messages:', err);
      } finally {
        setLoadingMessages(false);
      }
    }

    void loadMessages();

    // 1. Subscribe to new messages via Realtime channel
    const channel = supabase
      .channel(`chat_${currentUser.id}_${selectedContact.id}_${Date.now()}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
        },
        (payload) => {
          const newMsg = payload.new as Message;
          if (
            (newMsg.sender_id === selectedContact.id && newMsg.receiver_id === currentUser.id) ||
            (newMsg.sender_id === currentUser.id && newMsg.receiver_id === selectedContact.id)
          ) {
            setMessages((prev) => {
              if (prev.some((m) => m.id === newMsg.id)) return prev;
              const withoutMatchingTemp = prev.filter(
                (m) =>
                  !(
                    m.id.startsWith('temp-') &&
                    m.sender_id === newMsg.sender_id &&
                    m.content === newMsg.content
                  )
              );
              return deduplicateMessages([...withoutMatchingTemp, newMsg]);
            });
            setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
          }
        }
      )
      .subscribe();

    // 2. Periodic sync every 4 seconds to guarantee messages appear even if WebSocket is delayed
    const interval = setInterval(() => {
      void loadMessages();
    }, 4000);

    return () => {
      supabase.removeChannel(channel);
      clearInterval(interval);
    };
  }, [selectedContact, currentUser.id, supabase]);

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!newMessage.trim() || !selectedContact || sending) return;

    const msgContent = newMessage.trim();
    setNewMessage('');
    setSendError(null);
    setSending(true);

    const tempId = `temp-${Date.now()}`;
    const optimisticMsg: Message = {
      id: tempId,
      sender_id: currentUser.id,
      receiver_id: selectedContact.id,
      content: msgContent,
      created_at: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, optimisticMsg]);
    setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);

    try {
      const { data, error } = await supabase
        .from('messages')
        .insert({
          sender_id: currentUser.id,
          receiver_id: selectedContact.id,
          content: msgContent,
        })
        .select()
        .single();

      if (error) {
        setMessages((prev) => prev.filter((m) => m.id !== tempId));
        setNewMessage(msgContent);
        setSendError(
          error.code === 'PGRST205'
            ? 'The messages database table has not been created yet in Supabase.'
            : error.message || 'Failed to deliver message. Please try again.'
        );
      } else if (data) {
        setMessages((prev) => {
          const filtered = prev.filter((m) => m.id !== tempId);
          return deduplicateMessages([...filtered, data as Message]);
        });
      }
    } catch (err: any) {
      setMessages((prev) => prev.filter((m) => m.id !== tempId));
      setNewMessage(msgContent);
      setSendError(err?.message || 'Could not connect to the messages service. Please try again.');
    } finally {
      setSending(false);
      textareaRef.current?.focus();
    }
  };

  const filteredContacts = contacts.filter((c) =>
    c.full_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const starterPrompts =
    currentUser.role === 'teacher'
      ? [
          'Hello! Welcome to the academy. How can I assist you with your language learning goals?',
          'Hi! Which language and level would you like to start practicing with?',
          'Looking forward to our upcoming lesson! Feel free to share any topics or questions you have.',
        ]
      : [
          'Hello! I would like to introduce myself and inquire about your availability.',
          'Hi! Which days and time slots work best for our scheduled lesson?',
          'I am eager to practice conversational fluency and vocabulary with you.',
        ];

  return (
    <div className="flex h-full w-full overflow-hidden bg-white dark:bg-[#101012] select-none">
      {/* ========================================================================= */}
      {/* CONTACTS SIDEBAR */}
      {/* ========================================================================= */}
      <div
        className={`w-full sm:w-80 md:w-84 lg:w-96 flex flex-col h-full border-r border-stone-200/80 dark:border-stone-800 bg-white dark:bg-[#151518] shrink-0 transition-all ${
          selectedContact ? 'hidden sm:flex' : 'flex'
        }`}
      >
        {/* Sidebar Header */}
        <div className="p-4 sm:p-5 border-b border-stone-100 dark:border-stone-800/80 shrink-0 bg-stone-50/50 dark:bg-[#121215]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-stone-950 dark:bg-stone-800 text-amber-300 shadow-xs">
                <MessageSquare className="h-4 w-4" />
              </div>
              <div>
                <h2 className="font-display text-base font-black tracking-tight text-stone-950 dark:text-white">
                  Messages
                </h2>
                <p className="text-[11px] text-stone-400 font-medium">
                  {currentUser.role === 'student' ? 'Educators & Consultations' : 'Students & Inquiries'}
                </p>
              </div>
            </div>
            <span className="rounded-full bg-stone-200/70 dark:bg-stone-800 px-2.5 py-0.5 text-[11px] font-bold text-stone-700 dark:text-stone-300">
              {contacts.length}
            </span>
          </div>

          {/* Contact Search Box */}
          <div className="relative mt-3.5">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-stone-400 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search conversations…"
              className="w-full rounded-xl border border-stone-200/90 dark:border-stone-700/80 bg-white dark:bg-stone-800/90 pl-9 pr-8 py-2 text-xs text-stone-900 dark:text-stone-100 placeholder:text-stone-400 focus:border-amber-400 dark:focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-400/20 transition"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-full p-1 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 transition"
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </div>
        </div>

        {/* Contacts Scrollable List */}
        <div className="flex-1 overflow-y-auto divide-y divide-stone-100/70 dark:divide-stone-800/60">
          {loadingContacts ? (
            <div className="p-10 text-center text-stone-400">
              <Loader2 className="mx-auto h-6 w-6 animate-spin text-amber-500" />
              <p className="mt-3 text-xs font-medium">Loading conversations…</p>
            </div>
          ) : filteredContacts.length === 0 ? (
            <div className="p-10 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-stone-100 dark:bg-stone-800 text-stone-400">
                <MessageSquare className="h-6 w-6" />
              </div>
              <p className="mt-3 text-sm font-bold text-stone-800 dark:text-stone-200">
                {searchQuery ? 'No matching people found' : 'No conversations yet'}
              </p>
              <p className="mt-1 text-xs text-stone-400 max-w-xs mx-auto leading-relaxed">
                {searchQuery
                  ? 'Try searching with a different name or clear your search.'
                  : currentUser.role === 'student'
                  ? 'Message educators from the Teachers page to start a consultation.'
                  : 'Student inquiries will appear here.'}
              </p>
            </div>
          ) : (
            filteredContacts.map((contact) => {
              const isSelected = selectedContact?.id === contact.id;
              const isTeacher = contact.role === 'teacher';

              return (
                <button
                  key={contact.id}
                  onClick={() => {
                    setSelectedContact(contact);
                    setSendError(null);
                  }}
                  className={`w-full text-left flex items-center gap-3.5 p-3.5 sm:p-4 transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-amber-50/70 dark:bg-stone-800/90 border-l-[3.5px] border-amber-500 shadow-xs'
                      : 'border-l-[3.5px] border-transparent hover:bg-stone-50/80 dark:hover:bg-stone-800/40'
                  }`}
                >
                  {/* Avatar + Status Indicator */}
                  <div className="relative shrink-0">
                    {contact.avatar_url ? (
                      <img
                        src={contact.avatar_url}
                        alt={contact.full_name}
                        className="h-11 w-11 rounded-2xl object-cover ring-1 ring-stone-200 dark:ring-stone-700"
                      />
                    ) : (
                      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-stone-950 dark:bg-stone-800 text-amber-300 font-bold text-sm ring-1 ring-stone-200 dark:ring-stone-700">
                        {contact.full_name.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <span
                      className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-stone-900"
                      title="Available online"
                    />
                  </div>

                  {/* Name and Meta */}
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold text-stone-900 dark:text-stone-100">
                      {contact.full_name}
                    </p>
                    <div className="mt-1 flex items-center gap-1.5">
                      <span
                        className={`inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] font-semibold ${
                          isTeacher
                            ? 'bg-amber-100/90 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300'
                            : 'bg-emerald-100/90 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300'
                        }`}
                      >
                        {isTeacher ? (
                          <>
                            <GraduationCap className="h-2.5 w-2.5" />
                            <span>Native Educator</span>
                          </>
                        ) : (
                          <>
                            <User className="h-2.5 w-2.5" />
                            <span>Student</span>
                          </>
                        )}
                      </span>
                    </div>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* CHAT MAIN CONVERSATION PANE */}
      {/* ========================================================================= */}
      <div
        className={`flex-1 flex flex-col h-full overflow-hidden bg-[#faf9f6] dark:bg-[#0f0f11] ${
          !selectedContact ? 'hidden sm:flex items-center justify-center' : 'flex'
        }`}
      >
        {!selectedContact ? (
          <div className="text-center p-8 max-w-md mx-auto">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-stone-100 dark:bg-stone-800 text-stone-400 shadow-xs">
              <MessageSquare className="h-8 w-8 text-amber-400" />
            </div>
            <h3 className="mt-4 font-display text-lg font-bold text-stone-900 dark:text-white">
              Select a conversation
            </h3>
            <p className="mt-1.5 text-xs sm:text-sm text-stone-500 dark:text-stone-400 leading-relaxed">
              Choose a contact from the sidebar to start a real-time lesson consultation or question.
            </p>
          </div>
        ) : (
          <>
            {/* Top Chat Bar */}
            <div className="h-16 px-4 sm:px-6 border-b border-stone-200/80 dark:border-stone-800 bg-white/95 dark:bg-[#151518]/95 backdrop-blur-md flex items-center justify-between shrink-0 z-10">
              <div className="flex items-center gap-3 min-w-0">
                <button
                  type="button"
                  onClick={() => setSelectedContact(null)}
                  className="sm:hidden p-2 -ml-1 rounded-xl hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-500 transition"
                  aria-label="Back to contacts"
                >
                  <ArrowLeft className="h-5 w-5" />
                </button>

                {/* Contact Avatar */}
                <div className="relative shrink-0">
                  {selectedContact.avatar_url ? (
                    <img
                      src={selectedContact.avatar_url}
                      alt={selectedContact.full_name}
                      className="h-10 w-10 rounded-2xl object-cover ring-1 ring-stone-200 dark:ring-stone-700"
                    />
                  ) : (
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-stone-950 dark:bg-stone-800 text-amber-300 font-bold text-sm">
                      {selectedContact.full_name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-stone-900" />
                </div>

                {/* Contact Info */}
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="truncate font-display text-sm sm:text-base font-bold text-stone-950 dark:text-white">
                      {selectedContact.full_name}
                    </h3>
                    <span
                      className={`hidden sm:inline-flex rounded-md px-1.5 py-0.5 text-[10px] font-bold ${
                        selectedContact.role === 'teacher'
                          ? 'bg-amber-100 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300'
                          : 'bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300'
                      }`}
                    >
                      {selectedContact.role === 'teacher' ? 'Native Educator' : 'Learner'}
                    </span>
                  </div>
                  <p className="truncate text-[11px] font-medium text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span>Active Now • Direct Lesson Channel</span>
                  </p>
                </div>
              </div>

              {/* Right Quick Actions */}
              <div className="flex items-center gap-2">
                {selectedContact.role === 'teacher' && (
                  <Link
                    href={`/teachers/${selectedContact.id}`}
                    target="_blank"
                    className="inline-flex items-center gap-1.5 rounded-full border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 px-3 py-1.5 text-xs font-bold text-stone-700 dark:text-stone-200 shadow-xs transition hover:bg-stone-50 dark:hover:bg-stone-700"
                  >
                    <ExternalLink className="h-3.5 w-3.5 text-stone-400" />
                    <span className="hidden sm:inline">Teacher Profile</span>
                  </Link>
                )}

                <div className="hidden md:flex items-center gap-1.5 rounded-full bg-stone-100 dark:bg-stone-800/80 px-3 py-1.5 text-[11px] font-semibold text-stone-600 dark:text-stone-300">
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
                  <span>Realtime Sync</span>
                </div>
              </div>
            </div>

            {/* Messages Scroll Area */}
            <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-6 space-y-4">
              <div className="max-w-3xl mx-auto w-full space-y-4">
                {loadingMessages ? (
                  <div className="flex flex-col items-center justify-center py-20 text-stone-400">
                    <Loader2 className="h-6 w-6 animate-spin text-amber-500" />
                    <p className="mt-2 text-xs font-medium">Connecting conversation…</p>
                  </div>
                ) : messages.length === 0 ? (
                  <div className="py-12 text-center animate-fade-in">
                    <div className="relative inline-block mb-4">
                      {selectedContact.avatar_url ? (
                        <img
                          src={selectedContact.avatar_url}
                          alt={selectedContact.full_name}
                          className="h-20 w-20 rounded-3xl object-cover ring-4 ring-amber-400/20 shadow-md mx-auto"
                        />
                      ) : (
                        <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-stone-950 dark:bg-stone-800 text-amber-300 font-bold text-2xl ring-4 ring-amber-400/20 shadow-md mx-auto">
                          {selectedContact.full_name.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <span className="absolute bottom-0 right-0 h-4 w-4 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-stone-900" />
                    </div>

                    <h4 className="font-display text-lg font-bold text-stone-950 dark:text-white">
                      Start your conversation with {selectedContact.full_name}
                    </h4>
                    <p className="mt-1.5 text-xs sm:text-sm text-stone-500 dark:text-stone-400 leading-relaxed max-w-sm mx-auto">
                      Direct, encrypted communication channel for lesson topics, schedule alignment, and language goals.
                    </p>

                    {/* Starter Chips */}
                    <div className="mt-6 space-y-2.5 max-w-md mx-auto">
                      <p className="text-[11px] font-bold uppercase tracking-wider text-stone-400 flex items-center justify-center gap-1.5">
                        <Sparkles className="h-3 w-3 text-amber-500" />
                        <span>Quick Starters</span>
                      </p>
                      <div className="flex flex-col gap-2">
                        {starterPrompts.map((prompt, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => {
                              setNewMessage(prompt);
                              textareaRef.current?.focus();
                            }}
                            className="text-left rounded-xl border border-stone-200/90 dark:border-stone-800 bg-white dark:bg-stone-900/90 px-3.5 py-2.5 text-xs text-stone-700 dark:text-stone-300 shadow-xs hover:border-amber-400 hover:bg-amber-50/50 dark:hover:border-amber-400/50 dark:hover:bg-amber-950/20 transition-all cursor-pointer"
                          >
                            {prompt}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  messages.map((msg, i) => {
                    const isMine = msg.sender_id === currentUser.id;
                    const showDate =
                      i === 0 ||
                      formatMessageDate(msg.created_at) !==
                        formatMessageDate(messages[i - 1].created_at);

                    return (
                      <div key={msg.id} className="space-y-3">
                        {/* Floating Date Header */}
                        {showDate && (
                          <div className="flex items-center justify-center my-4">
                            <span className="rounded-full bg-stone-200/70 dark:bg-stone-800 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-stone-600 dark:text-stone-400 shadow-xs">
                              {formatMessageDate(msg.created_at)}
                            </span>
                          </div>
                        )}

                        {/* Message Bubble Row */}
                        <div
                          className={`flex items-end gap-2.5 ${
                            isMine ? 'justify-end' : 'justify-start'
                          }`}
                        >
                          {!isMine && (
                            <div className="shrink-0 mb-1">
                              {selectedContact.avatar_url ? (
                                <img
                                  src={selectedContact.avatar_url}
                                  alt={selectedContact.full_name}
                                  className="h-7 w-7 rounded-xl object-cover ring-1 ring-stone-200 dark:ring-stone-700"
                                />
                              ) : (
                                <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-stone-950 dark:bg-stone-800 text-amber-300 font-bold text-[10px]">
                                  {selectedContact.full_name.charAt(0).toUpperCase()}
                                </div>
                              )}
                            </div>
                          )}

                          <div className="max-w-[85%] sm:max-w-[70%] space-y-1">
                            <div
                              className={`rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                                isMine
                                  ? 'bg-stone-900 text-white dark:bg-amber-400 dark:text-stone-950 rounded-br-xs shadow-sm font-medium'
                                  : 'bg-white dark:bg-stone-800/90 text-stone-900 dark:text-stone-100 border border-stone-200/80 dark:border-stone-700/80 rounded-bl-xs shadow-xs'
                              }`}
                            >
                              <p className="whitespace-pre-wrap break-words">{msg.content}</p>
                            </div>

                            <div
                              className={`flex items-center gap-1 px-1 text-[10px] font-medium text-stone-400 dark:text-stone-500 ${
                                isMine ? 'justify-end' : 'justify-start'
                              }`}
                            >
                              <span>
                                {format(new Date(msg.created_at), 'h:mm a')}
                              </span>
                              {isMine && (
                                <CheckCheck
                                  className={`h-3.5 w-3.5 ${
                                    msg.id.startsWith('temp-')
                                      ? 'text-stone-400 opacity-50'
                                      : 'text-amber-500 dark:text-stone-900'
                                  }`}
                                />
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>
            </div>

            {/* Error Notification */}
            {sendError && (
              <div className="mx-4 sm:mx-6 mb-2 max-w-3xl sm:mx-auto w-full flex items-center justify-between rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 p-3 text-xs text-red-700 dark:text-red-300 shadow-sm shrink-0">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 shrink-0 text-red-500" />
                  <span>{sendError}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setSendError(null)}
                  className="rounded-lg p-1 text-red-600 hover:bg-red-100 dark:hover:bg-red-900 transition"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            )}

            {/* Bottom Message Input Bar */}
            <div className="p-3 sm:p-4 bg-white/95 dark:bg-[#151518]/95 border-t border-stone-200/80 dark:border-stone-800 backdrop-blur-md shrink-0">
              <form onSubmit={handleSendMessage} className="max-w-3xl mx-auto w-full">
                <div className="flex items-end gap-2.5 rounded-2xl border border-stone-200/90 dark:border-stone-700/80 bg-stone-50 dark:bg-stone-800/80 p-2 sm:p-2.5 shadow-xs focus-within:border-amber-400 dark:focus-within:border-amber-400 focus-within:ring-2 focus-within:ring-amber-400/20 focus-within:bg-white dark:focus-within:bg-stone-800 transition-all">
                  <textarea
                    ref={textareaRef}
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                    placeholder={`Message ${selectedContact.full_name}…`}
                    className="max-h-32 min-h-[40px] flex-1 resize-none bg-transparent px-3 py-1.5 text-sm text-stone-900 dark:text-stone-100 placeholder:text-stone-400 focus:outline-none leading-relaxed"
                    rows={1}
                  />

                  <button
                    type="submit"
                    disabled={!newMessage.trim() || sending}
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-stone-950 dark:bg-amber-400 text-white dark:text-stone-950 transition hover:bg-stone-800 dark:hover:bg-amber-300 disabled:opacity-40 cursor-pointer shadow-xs active:scale-95"
                    title="Send message (Enter)"
                    aria-label="Send message"
                  >
                    {sending ? (
                      <Loader2 className="h-4 w-4 animate-spin text-white dark:text-stone-900" />
                    ) : (
                      <Send className="h-4 w-4 text-amber-300 dark:text-stone-950" />
                    )}
                  </button>
                </div>

                <p className="mt-1.5 text-center text-[10px] text-stone-400 dark:text-stone-500 font-medium">
                  Press <kbd className="rounded bg-stone-100 dark:bg-stone-800 px-1 py-0.5 font-mono text-[9px] text-stone-600 dark:text-stone-400">Enter</kbd> to send • <kbd className="rounded bg-stone-100 dark:bg-stone-800 px-1 py-0.5 font-mono text-[9px] text-stone-600 dark:text-stone-400">Shift + Enter</kbd> for newline
                </p>
              </form>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
