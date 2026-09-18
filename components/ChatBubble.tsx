"use client";

import { useCurrentUser } from "@/components/CurrentUserProvider";
import { initials } from "@/lib/format";
import type { ChatMessage } from "@/types";

interface ChatBubbleProps {
  message: ChatMessage;
}

export function ChatBubble({ message }: ChatBubbleProps) {
  const user = useCurrentUser();
  const isUser = message.role === "user";
  const avatarLabel = isUser && user ? initials(user.displayName) : "AI";

  return (
    <div className={`flex max-w-[92%] items-start gap-2.5 ${isUser ? "ml-auto max-w-[84%] flex-row-reverse" : ""}`}>
      <span className={`grid size-[27px] shrink-0 place-items-center rounded-full border text-[0.58rem] font-bold ${isUser ? "border-accent/35 bg-accent/15 text-[#F3AD9B]" : "border-surface/[0.16] bg-surface/[0.08] text-surface/70"}`}>
        {avatarLabel}
      </span>
      <p className={`m-0 rounded-[5px_15px_15px_15px] border border-surface/[0.12] bg-surface/[0.075] px-3.5 py-3 text-[0.79rem] leading-[1.6] text-surface/[0.82] ${isUser ? "rounded-[15px_5px_15px_15px] border-0 bg-surface text-ink" : ""}`}>
        {message.content}
      </p>
    </div>
  );
}
