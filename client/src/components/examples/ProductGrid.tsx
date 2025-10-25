import ProductGrid from '../ProductGrid';
import headphonesImg from '@assets/stock_images/modern_wireless_head_910466b1.jpg';
import laptopImg from '@assets/stock_images/professional_laptop__79e23c51.jpg';
import backpackImg from '@assets/stock_images/backpack_outdoor_gea_9ab6f1e4.jpg';

export default function ProductGridExample() {
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
    },
    {
      name: "Noise Cancelling Earbuds",
      price: 149.99,
      image: headphonesImg,
      url: "https://example.com/earbuds",
      source: "target.com",
      sku: "EB-004"
    },
    {
      name: "Gaming Laptop",
      price: 1799.99,
      image: laptopImg,
      url: "https://example.com/gaming-laptop",
      source: "newegg.com",
      sku: "GL-005"
    },
    {
      name: "Travel Backpack",
      price: 129.99,
      image: backpackImg,
      url: "https://example.com/travel-backpack",
      source: "amazon.com",
      sku: "TB-006"
    }
  ];

  return (
    <div className="p-6">
      <ProductGrid products={products} />
    </div>
  );
}
