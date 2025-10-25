import ProductCard from '../ProductCard';
import headphonesImg from '@assets/stock_images/modern_wireless_head_910466b1.jpg';
import laptopImg from '@assets/stock_images/professional_laptop__79e23c51.jpg';
import backpackImg from '@assets/stock_images/backpack_outdoor_gea_9ab6f1e4.jpg';

export default function ProductCardExample() {
  const products = [
    {
      name: "Premium Wireless Headphones",
      price: 179.99,
      image: headphonesImg,
      url: "https://example.com/headphones",
      source: "amazon.com",
      sku: "HP-001"
    },
    {
      name: "Professional Laptop",
      price: 1299.99,
      image: laptopImg,
      url: "https://example.com/laptop",
      source: "bestbuy.com",
      sku: "LP-002"
    },
    {
      name: "Outdoor Adventure Backpack",
      price: 89.99,
      image: backpackImg,
      url: "https://example.com/backpack",
      source: "rei.com",
      sku: "BP-003"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
      {products.map((product) => (
        <ProductCard key={product.sku} product={product} />
      ))}
    </div>
  );
}
