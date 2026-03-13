"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useRef,
  type ReactNode,
} from "react";
import { type AISourcePage, getSourceLabel } from "@/lib/ai-suggestions";
import { generateAIResponse } from "@/lib/ai-responses";

export type { AISourcePage };

export interface AIMessage {
  id: string;
  role: "user" | "ai";
  content: string;
  timestamp: Date;
  isStreaming: boolean;
}

export interface AIConversation {
  id: string;
  title: string;
  sourceLabel: string;
  sourcePage: AISourcePage;
  messages: AIMessage[];
  createdAt: Date;
  updatedAt: Date;
}

// View modes within the AI panel
export type AIView = "chat" | "history";

interface AIContextValue {
  isOpen: boolean;
  currentSource: AISourcePage;
  openAI: () => void;
  closeAI: () => void;
  setAISource: (source: AISourcePage) => void;
  // Current conversation (null = new chat state)
  currentConversation: AIConversation | null;
  // All past conversations (does NOT include the current fresh one if empty)
  conversations: AIConversation[];
  lastConversation: AIConversation | null;
  switchConversation: (id: string) => void;
  newChat: () => void;
  sendMessage: (content: string) => void;
  isGenerating: boolean;
  streamingState: Map<string, number>;
  // Panel view: "chat" or "history"
  view: AIView;
  setView: (v: AIView) => void;
}

const AIContext = createContext<AIContextValue | null>(null);

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

function createConversation(source: AISourcePage): AIConversation {
  return {
    id: generateId(),
    title: "New Chat",
    sourceLabel: getSourceLabel(source),
    sourcePage: source,
    messages: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

export function AIProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentSource, setCurrentSource] = useState<AISourcePage>({ type: "home" });
  // All conversations that have at least one message
  const [conversations, setConversations] = useState<AIConversation[]>([]);
  // The current active conversation (may be empty / "new chat")
  const [currentConversation, setCurrentConversation] = useState<AIConversation | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [streamingState, setStreamingState] = useState<Map<string, number>>(new Map());
  const [view, setView] = useState<AIView>("chat");
  const streamIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const lastConversation = conversations[0] ?? null;

  const setAISource = useCallback((source: AISourcePage) => {
    setCurrentSource(source);
  }, []);

  // Every open = fresh new chat. Last chat is surfaced via lastConversation card.
  const openAI = useCallback(() => {
    setIsOpen(true);
    setView("chat");
    setCurrentConversation(createConversation(currentSource));
  }, [currentSource]);

  const closeAI = useCallback(() => {
    setIsOpen(false);
    setView("chat");
  }, []);

  const switchConversation = useCallback((id: string) => {
    setConversations((prev) => {
      const conv = prev.find((c) => c.id === id);
      if (conv) setCurrentConversation(conv);
      return prev;
    });
    setView("chat");
  }, []);

  const newChat = useCallback(() => {
    setCurrentConversation(createConversation(currentSource));
    setView("chat");
  }, [currentSource]);

  const sendMessage = useCallback(
    (content: string) => {
      if (!content.trim() || isGenerating) return;

      // Ensure we have a conversation object
      let conv = currentConversation;
      if (!conv) {
        conv = createConversation(currentSource);
        setCurrentConversation(conv);
      }

      const convId = conv.id;
      const sourcePage = conv.sourcePage;

      const userMsgId = generateId();
      const userMsg: AIMessage = {
        id: userMsgId,
        role: "user",
        content: content.trim(),
        timestamp: new Date(),
        isStreaming: false,
      };

      // Update current conversation
      setCurrentConversation((prev) => {
        if (!prev) return prev;
        const isFirstMessage = prev.messages.length === 0;
        return {
          ...prev,
          messages: [...prev.messages, userMsg],
          title: isFirstMessage
            ? content.trim().slice(0, 42) + (content.trim().length > 42 ? "..." : "")
            : prev.title,
          updatedAt: new Date(),
        };
      });

      setIsGenerating(true);

      const thinkingDelay = 600 + Math.random() * 300;
      setTimeout(() => {
        const responseText = generateAIResponse(content, sourcePage);
        const aiMsgId = generateId();
        const aiMsg: AIMessage = {
          id: aiMsgId,
          role: "ai",
          content: responseText,
          timestamp: new Date(),
          isStreaming: true,
        };

        // Add AI message and push conversation to history on first response
        setCurrentConversation((prev) => {
          if (!prev) return prev;
          const updated = { ...prev, messages: [...prev.messages, aiMsg], updatedAt: new Date() };
          // Persist to conversations list (upsert)
          setConversations((allConvs) => {
            const exists = allConvs.find((c) => c.id === convId);
            if (exists) {
              return allConvs.map((c) => (c.id === convId ? updated : c));
            }
            return [updated, ...allConvs];
          });
          return updated;
        });

        // Stream characters
        let visibleChars = 0;
        setStreamingState(new Map([[aiMsgId, 0]]));
        if (streamIntervalRef.current) clearInterval(streamIntervalRef.current);

        streamIntervalRef.current = setInterval(() => {
          visibleChars += Math.random() > 0.5 ? 3 : 2;
          const clamped = Math.min(visibleChars, responseText.length);
          setStreamingState(new Map([[aiMsgId, clamped]]));

          if (clamped >= responseText.length) {
            clearInterval(streamIntervalRef.current!);
            streamIntervalRef.current = null;
            setCurrentConversation((prev) => {
              if (!prev) return prev;
              const updated = {
                ...prev,
                messages: prev.messages.map((m) =>
                  m.id === aiMsgId ? { ...m, isStreaming: false } : m
                ),
              };
              setConversations((all) =>
                all.map((c) => (c.id === convId ? updated : c))
              );
              return updated;
            });
            setStreamingState(new Map());
            setIsGenerating(false);
          }
        }, 16);
      }, thinkingDelay);
    },
    [currentConversation, currentSource, isGenerating]
  );

  return (
    <AIContext.Provider
      value={{
        isOpen,
        currentSource,
        openAI,
        closeAI,
        setAISource,
        currentConversation,
        conversations,
        lastConversation,
        switchConversation,
        newChat,
        sendMessage,
        isGenerating,
        streamingState,
        view,
        setView,
      }}
    >
      {children}
    </AIContext.Provider>
  );
}

export function useAI() {
  const ctx = useContext(AIContext);
  if (!ctx) throw new Error("useAI must be used within AIProvider");
  return ctx;
}
