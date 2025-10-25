import { ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export interface Product {
  name: string;
  price?: number;
  image?: string;
  url: string;
  source?: string;
  sku?: string;
}

export interface ProductCardProps {
  product: Product;
  className?: string;
}

export default function ProductCard({ product, className }: ProductCardProps) {
  const handleViewProduct = () => {
    console.log('View product clicked:', product.url);
    window.open(product.url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div
      className={cn(
        "group border border-card-border rounded-xl p-5 bg-card transition-transform hover:translate-y-[-2px]",
        className
      )}
      data-testid={`product-card-${product.sku || product.name}`}
    >
      {product.image && (
        <div className="aspect-square rounded-lg overflow-hidden bg-muted mb-4">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover"
            loading="lazy"
            onError={(e) => {
              e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="400"%3E%3Crect fill="%23f5f5f5" width="400" height="400"/%3E%3C/svg%3E';
            }}
          />
        </div>
      )}

      <div className="space-y-3">
        <h3 className="text-lg font-semibold leading-tight line-clamp-2 text-card-foreground">
          {product.name}
        </h3>

        {product.price !== undefined && (
          <div className="text-xl font-bold font-mono text-card-foreground">
            ${product.price.toFixed(2)}
          </div>
        )}

        {product.source && (
          <Badge variant="secondary" className="text-xs">
            {product.source}
          </Badge>
        )}

        <Button
          onClick={handleViewProduct}
          className="w-full mt-4"
          data-testid={`button-view-${product.sku || product.name}`}
        >
          View Product
          <ExternalLink className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
