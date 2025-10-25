import ChatMessage from '../ChatMessage';

export default function ChatMessageExample() {
  return (
    <div className="space-y-4 p-4 max-w-4xl mx-auto">
      <ChatMessage
        role="user"
        content="I need wireless headphones under $200"
        timestamp="2:30 PM"
      />
      <ChatMessage
        role="assistant"
        content="I found some great options for wireless headphones under $200. Let me show you a few highly-rated choices."
        timestamp="2:30 PM"
      />
    </div>
  );
}
