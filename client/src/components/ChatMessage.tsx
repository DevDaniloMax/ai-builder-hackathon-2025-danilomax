import { cn } from "@/lib/utils";
import { ExternalLink } from "lucide-react";
import ProductCarousel, { type Product } from "./ProductCarousel";

export interface ChatMessageProps {
  role: "user" | "assistant";
  content: string;
  timestamp?: string;
}

function tryParseProducts(content: string): { products: Product[]; textBefore: string; textAfter: string } | null {
  try {
    const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/);
    if (!jsonMatch) return null;

    const jsonStr = jsonMatch[1];
    const parsed = JSON.parse(jsonStr);
    
    if (parsed.products && Array.isArray(parsed.products)) {
      const textBefore = content.substring(0, jsonMatch.index || 0).trim();
      const textAfter = content.substring((jsonMatch.index || 0) + jsonMatch[0].length).trim();
      
      return {
        products: parsed.products,
        textBefore,
        textAfter
      };
    }
  } catch (e) {
    return null;
  }
  return null;
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
  const productsData = !isUser ? tryParseProducts(content) : null;

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
            : productsData
            ? "mr-auto w-full max-w-4xl bg-card border border-card-border"
            : "mr-auto max-w-3xl bg-card border border-card-border"
        )}
      >
        {productsData ? (
          <div className="space-y-4">
            {productsData.textBefore && (
              <div className={cn(
                "text-base leading-relaxed whitespace-pre-wrap break-words",
                "text-card-foreground"
              )}>
                {renderContentWithLinks(productsData.textBefore, isUser)}
              </div>
            )}
            
            <ProductCarousel products={productsData.products} isUser={isUser} />
            
            {productsData.textAfter && (
              <div className={cn(
                "text-base leading-relaxed whitespace-pre-wrap break-words",
                "text-card-foreground"
              )}>
                {renderContentWithLinks(productsData.textAfter, isUser)}
              </div>
            )}
          </div>
        ) : (
          <div className={cn(
            "text-base leading-relaxed whitespace-pre-wrap break-words",
            isUser ? "text-primary-foreground" : "text-card-foreground"
          )}>
            {renderContentWithLinks(content, isUser)}
          </div>
        )}
        
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
