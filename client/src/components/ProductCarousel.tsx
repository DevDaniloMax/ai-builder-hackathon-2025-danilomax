import { Card } from "@/components/ui/card";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";

export interface Product {
  name: string;
  price?: string;
  url: string;
  site?: string;
  image?: string;
  emoji?: string;
}

interface ProductCarouselProps {
  products: Product[];
  isUser?: boolean;
}

export default function ProductCarousel({ products, isUser = false }: ProductCarouselProps) {
  return (
    <div className="w-full max-w-xl mx-auto" data-testid="product-carousel">
      <Carousel
        opts={{
          align: "start",
          loop: false,
        }}
        className="w-full"
      >
        <CarouselContent className="-ml-2 md:-ml-4">
          {products.map((product, index) => (
            <CarouselItem key={index} className="pl-2 md:pl-4 basis-4/5 md:basis-3/5" data-testid={`carousel-item-${index}`}>
              <Card className="p-4 hover-elevate active-elevate-2 transition-all h-full">
                <div className="flex flex-col gap-3">
                  <div className="flex items-start gap-2">
                    {product.emoji && (
                      <span className="text-2xl flex-shrink-0">{product.emoji}</span>
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-base leading-tight line-clamp-2" data-testid={`product-name-${index}`}>
                        {product.name}
                      </h3>
                      {product.site && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {product.site}
                        </p>
                      )}
                    </div>
                  </div>

                  {product.price && (
                    <div className="flex items-center gap-1">
                      <span className="text-sm">💰</span>
                      <span className="font-bold text-lg text-primary" data-testid={`product-price-${index}`}>
                        {product.price}
                      </span>
                    </div>
                  )}

                  <a
                    href={product.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={cn(
                      "inline-flex items-center justify-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors",
                      "bg-primary text-primary-foreground hover:bg-primary/90",
                      "w-full"
                    )}
                    data-testid={`product-link-${index}`}
                  >
                    Ver Produto
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              </Card>
            </CarouselItem>
          ))}
        </CarouselContent>
        
        <CarouselPrevious 
          className="hidden md:flex -left-12" 
          data-testid="carousel-prev"
        />
        <CarouselNext 
          className="hidden md:flex -right-12" 
          data-testid="carousel-next"
        />
      </Carousel>

      <div className="text-center mt-3 text-xs text-muted-foreground">
        Deslize para ver mais opções →
      </div>
    </div>
  );
}
