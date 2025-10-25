import { ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface EmptyStateProps {
  onQuerySelect: (query: string) => void;
}

const suggestedQueries = [
  "Wireless headphones under $200",
  "Professional laptop for programming",
  "Outdoor backpack for hiking",
  "Standing desk for home office",
  "Smart watch with fitness tracking",
  "Mechanical keyboard for gaming",
  "Noise cancelling earbuds",
  "4K monitor under $500",
  "Ergonomic office chair"
];

export default function EmptyState({ onQuerySelect }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
      <div className="w-16 h-16 mb-6 rounded-2xl bg-primary/10 flex items-center justify-center">
        <ShoppingBag className="w-8 h-8 text-primary" />
      </div>

      <h1 className="text-4xl font-bold mb-2" data-testid="text-title">
        ChatCommerce AI
      </h1>

      <p className="text-lg text-muted-foreground mb-8">
        Your AI Shopping Assistant
      </p>

      <div className="max-w-3xl w-full">
        <p className="text-sm text-muted-foreground mb-4">
          Try asking:
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {suggestedQueries.slice(0, 9).map((query, index) => (
            <Button
              key={index}
              variant="outline"
              onClick={() => onQuerySelect(query)}
              className="h-auto py-3 px-6 text-sm hover:scale-105 transition-transform"
              data-testid={`button-suggested-${index}`}
            >
              {query}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}
