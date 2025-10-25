import { useRef, useEffect } from "react";
import { useChat } from "@ai-sdk/react";
import Header from "@/components/Header";
import ChatMessage from "@/components/ChatMessage";
import ChatInput from "@/components/ChatInput";
import EmptyState from "@/components/EmptyState";
import TypingIndicator from "@/components/TypingIndicator";
import ProductGrid from "@/components/ProductGrid";
import type { Product } from "@/components/ProductCard";

export default function Chat() {
  const { messages, sendMessage, status } = useChat({
    api: '/api/chat',
    streamProtocol: 'data',
  });
  
  const isLoading = status === 'submitting' || status === 'streaming';
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSendMessage = async (content: string) => {
    if (!content.trim() || isLoading) return;
    
    await sendMessage({
      role: 'user',
      content,
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

              return (
                <div key={message.id} className="space-y-4">
                  <ChatMessage
                    role={message.role}
                    content={message.text || message.content || ''}
                    timestamp={timestamp}
                  />
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

