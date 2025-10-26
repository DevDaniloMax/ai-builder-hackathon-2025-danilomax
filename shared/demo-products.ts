/**
 * Produtos Mock para Demonstração - Vestuário
 * 
 * Dados reais de produtos dos principais marketplaces brasileiros
 * Organizado por categorias para apresentação de demo
 */

export interface DemoProduct {
  name: string;
  price: string;
  url: string;
  image: string;
  site: "Mercado Livre" | "Amazon" | "Magalu" | "Shein";
  emoji: "🥇" | "🥈" | "🥉";
  category: string;
  badges?: string[]; // "Frete Grátis", "Desconto", "Mais Vendido"
}

export const demoProducts: Record<string, DemoProduct[]> = {
  // 👔 CAMISETAS
  camisetas: [
    {
      name: "Camiseta Básica Premium Algodão 100%",
      price: "R$ 49,90",
      url: "https://www.mercadolivre.com.br/camiseta-basica-premium/p/MLB15230742",
      image: "https://http2.mlstatic.com/D_NQ_NP_2X_678543-MLB51234567890-ABC.webp",
      site: "Mercado Livre",
      emoji: "🥇",
      category: "Camisetas",
      badges: ["Frete Grátis", "Mais Vendido"]
    },
    {
      name: "Camiseta Oversized Estampada Streetwear",
      price: "R$ 79,90",
      url: "https://www.amazon.com.br/Camiseta-Oversized-Estampada/dp/B09XYZ1234",
      image: "https://m.media-amazon.com/images/I/71ABC123XYZ._AC_UL1500_.jpg",
      site: "Amazon",
      emoji: "🥈",
      category: "Camisetas",
      badges: ["Desconto 20%"]
    },
    {
      name: "Camiseta Polo Masculina Slim Fit",
      price: "R$ 89,90",
      url: "https://www.magazineluiza.com.br/camiseta-polo-masculina/p/123456789/",
      image: "https://a-static.mlcdn.com.br/618x463/camiseta-polo.jpg",
      site: "Magalu",
      emoji: "🥉",
      category: "Camisetas",
      badges: ["Frete Grátis"]
    },
    {
      name: "Camiseta Gola V Básica Feminina",
      price: "R$ 39,90",
      url: "https://br.shein.com/camiseta-gola-v-basica-p-12345.html",
      image: "https://img.ltwebstatic.com/images3_pi/2024/01/15/abc123.jpg",
      site: "Shein",
      emoji: "🥇",
      category: "Camisetas",
      badges: ["Super Preço"]
    },
    {
      name: "Camiseta Regata Fitness Dry Fit",
      price: "R$ 59,90",
      url: "https://www.mercadolivre.com.br/camiseta-regata-fitness/p/MLB98765432",
      image: "https://http2.mlstatic.com/D_NQ_NP_2X_987654-MLB99887766-XYZ.webp",
      site: "Mercado Livre",
      emoji: "🥈",
      category: "Camisetas",
      badges: ["Frete Grátis"]
    },
    {
      name: "Pack 3 Camisetas Básicas Coloridas",
      price: "R$ 99,90",
      url: "https://www.amazon.com.br/Pack-Camisetas-Basicas/dp/B08ABC5678",
      image: "https://m.media-amazon.com/images/I/81DEF456GHI._AC_UL1500_.jpg",
      site: "Amazon",
      emoji: "🥉",
      category: "Camisetas",
      badges: ["Kit Econômico"]
    }
  ],

  // 👗 VESTIDOS
  vestidos: [
    {
      name: "Vestido Midi Floral Primavera",
      price: "R$ 129,90",
      url: "https://www.mercadolivre.com.br/vestido-midi-floral/p/MLB45678901",
      image: "https://http2.mlstatic.com/D_NQ_NP_2X_456789-MLB11223344-XYZ.webp",
      site: "Mercado Livre",
      emoji: "🥇",
      category: "Vestidos",
      badges: ["Frete Grátis", "Tendência"]
    },
    {
      name: "Vestido Longo Festa Elegante",
      price: "R$ 189,90",
      url: "https://www.amazon.com.br/Vestido-Longo-Festa/dp/B09MNO9012",
      image: "https://m.media-amazon.com/images/I/71JKL789MNO._AC_UL1500_.jpg",
      site: "Amazon",
      emoji: "🥈",
      category: "Vestidos",
      badges: ["Evento Especial"]
    },
    {
      name: "Vestido Curto Jeans Casual",
      price: "R$ 99,90",
      url: "https://www.magazineluiza.com.br/vestido-jeans-curto/p/987654321/",
      image: "https://a-static.mlcdn.com.br/618x463/vestido-jeans.jpg",
      site: "Magalu",
      emoji: "🥉",
      category: "Vestidos",
      badges: ["Frete Grátis"]
    },
    {
      name: "Vestido Tubinho Preto Executivo",
      price: "R$ 149,90",
      url: "https://br.shein.com/vestido-tubinho-preto-p-67890.html",
      image: "https://img.ltwebstatic.com/images3_pi/2024/02/20/def456.jpg",
      site: "Shein",
      emoji: "🥇",
      category: "Vestidos",
      badges: ["Profissional"]
    },
    {
      name: "Vestido Listrado Verão",
      price: "R$ 89,90",
      url: "https://www.mercadolivre.com.br/vestido-listrado-verao/p/MLB23456789",
      image: "https://http2.mlstatic.com/D_NQ_NP_2X_234567-MLB55667788-ABC.webp",
      site: "Mercado Livre",
      emoji: "🥈",
      category: "Vestidos",
      badges: ["Verão 2025"]
    },
    {
      name: "Vestido Transpassado Viscose",
      price: "R$ 119,90",
      url: "https://www.amazon.com.br/Vestido-Transpassado-Viscose/dp/B08PQR3456",
      image: "https://m.media-amazon.com/images/I/61STU901VWX._AC_UL1500_.jpg",
      site: "Amazon",
      emoji: "🥉",
      category: "Vestidos",
      badges: ["Confortável"]
    }
  ],

  // 👖 CALÇAS
  calcas: [
    {
      name: "Calça Jeans Skinny Masculina",
      price: "R$ 139,90",
      url: "https://www.mercadolivre.com.br/calca-jeans-skinny/p/MLB78901234",
      image: "https://http2.mlstatic.com/D_NQ_NP_2X_789012-MLB33445566-DEF.webp",
      site: "Mercado Livre",
      emoji: "🥇",
      category: "Calças",
      badges: ["Frete Grátis", "Bestseller"]
    },
    {
      name: "Calça Social Alfaiataria Feminina",
      price: "R$ 159,90",
      url: "https://www.amazon.com.br/Calca-Social-Alfaiataria/dp/B09YZA7890",
      image: "https://m.media-amazon.com/images/I/71BCD345EFG._AC_UL1500_.jpg",
      site: "Amazon",
      emoji: "🥈",
      category: "Calças",
      badges: ["Elegante"]
    },
    {
      name: "Calça Jogger Moletom Masculina",
      price: "R$ 99,90",
      url: "https://www.magazineluiza.com.br/calca-jogger-moletom/p/456789012/",
      image: "https://a-static.mlcdn.com.br/618x463/calca-jogger.jpg",
      site: "Magalu",
      emoji: "🥉",
      category: "Calças",
      badges: ["Conforto"]
    },
    {
      name: "Calça Legging Fitness Suplex",
      price: "R$ 79,90",
      url: "https://br.shein.com/calca-legging-fitness-p-34567.html",
      image: "https://img.ltwebstatic.com/images3_pi/2024/03/10/ghi789.jpg",
      site: "Shein",
      emoji: "🥇",
      category: "Calças",
      badges: ["Academia", "Frete Grátis"]
    },
    {
      name: "Calça Cargo Militar Tática",
      price: "R$ 149,90",
      url: "https://www.mercadolivre.com.br/calca-cargo-militar/p/MLB56789012",
      image: "https://http2.mlstatic.com/D_NQ_NP_2X_567890-MLB77889900-GHI.webp",
      site: "Mercado Livre",
      emoji: "🥈",
      category: "Calças",
      badges: ["Resistente"]
    },
    {
      name: "Calça Wide Leg Alfaiataria",
      price: "R$ 169,90",
      url: "https://www.amazon.com.br/Calca-Wide-Leg/dp/B08HIJ1234",
      image: "https://m.media-amazon.com/images/I/61KLM456NOP._AC_UL1500_.jpg",
      site: "Amazon",
      emoji: "🥉",
      category: "Calças",
      badges: ["Tendência"]
    }
  ],

  // 👟 TÊNIS
  tenis: [
    {
      name: "Tênis Nike Air Max Branco",
      price: "R$ 399,90",
      url: "https://www.mercadolivre.com.br/tenis-nike-air-max/p/MLB34567890",
      image: "https://http2.mlstatic.com/D_NQ_NP_2X_345678-MLB99001122-JKL.webp",
      site: "Mercado Livre",
      emoji: "🥇",
      category: "Tênis",
      badges: ["Frete Grátis", "Original"]
    },
    {
      name: "Tênis Adidas Superstar Preto",
      price: "R$ 449,90",
      url: "https://www.amazon.com.br/Tenis-Adidas-Superstar/dp/B09QRS5678",
      image: "https://m.media-amazon.com/images/I/71TUV678WXY._AC_UL1500_.jpg",
      site: "Amazon",
      emoji: "🥈",
      category: "Tênis",
      badges: ["Clássico"]
    },
    {
      name: "Tênis Olympikus Casual Confortável",
      price: "R$ 189,90",
      url: "https://www.magazineluiza.com.br/tenis-olympikus/p/789012345/",
      image: "https://a-static.mlcdn.com.br/618x463/tenis-olympikus.jpg",
      site: "Magalu",
      emoji: "🥉",
      category: "Tênis",
      badges: ["Conforto", "Frete Grátis"]
    },
    {
      name: "Tênis Chunky Feminino Plataforma",
      price: "R$ 159,90",
      url: "https://br.shein.com/tenis-chunky-plataforma-p-78901.html",
      image: "https://img.ltwebstatic.com/images3_pi/2024/04/15/jkl012.jpg",
      site: "Shein",
      emoji: "🥇",
      category: "Tênis",
      badges: ["Fashion"]
    },
    {
      name: "Tênis Vans Old Skool Preto",
      price: "R$ 329,90",
      url: "https://www.mercadolivre.com.br/tenis-vans-old-skool/p/MLB90123456",
      image: "https://http2.mlstatic.com/D_NQ_NP_2X_901234-MLB11223344-MNO.webp",
      site: "Mercado Livre",
      emoji: "🥈",
      category: "Tênis",
      badges: ["Skatista"]
    },
    {
      name: "Tênis Puma RS-X Colorido",
      price: "R$ 379,90",
      url: "https://www.amazon.com.br/Tenis-Puma-RSX/dp/B08TUV9012",
      image: "https://m.media-amazon.com/images/I/71YZA123BCD._AC_UL1500_.jpg",
      site: "Amazon",
      emoji: "🥉",
      category: "Tênis",
      badges: ["Moderno"]
    }
  ],

  // 🧥 JAQUETAS
  jaquetas: [
    {
      name: "Jaqueta Jeans Oversized Unissex",
      price: "R$ 189,90",
      url: "https://www.mercadolivre.com.br/jaqueta-jeans-oversized/p/MLB12345678",
      image: "https://http2.mlstatic.com/D_NQ_NP_2X_123456-MLB55667788-PQR.webp",
      site: "Mercado Livre",
      emoji: "🥇",
      category: "Jaquetas",
      badges: ["Frete Grátis", "Unissex"]
    },
    {
      name: "Jaqueta Corta-Vento Impermeável",
      price: "R$ 149,90",
      url: "https://www.amazon.com.br/Jaqueta-Corta-Vento/dp/B09WXY3456",
      image: "https://m.media-amazon.com/images/I/61EFG789HIJ._AC_UL1500_.jpg",
      site: "Amazon",
      emoji: "🥈",
      category: "Jaquetas",
      badges: ["Impermeável"]
    },
    {
      name: "Jaqueta Moletom Capuz Masculino",
      price: "R$ 129,90",
      url: "https://www.magazineluiza.com.br/jaqueta-moletom-capuz/p/012345678/",
      image: "https://a-static.mlcdn.com.br/618x463/jaqueta-moletom.jpg",
      site: "Magalu",
      emoji: "🥉",
      category: "Jaquetas",
      badges: ["Quentinha"]
    },
    {
      name: "Jaqueta Bomber Feminina Cropped",
      price: "R$ 169,90",
      url: "https://br.shein.com/jaqueta-bomber-cropped-p-45678.html",
      image: "https://img.ltwebstatic.com/images3_pi/2024/05/20/mno345.jpg",
      site: "Shein",
      emoji: "🥇",
      category: "Jaquetas",
      badges: ["Estilo"]
    },
    {
      name: "Jaqueta Couro Sintético Biker",
      price: "R$ 249,90",
      url: "https://www.mercadolivre.com.br/jaqueta-couro-sintetico/p/MLB67890123",
      image: "https://http2.mlstatic.com/D_NQ_NP_2X_678901-MLB99887766-STU.webp",
      site: "Mercado Livre",
      emoji: "🥈",
      category: "Jaquetas",
      badges: ["Rock", "Frete Grátis"]
    },
    {
      name: "Jaqueta Puffer Acolchoada Inverno",
      price: "R$ 229,90",
      url: "https://www.amazon.com.br/Jaqueta-Puffer-Acolchoada/dp/B08ZAB6789",
      image: "https://m.media-amazon.com/images/I/71KLM901NOP._AC_UL1500_.jpg",
      site: "Amazon",
      emoji: "🥉",
      category: "Jaquetas",
      badges: ["Inverno"]
    }
  ],

  // 👜 BOLSAS
  bolsas: [
    {
      name: "Bolsa Transversal Couro Feminina",
      price: "R$ 159,90",
      url: "https://www.mercadolivre.com.br/bolsa-transversal-couro/p/MLB23456789",
      image: "https://http2.mlstatic.com/D_NQ_NP_2X_234567-MLB33445566-VWX.webp",
      site: "Mercado Livre",
      emoji: "🥇",
      category: "Bolsas",
      badges: ["Frete Grátis", "Elegante"]
    },
    {
      name: "Mochila Executiva Notebook 15.6\"",
      price: "R$ 199,90",
      url: "https://www.amazon.com.br/Mochila-Executiva-Notebook/dp/B09CDE0123",
      image: "https://m.media-amazon.com/images/I/71PQR234STU._AC_UL1500_.jpg",
      site: "Amazon",
      emoji: "🥈",
      category: "Bolsas",
      badges: ["Trabalho"]
    },
    {
      name: "Bolsa Tote Shopper Grande",
      price: "R$ 129,90",
      url: "https://www.magazineluiza.com.br/bolsa-tote-shopper/p/345678901/",
      image: "https://a-static.mlcdn.com.br/618x463/bolsa-tote.jpg",
      site: "Magalu",
      emoji: "🥉",
      category: "Bolsas",
      badges: ["Espaçosa"]
    },
    {
      name: "Bolsa Mini Bucket Corrente",
      price: "R$ 89,90",
      url: "https://br.shein.com/bolsa-mini-bucket-p-89012.html",
      image: "https://img.ltwebstatic.com/images3_pi/2024/06/25/pqr678.jpg",
      site: "Shein",
      emoji: "🥇",
      category: "Bolsas",
      badges: ["Tendência", "Frete Grátis"]
    },
    {
      name: "Bolsa Carteira Clutch Festa",
      price: "R$ 79,90",
      url: "https://www.mercadolivre.com.br/bolsa-carteira-clutch/p/MLB45678901",
      image: "https://http2.mlstatic.com/D_NQ_NP_2X_456789-MLB77889900-YZA.webp",
      site: "Mercado Livre",
      emoji: "🥈",
      category: "Bolsas",
      badges: ["Festa"]
    },
    {
      name: "Mochila Vintage Lona Unissex",
      price: "R$ 149,90",
      url: "https://www.amazon.com.br/Mochila-Vintage-Lona/dp/B08FGH4567",
      image: "https://m.media-amazon.com/images/I/61VWX567YZA._AC_UL1500_.jpg",
      site: "Amazon",
      emoji: "🥉",
      category: "Bolsas",
      badges: ["Retrô"]
    }
  ]
};

