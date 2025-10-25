import { cn } from "@/lib/utils";

export interface ChatMessageProps {
  role: "user" | "assistant";
  content: string;
  timestamp?: string;
}

export default function ChatMessage({ role, content, timestamp }: ChatMessageProps) {
  const isUser = role === "user";

  return (
    <div
      className={cn(
        "flex w-full animate-fade-in",
        isUser ? "justify-end" : "justify-start"
      )}
      data-testid={`message-${role}`}
    >
      <div
        className={cn(
          "rounded-2xl px-4 py-3",
          isUser
            ? "ml-auto max-w-2xl bg-primary text-primary-foreground"
            : "mr-auto max-w-3xl bg-card border border-card-border"
        )}
      >
        <div className={cn(
          "text-base leading-relaxed whitespace-pre-wrap",
          isUser ? "text-primary-foreground" : "text-card-foreground"
        )}>
          {content}
        </div>
        {timestamp && (
          <div className={cn(
            "mt-2 text-xs opacity-60",
            isUser ? "text-primary-foreground" : "text-muted-foreground"
          )}>
            {timestamp}
          </div>
        )}
      </div>
    </div>
  );
}
