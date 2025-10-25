import { useState, useRef, useEffect } from "react";
import Header from "@/components/Header";
import ChatMessage from "@/components/ChatMessage";
import ChatInput from "@/components/ChatInput";
import EmptyState from "@/components/EmptyState";
import TypingIndicator from "@/components/TypingIndicator";
import ProductGrid from "@/components/ProductGrid";
import type { Product } from "@/components/ProductCard";
import headphonesImg from '@assets/stock_images/modern_wireless_head_910466b1.jpg';
import laptopImg from '@assets/stock_images/professional_laptop__79e23c51.jpg';
import backpackImg from '@assets/stock_images/backpack_outdoor_gea_9ab6f1e4.jpg';

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  products?: Product[];
}

export default function Chat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSendMessage = (content: string) => {
    const now = new Date().toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: "user",
      content,
      timestamp: now,
    };

    setMessages(prev => [...prev, userMessage]);
    setIsTyping(true);

    // todo: remove mock functionality - Simulate AI response
    setTimeout(() => {
      const mockProducts = getMockProducts(content);
      const assistantMessage: Message = {
        id: `assistant-${Date.now()}`,
        role: "assistant",
        content: generateMockResponse(content, mockProducts),
        timestamp: now,
        products: mockProducts,
      };

      setMessages(prev => [...prev, assistantMessage]);
      setIsTyping(false);
    }, 1500);
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
            {messages.map((message) => (
              <div key={message.id} className="space-y-4">
                <ChatMessage
                  role={message.role}
                  content={message.content}
                  timestamp={message.timestamp}
                />
                {message.products && message.products.length > 0 && (
                  <ProductGrid products={message.products} />
                )}
              </div>
            ))}
            {isTyping && <TypingIndicator />}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      <ChatInput onSend={handleSendMessage} disabled={isTyping} />
    </div>
  );
}

// todo: remove mock functionality
function getMockProducts(query: string): Product[] {
  const lowerQuery = query.toLowerCase();
  
  if (lowerQuery.includes('headphone') || lowerQuery.includes('earbuds') || lowerQuery.includes('audio')) {
    return [
      {
        name: "Premium Wireless Headphones",
        price: 179.99,
        image: headphonesImg,
        url: "https://www.amazon.com/headphones",
        source: "amazon.com",
        sku: "HP-001"
      },
      {
        name: "Noise Cancelling Earbuds",
        price: 149.99,
        image: headphonesImg,
        url: "https://www.bestbuy.com/earbuds",
        source: "bestbuy.com",
        sku: "EB-002"
      },
      {
        name: "Studio Monitor Headphones",
        price: 199.99,
        image: headphonesImg,
        url: "https://www.sweetwater.com/headphones",
        source: "sweetwater.com",
        sku: "HP-003"
      }
    ];
  }
  
  if (lowerQuery.includes('laptop') || lowerQuery.includes('computer')) {
    return [
      {
        name: "Professional Laptop - 16GB RAM",
        price: 1299.99,
        image: laptopImg,
        url: "https://www.bestbuy.com/laptop",
        source: "bestbuy.com",
        sku: "LP-001"
      },
      {
        name: "Gaming Laptop - RTX Graphics",
        price: 1799.99,
        image: laptopImg,
        url: "https://www.newegg.com/gaming-laptop",
        source: "newegg.com",
        sku: "LP-002"
      },
      {
        name: "Ultrabook - Ultra Portable",
        price: 999.99,
        image: laptopImg,
        url: "https://www.microsoft.com/ultrabook",
        source: "microsoft.com",
        sku: "LP-003"
      }
    ];
  }
  
  if (lowerQuery.includes('backpack') || lowerQuery.includes('bag') || lowerQuery.includes('hiking')) {
    return [
      {
        name: "Outdoor Adventure Backpack - 40L",
        price: 89.99,
        image: backpackImg,
        url: "https://www.rei.com/backpack",
        source: "rei.com",
        sku: "BP-001"
      },
      {
        name: "Travel Backpack - Anti-Theft",
        price: 129.99,
        image: backpackImg,
        url: "https://www.amazon.com/travel-backpack",
        source: "amazon.com",
        sku: "BP-002"
      },
      {
        name: "Hiking Daypack - Waterproof",
        price: 64.99,
        image: backpackImg,
        url: "https://www.backcountry.com/daypack",
        source: "backcountry.com",
        sku: "BP-003"
      }
    ];
  }
  
  return [
    {
      name: "Premium Wireless Headphones",
      price: 179.99,
      image: headphonesImg,
      url: "https://www.amazon.com/product",
      source: "amazon.com",
      sku: "PROD-001"
    },
    {
      name: "Professional Laptop",
      price: 1299.99,
      image: laptopImg,
      url: "https://www.bestbuy.com/product",
      source: "bestbuy.com",
      sku: "PROD-002"
    }
  ];
}

// todo: remove mock functionality
function generateMockResponse(query: string, products: Product[]): string {
  const lowerQuery = query.toLowerCase();
  
  if (lowerQuery.includes('headphone') || lowerQuery.includes('earbuds')) {
    return `I found ${products.length} excellent wireless headphones options for you. These are all highly-rated and available for immediate purchase. The prices range from $${Math.min(...products.map(p => p.price || 0)).toFixed(2)} to $${Math.max(...products.map(p => p.price || 0)).toFixed(2)}.`;
  }
  
  if (lowerQuery.includes('laptop')) {
    return `Here are ${products.length} great laptop options that match your requirements. They all feature modern processors, ample RAM, and excellent build quality. Click "View Product" to see full specifications and reviews.`;
  }
  
  if (lowerQuery.includes('backpack') || lowerQuery.includes('bag')) {
    return `I've found ${products.length} high-quality backpacks perfect for your needs. These options offer great durability, comfort, and storage capacity. Check out the details below!`;
  }
  
  return `I found ${products.length} products that match your search. Take a look at these options below - each one has been carefully selected based on quality, price, and customer reviews.`;
}
