export interface Product {
  id: string;
  name: string;
  category: string;
  shortDescription: string;
  fullDescription: string;
  images: string[];
  quantityOptions: {
    type: string;
    price: number;
    minOrder: number;
  }[];
  featured: boolean;
}

export const productCategories = [
  {
    id: 'skincare',
    name: 'Skincare',
    image: 'https://i.pinimg.com/736x/fc/90/cb/fc90cbd372b9f090d4aa178e68705ab2.jpg',
    description: 'Premium skincare products for all skin types'
  },
  {
    id: 'haircare',
    name: 'Haircare', 
    image: 'https://i.pinimg.com/1200x/aa/1b/51/aa1b514a77707d1376397b057b06bfa1.jpg',
    description: 'Professional hair care solutions'
  },
  {
    id: 'makeup',
    name: 'Makeup',
    image: 'https://images.pexels.com/photos/2533266/pexels-photo-2533266.jpeg?auto=compress&cs=tinysrgb&w=400',
    description: 'High-quality makeup products'
  },
  {
    id: 'fragrance',
    name: 'Fragrance',
    image: 'https://images.pexels.com/photos/1961795/pexels-photo-1961795.jpeg?auto=compress&cs=tinysrgb&w=400',
    description: 'Luxury fragrances and perfumes'
  }
];

export const products: Product[] = [
  {
    id: '1',
    name: 'Vitamin C Serum',
    category: 'skincare',
    shortDescription: 'Brightening vitamin C serum for radiant skin',
    fullDescription: 'Our premium Vitamin C Serum is formulated with 20% L-Ascorbic Acid to brighten skin, reduce dark spots, and provide antioxidant protection. Suitable for all skin types, this lightweight serum absorbs quickly and works effectively to improve skin texture and tone.',
    images: [
      'https://i.pinimg.com/1200x/aa/1b/51/aa1b514a77707d1376397b057b06bfa1.jpg',
      'https://i.pinimg.com/1200x/aa/1b/51/aa1b514a77707d1376397b057b06bfa1.jpg'
    ],
    quantityOptions: [
      { type: '1 pc', price: 850, minOrder: 1 },
      { type: '12 pcs', price: 800, minOrder: 12 },
      { type: 'Carton (48 pcs)', price: 750, minOrder: 48 }
    ],
    featured: true
  },
  {
    id: '2',
    name: 'Argan Oil Shampoo',
    category: 'haircare',
    shortDescription: 'Nourishing shampoo with pure argan oil',
    fullDescription: 'Enriched with premium Moroccan Argan Oil, this sulfate-free shampoo gently cleanses while nourishing and strengthening hair. Perfect for dry, damaged, or chemically treated hair. Leaves hair soft, shiny, and manageable.',
    images: [
      'https://i.pinimg.com/1200x/aa/1b/51/aa1b514a77707d1376397b057b06bfa1.jpg',
      'https://i.pinimg.com/1200x/aa/1b/51/aa1b514a77707d1376397b057b06bfa1.jpg'
    ],
    quantityOptions: [
      { type: '1 pc', price: 650, minOrder: 1 },
      { type: '12 pcs', price: 600, minOrder: 12 },
      { type: 'Carton (24 pcs)', price: 550, minOrder: 24 }
    ],
    featured: true
  },
  {
    id: '3',
    name: 'Matte Liquid Lipstick',
    category: 'makeup',
    shortDescription: 'Long-lasting matte liquid lipstick',
    fullDescription: 'Our highly pigmented liquid lipstick delivers intense color with a comfortable matte finish that lasts all day. The lightweight formula glides on smoothly and dries to a transfer-resistant finish. Available in 12 stunning shades.',
    images: [
      'https://i.pinimg.com/1200x/aa/1b/51/aa1b514a77707d1376397b057b06bfa1.jpg',
      'https://i.pinimg.com/1200x/aa/1b/51/aa1b514a77707d1376397b057b06bfa1.jpg'
    ],
    quantityOptions: [
      { type: '1 pc', price: 450, minOrder: 1 },
      { type: '12 pcs', price: 400, minOrder: 12 },
      { type: 'Carton (60 pcs)', price: 350, minOrder: 60 }
    ],
    featured: true
  },
  {
    id: '4',
    name: 'Rose Garden Perfume',
    category: 'fragrance',
    shortDescription: 'Elegant floral fragrance with rose notes',
    fullDescription: 'A sophisticated blend of Bulgarian rose, jasmine, and white musk creates this timeless fragrance. Perfect for the modern woman who appreciates classic elegance. Long-lasting formula with excellent sillage.',
    images: [
      'https://i.pinimg.com/1200x/aa/1b/51/aa1b514a77707d1376397b057b06bfa1.jpg',
      'https://i.pinimg.com/1200x/aa/1b/51/aa1b514a77707d1376397b057b06bfa1.jpg'
    ],
    quantityOptions: [
      { type: '1 pc', price: 1200, minOrder: 1 },
      { type: '12 pcs', price: 1100, minOrder: 12 },
      { type: 'Carton (24 pcs)', price: 1000, minOrder: 24 }
    ],
    featured: false
  },
  {
    id: '5',
    name: 'Hyaluronic Acid Moisturizer',
    category: 'skincare',
    shortDescription: 'Deep hydrating moisturizer with hyaluronic acid',
    fullDescription: 'This lightweight yet deeply hydrating moisturizer contains multiple types of hyaluronic acid to provide intense hydration at different skin levels. Suitable for all skin types, it helps maintain skin barrier function and prevents moisture loss.',
    images: [
      'https://i.pinimg.com/1200x/aa/1b/51/aa1b514a77707d1376397b057b06bfa1.jpg',
      'https://i.pinimg.com/1200x/aa/1b/51/aa1b514a77707d1376397b057b06bfa1.jpg'
    ],
    quantityOptions: [
      { type: '1 pc', price: 950, minOrder: 1 },
      { type: '12 pcs', price: 900, minOrder: 12 },
      { type: 'Carton (36 pcs)', price: 850, minOrder: 36 }
    ],
    featured: false
  },
  {
    id: '6',
    name: 'Keratin Hair Mask',
    category: 'haircare',
    shortDescription: 'Intensive repair mask with keratin protein',
    fullDescription: 'Professional-grade hair mask enriched with keratin protein to repair and strengthen damaged hair. This intensive treatment penetrates deep into the hair shaft to restore elasticity, shine, and manageability. Ideal for chemically treated or heat-damaged hair.',
    images: [
      'https://i.pinimg.com/1200x/aa/1b/51/aa1b514a77707d1376397b057b06bfa1.jpg',
      'https://i.pinimg.com/1200x/aa/1b/51/aa1b514a77707d1376397b057b06bfa1.jpg'
    ],
    quantityOptions: [
      { type: '1 pc', price: 750, minOrder: 1 },
      { type: '12 pcs', price: 700, minOrder: 12 },
      { type: 'Carton (24 pcs)', price: 650, minOrder: 24 }
    ],
    featured: false
  }
];