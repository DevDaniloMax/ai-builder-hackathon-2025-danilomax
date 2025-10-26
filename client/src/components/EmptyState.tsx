import { Sparkles, Shirt, Smartphone, Home as HomeIcon, Heart, BookOpen, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface EmptyStateProps {
  onQuerySelect: (query: string) => void;
}

const topCategories = [
  { icon: Shirt, label: "Moda & Vestuário", query: "Quero comprar roupas" },
  { icon: Smartphone, label: "Eletrônicos", query: "Quero comprar eletrônicos" },
  { icon: HomeIcon, label: "Casa & Decoração", query: "Quero comprar para casa" },
  { icon: Heart, label: "Beleza & Saúde", query: "Quero produtos de beleza" },
  { icon: BookOpen, label: "Livros & Papelaria", query: "Quero material de papelaria" },
  { icon: Zap, label: "Esportes & Fitness", query: "Quero produtos de esporte" }
];

export default function EmptyState({ onQuerySelect }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
      <div className="w-20 h-20 mb-6 rounded-3xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
        <Sparkles className="w-10 h-10 text-primary" />
      </div>

      <h1 className="text-4xl font-bold mb-2" data-testid="text-title">
        Olá! Sou a Ana Clara
      </h1>

      <p className="text-lg text-muted-foreground mb-12 max-w-2xl">
        Sua assistente pessoal de compras. Me conte o que você procura e vou te ajudar a encontrar as melhores opções!
      </p>

      <div className="max-w-4xl w-full">
        <p className="text-sm font-medium text-foreground mb-6">
          Categorias Populares
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {topCategories.map((category, index) => (
            <Button
              key={index}
              variant="outline"
              onClick={() => onQuerySelect(category.query)}
              className="h-auto py-4 px-6 flex items-center gap-3 justify-start hover:scale-105 transition-transform"
              data-testid={`button-category-${index}`}
            >
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <category.icon className="w-4 h-4 text-primary" />
              </div>
              <span className="text-sm font-medium">{category.label}</span>
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}
