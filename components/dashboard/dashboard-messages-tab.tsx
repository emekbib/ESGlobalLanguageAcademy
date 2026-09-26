'use client';

import { useState, useEffect, useRef } from 'react';
import { Send, User as UserIcon, Loader2, ArrowLeft } from 'lucide-react';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';
import { formatDistanceToNow } from 'date-fns';

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

export default function DashboardMessagesTab({
  currentUser,
}: {
  currentUser: { id: string; role: string };
}) {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loadingContacts, setLoadingContacts] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const supabase = createSupabaseBrowserClient();

  useEffect(() => {
    // Load contacts based on bookings
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

        // 2. Query bookings using direct columns on the bookings table
        let bookingsQuery = supabase
          .from('bookings')
          .select('student_id, teacher_id, teacher_profiles(user_id)');

        if (teacherProfileId) {
          bookingsQuery = bookingsQuery.or(`student_id.eq.${currentUser.id},teacher_id.eq.${teacherProfileId}`);
        } else {
          bookingsQuery = bookingsQuery.eq('student_id', currentUser.id);
        }

        const { data: bookings, error: bookingsError } = await bookingsQuery;

        if (bookingsError) {
          console.warn('Notice loading booking contacts:', bookingsError.message);
        } else if (bookings) {
          bookings.forEach((b) => {
            if (b.student_id && b.student_id !== currentUser.id) {
              uniqueUserIds.add(b.student_id);
            }
            const tp = b.teacher_profiles as any;
            const teacherUserId = Array.isArray(tp) ? tp[0]?.user_id : tp?.user_id;
            if (teacherUserId && teacherUserId !== currentUser.id) {
              uniqueUserIds.add(teacherUserId);
            }
          });
        }

        // 3. Also check direct messages for past conversations
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

        if (uniqueUserIds.size === 0) {
          setContacts([]);
          setLoadingContacts(false);
          return;
        }

        const { data: profiles, error: profilesError } = await supabase
          .from('profiles')
          .select('user_id, full_name, avatar_url, role')
          .in('user_id', Array.from(uniqueUserIds));

        if (!profilesError && profiles) {
          setContacts(
            profiles.map((p) => ({
              id: p.user_id,
              full_name: p.full_name || 'Academy Member',
              avatar_url: p.avatar_url,
              role: p.role || 'student',
            })),
          );
        }
      } catch (err: any) {
        console.error('Error loading contacts:', err?.message || err);
      } finally {
        setLoadingContacts(false);
      }
    }
    
    loadContacts();
  }, [currentUser.id, supabase]);

  useEffect(() => {
    if (!selectedContact) return;

    setLoadingMessages(true);
    async function loadMessages() {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .or(`and(sender_id.eq.${currentUser.id},receiver_id.eq.${selectedContact?.id}),and(sender_id.eq.${selectedContact?.id},receiver_id.eq.${currentUser.id})`)
        .order('created_at', { ascending: true });

      if (!error && data) {
        setMessages(data);
        setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
      }
      setLoadingMessages(false);
    }

    loadMessages();

    // Subscribe to new messages
    const channel = supabase
      .channel(`messages:${selectedContact.id}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `sender_id=eq.${selectedContact.id}`,
      }, (payload) => {
        setMessages(prev => [...prev, payload.new as Message]);
        setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [selectedContact, currentUser.id, supabase]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedContact) return;

    const msgContent = newMessage.trim();
    setNewMessage('');

    const optimisticMsg: Message = {
      id: Math.random().toString(),
      sender_id: currentUser.id,
      receiver_id: selectedContact.id,
      content: msgContent,
      created_at: new Date().toISOString(),
    };
    
    setMessages(prev => [...prev, optimisticMsg]);
    setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);

    const { error } = await supabase
      .from('messages')
      .insert({
        sender_id: currentUser.id,
        receiver_id: selectedContact.id,
        content: msgContent,
      });

    if (error) {
      console.error('Error sending message:', error);
      // Optional: show toast error
    }
  };

  return (
    <div className="flex h-[600px] overflow-hidden rounded-3xl border border-stone-200/80 dark:border-stone-800 bg-white dark:bg-stone-900 shadow-sm animate-fade-in">
      {/* Contacts Sidebar */}
      <div className={`w-full sm:w-1/3 flex flex-col border-r border-stone-100 dark:border-stone-800 transition-transform ${selectedContact ? 'hidden sm:flex' : 'flex'}`}>
        <div className="p-4 border-b border-stone-100 dark:border-stone-800">
          <h2 className="font-display text-lg font-black tracking-tight text-stone-950 dark:text-white">Messages</h2>
        </div>
        <div className="flex-1 overflow-y-auto">
          {loadingContacts ? (
            <div className="p-8 text-center text-stone-400">
              <Loader2 className="mx-auto h-5 w-5 animate-spin" />
            </div>
          ) : contacts.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-xs font-medium text-stone-500">No contacts yet. Book a lesson to start messaging.</p>
            </div>
          ) : (
            contacts.map(contact => (
              <button
                key={contact.id}
                onClick={() => setSelectedContact(contact)}
                className={`w-full text-left flex items-center gap-3 p-4 transition-colors hover:bg-stone-50 dark:hover:bg-stone-800/50 ${selectedContact?.id === contact.id ? 'bg-stone-50 dark:bg-stone-800/80 border-l-2 border-stone-950 dark:border-amber-400' : 'border-l-2 border-transparent'}`}
              >
                {contact.avatar_url ? (
                  <img src={contact.avatar_url} alt={contact.full_name} className="h-10 w-10 rounded-full object-cover" />
                ) : (
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-stone-100 dark:bg-stone-800 text-stone-500">
                    <UserIcon className="h-5 w-5" />
                  </div>
                )}
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold text-stone-900 dark:text-stone-100">{contact.full_name}</p>
                  <p className="truncate text-xs text-stone-500 capitalize">{contact.role}</p>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className={`flex-1 flex flex-col bg-stone-50/50 dark:bg-stone-900 ${!selectedContact ? 'hidden sm:flex items-center justify-center' : 'flex'}`}>
        {!selectedContact ? (
          <div className="text-center text-stone-400">
            <p className="text-sm font-medium">Select a conversation to start messaging</p>
          </div>
        ) : (
          <>
            {/* Chat Header */}
            <div className="flex items-center gap-3 border-b border-stone-100 dark:border-stone-800 p-4 bg-white dark:bg-stone-900 shrink-0">
              <button 
                onClick={() => setSelectedContact(null)}
                className="sm:hidden p-1.5 -ml-1.5 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-500 transition"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              {selectedContact.avatar_url ? (
                <img src={selectedContact.avatar_url} alt={selectedContact.full_name} className="h-8 w-8 rounded-full object-cover" />
              ) : (
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-stone-100 dark:bg-stone-800 text-stone-500">
                  <UserIcon className="h-4 w-4" />
                </div>
              )}
              <div>
                <p className="text-sm font-bold text-stone-900 dark:text-stone-100">{selectedContact.full_name}</p>
              </div>
            </div>

            {/* Messages List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {loadingMessages ? (
                <div className="flex justify-center p-4">
                  <Loader2 className="h-5 w-5 animate-spin text-stone-400" />
                </div>
              ) : messages.length === 0 ? (
                <div className="text-center pt-10">
                  <p className="text-xs text-stone-500">No messages yet. Say hello!</p>
                </div>
              ) : (
                messages.map((msg, i) => {
                  const isMine = msg.sender_id === currentUser.id;
                  const showTime = i === 0 || new Date(msg.created_at).getTime() - new Date(messages[i-1].created_at).getTime() > 5 * 60000;
                  
                  return (
                    <div key={msg.id} className={`flex flex-col ${isMine ? 'items-end' : 'items-start'}`}>
                      {showTime && (
                        <span className="mb-1 text-[10px] font-medium text-stone-400">
                          {formatDistanceToNow(new Date(msg.created_at), { addSuffix: true })}
                        </span>
                      )}
                      <div className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm ${
                        isMine 
                          ? 'bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900 rounded-br-sm' 
                          : 'bg-white dark:bg-stone-800 border border-stone-200/50 dark:border-stone-700 text-stone-900 dark:text-stone-100 rounded-bl-sm'
                      }`}>
                        {msg.content}
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 bg-white dark:bg-stone-900 border-t border-stone-100 dark:border-stone-800 shrink-0">
              <form onSubmit={handleSendMessage} className="flex items-end gap-2">
                <textarea
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage(e);
                    }
                  }}
                  placeholder="Type a message..."
                  className="max-h-32 min-h-[44px] flex-1 resize-none rounded-2xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800/50 px-4 py-3 text-sm focus:border-stone-400 focus:outline-none focus:ring-1 focus:ring-stone-400 dark:focus:border-stone-500 transition-colors"
                  rows={1}
                />
                <button
                  type="submit"
                  disabled={!newMessage.trim()}
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 transition hover:bg-stone-800 dark:hover:bg-white disabled:opacity-50"
                >
                  <Send className="h-4 w-4" />
                </button>
              </form>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
