import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Carousel, CarouselContent, CarouselItem, CarouselApi } from "@/components/ui/carousel";
import { ExternalLink, ChevronLeft, ChevronRight } from "lucide-react";
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
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const [count, setCount] = useState(0);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (!api) return;

    setCount(api.scrollSnapList().length);
    setCurrent(api.selectedScrollSnap());

    api.on("select", () => {
      setCurrent(api.selectedScrollSnap());
    });

    // Marca como pronto após um breve delay para evitar flash
    setTimeout(() => setIsReady(true), 100);
  }, [api]);

  return (
    <div 
      className={cn(
        "w-full transition-opacity duration-300",
        isReady ? "opacity-100" : "opacity-0"
      )}
      data-testid="product-carousel"
    >
      <div className="relative px-12">
        <Carousel
          setApi={setApi}
          opts={{
            align: "start",
            loop: false,
          }}
          className="w-full"
        >
          <CarouselContent className="-ml-4">
            {products.map((product, index) => (
              <CarouselItem 
                key={index} 
                className="pl-4 basis-full md:basis-1/2 lg:basis-1/3" 
                data-testid={`carousel-item-${index}`}
              >
                <Card className="p-6 h-full flex flex-col hover-elevate active-elevate-2 transition-all">
                  {/* Imagem do produto */}
                  {product.image && (
                    <div className="w-full aspect-square mb-4 rounded-lg overflow-hidden bg-muted">
                      <img 
                        src={product.image} 
                        alt={product.name}
                        className="w-full h-full object-cover"
                        loading="lazy"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                        data-testid={`product-image-${index}`}
                      />
                    </div>
                  )}

                  {/* Cabeçalho com emoji e site */}
                  <div className="flex items-center justify-between mb-4">
                    {product.emoji && (
                      <span className="text-3xl" aria-label="Ranking">{product.emoji}</span>
                    )}
                    {product.site && (
                      <span className="text-xs px-3 py-1 rounded-full bg-muted text-muted-foreground font-medium">
                        {product.site}
                      </span>
                    )}
                  </div>

                  {/* Nome do produto */}
                  <h3 
                    className="text-lg font-semibold leading-tight mb-3 line-clamp-2 flex-grow" 
                    data-testid={`product-name-${index}`}
                  >
                    {product.name}
                  </h3>

                  {/* Preço */}
                  {product.price && (
                    <div className="mb-4">
                      <p className="text-xl font-bold font-mono text-primary" data-testid={`product-price-${index}`}>
                        {product.price}
                      </p>
                    </div>
                  )}

                  {/* Botão de ação */}
                  <Button
                    asChild
                    className="w-full mt-auto"
                    data-testid={`product-link-${index}`}
                  >
                    <a
                      href={product.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-2"
                    >
                      Ver Produto
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </Button>
                </Card>
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>

        {/* Setas de navegação customizadas */}
        {count > 1 && (
          <>
            <Button
              variant="outline"
              size="icon"
              className={cn(
                "absolute left-0 top-1/2 -translate-y-1/2 z-10 rounded-full shadow-lg",
                current === 0 && "opacity-50 cursor-not-allowed"
              )}
              onClick={() => api?.scrollPrev()}
              disabled={current === 0}
              data-testid="carousel-prev"
            >
              <ChevronLeft className="w-5 h-5" />
            </Button>

            <Button
              variant="outline"
              size="icon"
              className={cn(
                "absolute right-0 top-1/2 -translate-y-1/2 z-10 rounded-full shadow-lg",
                current === count - 1 && "opacity-50 cursor-not-allowed"
              )}
              onClick={() => api?.scrollNext()}
              disabled={current === count - 1}
              data-testid="carousel-next"
            >
              <ChevronRight className="w-5 h-5" />
            </Button>
          </>
        )}
      </div>

      {/* Indicador de posição */}
      {count > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          {Array.from({ length: count }).map((_, index) => (
            <button
              key={index}
              onClick={() => api?.scrollTo(index)}
              className={cn(
                "h-2 rounded-full transition-all",
                index === current 
                  ? "w-8 bg-primary" 
                  : "w-2 bg-muted hover-elevate"
              )}
              aria-label={`Ir para produto ${index + 1}`}
              data-testid={`indicator-product-${index}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
