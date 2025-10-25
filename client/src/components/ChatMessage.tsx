import { cn } from "@/lib/utils";
import { ExternalLink } from "lucide-react";

export interface ChatMessageProps {
  role: "user" | "assistant";
  content: string;
  timestamp?: string;
}

function renderContentWithLinks(content: string, isUser: boolean) {
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const parts = content.split(urlRegex);
  
  return parts.map((part, index) => {
    if (part.match(urlRegex)) {
      let cleanUrl = part.trim();
      while (cleanUrl.endsWith(')') || cleanUrl.endsWith('.') || cleanUrl.endsWith(',')) {
        cleanUrl = cleanUrl.slice(0, -1);
      }
      
      return (
        <a
          key={index}
          href={cleanUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={cn(
            "inline-flex items-center gap-1 underline hover:no-underline transition-opacity hover:opacity-80",
            isUser ? "text-primary-foreground" : "text-primary"
          )}
          data-testid={`link-product-${index}`}
        >
          {cleanUrl}
          <ExternalLink className="w-3 h-3 inline" />
        </a>
      );
    }
    return <span key={index}>{part}</span>;
  });
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
          "text-base leading-relaxed whitespace-pre-wrap break-words",
          isUser ? "text-primary-foreground" : "text-card-foreground"
        )}>
          {renderContentWithLinks(content, isUser)}
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
