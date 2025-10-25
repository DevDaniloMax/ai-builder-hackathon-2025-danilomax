import ProductCard, { type Product } from "./ProductCard";

export interface ProductGridProps {
  products: Product[];
}

export default function ProductGrid({ products }: ProductGridProps) {
  if (products.length === 0) return null;

  return (
    <div className="w-full max-w-4xl mx-auto mt-4 mb-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" data-testid="product-grid">
        {products.slice(0, 9).map((product, index) => (
          <ProductCard key={product.sku || index} product={product} />
        ))}
      </div>
    </div>
  );
}
