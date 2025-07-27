// Script to populate Firestore 'products' collection from allProducts array
// Usage: node scripts/populateProducts.js


import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc } from 'firebase/firestore';
import { allProducts } from '../src/data/products.js';
import firebaseConfig from '../src/firebaseConfig.js';


// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function main() {
  for (const product of allProducts) {
    // Map to Firestore structure
    const docId = String(product.id);
    const data = {
      name: product.name,
      price: product.price,
      imageUrl: product.image || '',
      category: Array.isArray(product.category) ? product.category[0] : (product.category || ''),
      description: product.description || '',
      stock: typeof product.stock === 'number' ? product.stock : 100,
      createdAt: new Date(),
    };
    try {
      await setDoc(doc(db, 'products', docId), data);
      console.log(`Added product: ${docId} (${product.name})`);
    } catch (err) {
      console.error(`Error adding product ${docId}:`, err);
    }
  }
  console.log('Done!');
}

main();
