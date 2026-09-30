"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import { Header } from "@/components/layout/Header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, MessageSquare, Loader2, UserCircle } from "lucide-react";
import { useAuth, useFirestore, useCollection } from "@/firebase";
import { collection, query, where, orderBy, addDoc, serverTimestamp, onSnapshot, doc, getDoc } from "firebase/firestore";
import { format } from "date-fns";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

export default function MessagesPage() {
  const auth = useAuth();
  const db = useFirestore();
  const currentUser = auth?.currentUser;

  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  
  // Extract potential startChat parameters
  const [searchParams, setSearchParams] = useState<URLSearchParams | null>(null);
  useEffect(() => {
    setSearchParams(new URLSearchParams(window.location.search));
  }, []);

  // Fetch chats where user is a participant
  const chatsQuery = useMemo(() => {
    if (!currentUser || !db) return null;
    return query(collection(db, "Chats"), where("participants", "array-contains", currentUser.uid), orderBy("updatedAt", "desc"));
  }, [currentUser, db]);

  const { data: chats, loading: chatsLoading } = useCollection<any>(chatsQuery);

  // Handle URL query for starting a new chat
  useEffect(() => {
    if (!currentUser || !db || !chats || !searchParams) return;
    
    const targetUserId = searchParams.get("startChat");
    const targetName = searchParams.get("name") || "User";
    
    if (targetUserId && targetUserId !== currentUser.uid) {
      // Check if chat already exists
      const existingChat = chats.find(c => c.participants.includes(targetUserId));
      
      if (existingChat) {
        setActiveChatId(existingChat.id);
        // Clear url
        window.history.replaceState({}, document.title, window.location.pathname);
      } else {
        // Create new chat
        const createChat = async () => {
          try {
            const newChatRef = await addDoc(collection(db, "Chats"), {
              participants: [currentUser.uid, targetUserId],
              participantNames: {
                [targetUserId]: targetName,
                [currentUser.uid]: currentUser.displayName || "Employer"
              },
              updatedAt: serverTimestamp(),
              lastMessage: ""
            });
            setActiveChatId(newChatRef.id);
            window.history.replaceState({}, document.title, window.location.pathname);
          } catch (e) {
            console.error("Failed to create chat", e);
          }
        };
        createChat();
      }
    }
  }, [currentUser, db, chats, searchParams]);

  // Real-time listener for active chat messages
  useEffect(() => {
    if (!activeChatId || !db) return;
    
    const messagesRef = collection(db, `Chats/${activeChatId}/messages`);
    const q = query(messagesRef, orderBy("createdAt", "asc"));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setMessages(msgs);
      setTimeout(() => scrollRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
    });

    return () => unsubscribe();
  }, [activeChatId, db]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeChatId || !currentUser || !db) return;

    const text = newMessage;
    setNewMessage("");

    await addDoc(collection(db, `Chats/${activeChatId}/messages`), {
      text,
      senderId: currentUser.uid,
      createdAt: serverTimestamp()
    });

    // Update parent chat timestamp
    import("firebase/firestore").then(({ updateDoc }) => {
      updateDoc(doc(db, "Chats", activeChatId), {
        updatedAt: serverTimestamp(),
        lastMessage: text
      });
    });
  };

  if (!currentUser) return <div className="p-20 text-center">Please login to view messages.</div>;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Header />

      <main className="container mx-auto px-4 py-6 max-w-6xl flex-1 flex flex-col md:flex-row gap-6 h-[calc(100vh-80px)]">
        
        {/* CHAT LIST (SIDEBAR) */}
        <Card className="w-full md:w-1/3 rounded-2xl shadow-sm border-slate-200 h-full flex flex-col overflow-hidden shrink-0">
          <div className="p-4 border-b bg-white">
            <h2 className="text-xl font-black text-slate-800 flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-primary" /> Messages
            </h2>
          </div>
          <ScrollArea className="flex-1 bg-slate-50/50">
            {chatsLoading ? (
              <div className="flex justify-center p-10"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
            ) : chats?.length === 0 ? (
              <div className="p-10 text-center text-muted-foreground text-sm font-medium">No active conversations.</div>
            ) : (
              <div className="divide-y divide-slate-100">
                {chats?.map(chat => {
                  const otherParticipantName = chat.participantNames?.[chat.participants.find((p: string) => p !== currentUser.uid) || ""] || "User";
                  const isActive = activeChatId === chat.id;
                  return (
                    <div 
                      key={chat.id} 
                      onClick={() => setActiveChatId(chat.id)}
                      className={cn(
                        "p-4 cursor-pointer transition-colors flex items-center gap-3",
                        isActive ? "bg-primary/5 border-l-4 border-primary" : "hover:bg-white bg-white border-l-4 border-transparent"
                      )}
                    >
                      <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 shrink-0">
                        <UserCircle className="w-6 h-6" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-slate-800 truncate text-sm">{otherParticipantName}</h4>
                        <p className="text-xs text-muted-foreground truncate">{chat.lastMessage || "Started a conversation"}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </ScrollArea>
        </Card>

        {/* ACTIVE CHAT WINDOW */}
        <Card className="flex-1 rounded-2xl shadow-sm border-slate-200 h-full flex flex-col overflow-hidden bg-white">
          {activeChatId ? (
            <>
              <div className="p-4 border-b bg-white shadow-sm z-10 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                  <UserCircle className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800">
                    {chats?.find(c => c.id === activeChatId)?.participantNames?.[chats?.find(c => c.id === activeChatId)?.participants.find((p: string) => p !== currentUser.uid)] || "Chat"}
                  </h3>
                  <p className="text-[10px] uppercase font-bold tracking-widest text-green-500">Online</p>
                </div>
              </div>
              
              <ScrollArea className="flex-1 p-4 bg-slate-50/50">
                <div className="space-y-4">
                  {messages.map((msg, idx) => {
                    const isMe = msg.senderId === currentUser.uid;
                    return (
                      <div key={msg.id || idx} className={cn("flex", isMe ? "justify-end" : "justify-start")}>
                        <div className={cn(
                          "max-w-[75%] rounded-2xl px-4 py-2 shadow-sm text-sm",
                          isMe ? "bg-primary text-primary-foreground rounded-br-sm" : "bg-white border border-slate-200 text-slate-800 rounded-bl-sm"
                        )}>
                          {msg.text}
                          <div className={cn(
                            "text-[9px] font-medium mt-1 text-right opacity-70",
                            isMe ? "text-primary-foreground" : "text-muted-foreground"
                          )}>
                            {msg.createdAt?.toDate ? format(msg.createdAt.toDate(), "p") : "Now"}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={scrollRef} />
                </div>
              </ScrollArea>

              <div className="p-3 bg-white border-t">
                <form onSubmit={handleSendMessage} className="flex gap-2">
                  <Input 
                    value={newMessage} 
                    onChange={e => setNewMessage(e.target.value)} 
                    placeholder="Type a message..." 
                    className="flex-1 rounded-xl bg-slate-50 border-slate-200 focus-visible:ring-primary/20"
                  />
                  <Button type="submit" disabled={!newMessage.trim()} className="rounded-xl shadow-md w-12 px-0 bg-primary hover:bg-primary/90">
                    <Send className="w-4 h-4" />
                  </Button>
                </form>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8 space-y-4">
              <div className="w-20 h-20 bg-primary/5 rounded-full flex items-center justify-center">
                <MessageSquare className="w-10 h-10 text-primary/40" />
              </div>
              <div>
                <h3 className="text-xl font-black text-slate-800">Your Messages</h3>
                <p className="text-muted-foreground text-sm max-w-xs mx-auto mt-2">Select a conversation from the sidebar to start chatting with recruiters and candidates.</p>
              </div>
            </div>
          )}
        </Card>

      </main>
    </div>
  );
}
