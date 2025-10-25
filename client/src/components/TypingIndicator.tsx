export default function TypingIndicator() {
  return (
    <div className="flex w-full justify-start" data-testid="typing-indicator">
      <div className="mr-auto max-w-3xl bg-card border border-card-border rounded-2xl px-4 py-3">
        <div className="flex gap-1.5">
          <div
            className="w-2 h-2 rounded-full bg-muted-foreground animate-pulse-dot"
            style={{ animationDelay: "0ms" }}
          />
          <div
            className="w-2 h-2 rounded-full bg-muted-foreground animate-pulse-dot"
            style={{ animationDelay: "200ms" }}
          />
          <div
            className="w-2 h-2 rounded-full bg-muted-foreground animate-pulse-dot"
            style={{ animationDelay: "400ms" }}
          />
        </div>
      </div>
    </div>
  );
}
