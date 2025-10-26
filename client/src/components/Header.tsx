import { Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import ThemeToggle from "@/components/ThemeToggle";

export interface HeaderProps {
  onMenuClick?: () => void;
}

export default function Header({ onMenuClick }: HeaderProps) {
  return (
    <header className="h-16 border-b border-border bg-background sticky top-0 z-50 backdrop-blur-sm bg-background/95">
      <div className="max-w-7xl mx-auto px-4 h-full flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-primary" />
          </div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold" data-testid="text-logo">
              Ana Clara
            </h1>
            <Badge variant="secondary" className="text-xs font-medium">
              Assistente de Vendas
            </Badge>
          </div>
        </div>

        <ThemeToggle />
      </div>
    </header>
  );
}
