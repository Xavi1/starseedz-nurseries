// Shared product data for Shop and ProductDetail
import { Product } from '../components/ProductCard';

export type ShopProduct = Omit<Product, 'category'> & {
  category: string[];
};

export const allProducts: ShopProduct[] = [
  {
    id: 101,
    name: 'Super Delhi Tomato Plants',
    price: 80.0,
    image: '/img/tomato.webp',
    category: ['Vegetables', 'Leafy Crops'],
    rating: 5,
    isBestSeller: true,
  },
  {
    id: 102,
    name: 'Chive',
    price: 60.0,
    image: '/img/chives.webp',
    category: ['Herbs'],
    rating: 4,
  },
  {
    id: 103,
    name: 'Fine Thyme',
    price: 60.0,
    image: '/img/thyme.webp',
    category: ['Herbs'],
    rating: 4,
  },
  {
    id: 104,
    name: 'Pimento',
    price: 60.0,
    image: '/img/pimento.webp',
    category: ['Peppers'],
    rating: 5,
  },
  {
    id: 105,
    name: 'Chilli pepper',
    price: 60.0,
    image: '/img/chilli.webp',
    category: ['Peppers'],
    rating: 4,
    isNew: true,
  },
  {
    id: 106,
    name: 'Kale',
    price: 50.0,
    image: '/img/kale.webp',
    category: ['Vegetables', 'Leafy Crops'],
    rating: 4,
  },
  {
    id: 1,
    name: 'Monstera Deliciosa',
    price: 39.99,
    image: 'https://images.unsplash.com/photo-1614594975525-e45190c55d0b?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
    category: ['Vegetables'],
    rating: 5,
    isBestSeller: true,
  },
  {
    id: 6,
    name: 'Rosemary Herb',
    price: 29.99,
    image: 'https://images.unsplash.com/photo-1515586000433-45406d8e6662?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
    category: ['Herbs'],
    rating: 3,
  },
  {
    id: 15,
    name: 'Basil Herb Plant',
    price: 30.0,
    image: '/img/basil.webp',
    category: ['Herbs'],
    rating: 4,
  },
  {
    id: 16,
    name: 'Mint Herb Plant',
    price: 29.99,
    image: 'https://images.unsplash.com/photo-1628556270448-4d4e4148e1b1?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
    category: ['Herbs'],
    rating: 3,
  },
];
