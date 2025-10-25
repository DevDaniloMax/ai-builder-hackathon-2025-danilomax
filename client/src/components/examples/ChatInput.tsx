import { useState } from 'react';
import ChatInput from '../ChatInput';

export default function ChatInputExample() {
  const [lastMessage, setLastMessage] = useState<string>("");

  const handleSend = (message: string) => {
    console.log('Message sent:', message);
    setLastMessage(message);
  };

  return (
    <div className="h-screen flex flex-col">
      <div className="flex-1 p-4">
        {lastMessage && (
          <div className="max-w-4xl mx-auto p-4 bg-card rounded-lg border border-card-border">
            <p className="text-sm text-muted-foreground mb-1">Last message sent:</p>
            <p className="text-card-foreground">{lastMessage}</p>
          </div>
        )}
      </div>
      <ChatInput onSend={handleSend} />
    </div>
  );
}
