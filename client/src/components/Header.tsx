import { Menu, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface HeaderProps {
  onMenuClick?: () => void;
}

export default function Header({ onMenuClick }: HeaderProps) {
  return (
    <header className="h-16 border-b border-border bg-background sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 h-full flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <ShoppingBag className="w-5 h-5 text-primary" />
          </div>
          <h1 className="text-xl font-bold" data-testid="text-logo">
            ChatCommerce AI
          </h1>
        </div>

        <Button
          variant="ghost"
          size="icon"
          onClick={onMenuClick}
          className="h-8 w-8"
          data-testid="button-menu"
        >
          <Menu className="h-5 w-5" />
        </Button>
      </div>
    </header>
  );
}
