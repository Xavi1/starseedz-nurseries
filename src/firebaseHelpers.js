// Update product
export const updateProduct = async (productId, productData) => {
  const productRef = doc(db, "products", productId);
  await updateDoc(productRef, productData);
};
// Update user profile
export const updateUserProfile = async (userId, profileData) => {
  const userRef = doc(db, "users", userId);
  await updateDoc(userRef, profileData);
};
import {
  collection,
  addDoc,
  getDocs,
  getDoc,
  doc,
  updateDoc,
  setDoc,
  query,
  where,
  Timestamp
} from "firebase/firestore";
import { db } from "./firebaseConfig";

// USERS
export const createUser = async (user) => {
  const usersRef = collection(db, "users");
  const docRef = await addDoc(usersRef, {
    ...user,
    createdAt: Timestamp.now()
  });
  return docRef.id;
};

export const getUserById = async (userId) => {
  const userRef = doc(db, "users", userId);
  const userSnap = await getDoc(userRef);
  return userSnap.exists() ? userSnap.data() : null;
};

// PRODUCTS
export const addProduct = async (product) => {
  // Use product.id as the Firestore document ID
  const productRef = doc(db, "products", product.id);
  await setDoc(productRef, {
    ...product,
    createdAt: Timestamp.now()
  });
  return product.id;
};

export const getAllProducts = async () => {
  const productsRef = collection(db, "products");
  const querySnapshot = await getDocs(productsRef);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const getProductById = async (productId) => {
  const productRef = doc(db, "products", productId);
  const productSnap = await getDoc(productRef);
  return productSnap.exists() ? productSnap.data() : null;
};

// ORDERS
export const createOrder = async (order) => {
  const ordersRef = collection(db, "orders");
  const docRef = await addDoc(ordersRef, {
    ...order,
    status: "pending",
    createdAt: Timestamp.now()
  });
  return docRef.id;
};

export const getOrdersByUser = async (userId) => {
  const ordersRef = collection(db, "orders");
  const q = query(ordersRef, where("userId", "==", userId));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

// REVIEWS
export const addReview = async (review) => {
  const reviewsRef = collection(db, "reviews");
  const docRef = await addDoc(reviewsRef, {
    ...review,
    createdAt: Timestamp.now()
  });
  return docRef.id;
};

export const getReviewsByProduct = async (productId) => {
  const reviewsRef = collection(db, "reviews");
  const q = query(reviewsRef, where("productId", "==", productId));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};