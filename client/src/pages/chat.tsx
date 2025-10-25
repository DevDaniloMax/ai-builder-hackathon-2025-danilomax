import { useRef, useEffect } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import Header from "@/components/Header";
import ChatMessage from "@/components/ChatMessage";
import ChatInput from "@/components/ChatInput";
import EmptyState from "@/components/EmptyState";
import TypingIndicator from "@/components/TypingIndicator";
import ProductGrid from "@/components/ProductGrid";
import type { Product } from "@/components/ProductCard";

export default function Chat() {
  const { messages, sendMessage, status } = useChat({
    transport: new DefaultChatTransport({
      api: '/api/chat',
    }),
  });
  
  const isLoading = status === 'streaming';
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSendMessage = async (content: string) => {
    if (!content.trim() || isLoading) return;
    
    sendMessage({
      text: content,
    });
  };

  const handleQuerySelect = (query: string) => {
    handleSendMessage(query);
  };

  const handleMenuClick = () => {
    console.log('Menu clicked');
  };

  return (
    <div className="flex flex-col h-screen bg-background">
      <Header onMenuClick={handleMenuClick} />

      <div className="flex-1 overflow-y-auto pb-32">
        {messages.length === 0 ? (
          <EmptyState onQuerySelect={handleQuerySelect} />
        ) : (
          <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
            {messages.map((message: any) => {
              const timestamp = new Date().toLocaleTimeString('en-US', { 
                hour: 'numeric', 
                minute: '2-digit',
                hour12: true 
              });
              
              // Extract products from tool invocations if present
              let products: Product[] = [];
              if (message.role === 'assistant' && message.toolInvocations) {
                for (const invocation of message.toolInvocations) {
                  if (invocation.toolName === 'extractProducts' && invocation.state === 'result') {
                    const result = invocation.result;
                    if (result?.products && Array.isArray(result.products)) {
                      products = result.products;
                    }
                  }
                }
              }

              // Only render user and assistant messages
              if (message.role !== 'user' && message.role !== 'assistant') {
                return null;
              }

              // Extract text content from parts array (AI SDK 5)
              let textContent = '';
              if (message.parts && Array.isArray(message.parts)) {
                const textParts = message.parts.filter((p: any) => p.type === 'text');
                textContent = textParts.map((p: any) => p.text).join(' ');
              }

              // Detectar se é um carrossel incompleto (JSON sendo montado DURANTE streaming)
              const hasJsonStart = textContent.includes('```json');
              const hasJsonEnd = textContent.includes('```json') && 
                                 textContent.split('```').length >= 3;
              const isIncompleteCarousel = hasJsonStart && !hasJsonEnd;
              
              // Se está streaming E carrossel incompleto, não renderizar
              // Se NÃO está streaming, sempre renderizar (mesmo que incompleto)
              const shouldHide = isLoading && isIncompleteCarousel;

              if (shouldHide) {
                return null;
              }

              return (
                <div key={message.id} className="space-y-4">
                  {textContent && (
                    <ChatMessage
                      role={message.role}
                      content={textContent}
                      timestamp={timestamp}
                    />
                  )}
                  {products.length > 0 && (
                    <ProductGrid products={products} />
                  )}
                </div>
              );
            })}
            {isLoading && <TypingIndicator />}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      <ChatInput 
        onSend={handleSendMessage} 
        disabled={isLoading}
      />
    </div>
  );
}