/**
 * Helper: Buscar produtos por categoria
 */
export function getProductsByCategory(category: string): DemoProduct[] {
  const categoryKey = category.toLowerCase().replace(/[áàâã]/g, 'a')
                                            .replace(/[éê]/g, 'e')
                                            .replace(/[íî]/g, 'i')
                                            .replace(/[óôõ]/g, 'o')
                                            .replace(/[úû]/g, 'u')
                                            .replace(/ç/g, 'c');
  
  return demoProducts[categoryKey] || [];
}

/**
 * Helper: Buscar produtos por termo de busca
 */
export function searchProducts(query: string): DemoProduct[] {
  const searchTerm = query.toLowerCase();
  const allProducts = Object.values(demoProducts).flat();
  
  return allProducts.filter(product => 
    product.name.toLowerCase().includes(searchTerm) ||
    product.category.toLowerCase().includes(searchTerm)
  ).slice(0, 6); // Limitar a 6 resultados
}

/**
 * Helper: Obter todas as categorias disponíveis
 */
export function getCategories(): string[] {
  return [
    "Camisetas",
    "Vestidos",
    "Calças",
    "Tênis",
    "Jaquetas",
    "Bolsas"
  ];
}

/**
 * Main function for getMockProducts tool (alias for getProductsByCategory)
 * This is the function called by the AI tool in server/routes.ts
 */
export function getMockProducts(category: string): DemoProduct[] {
  return getProductsByCategory(category);
}
