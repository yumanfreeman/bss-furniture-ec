// カート管理ユーティリティ（localStorage ベース）

export type CartItem = {
  productId: string;
  productName: string;
  sku: string | null;
  unitPrice: number | null;
  quantity: number;
  imageUrl: string | null;
  categorySlug: string;
  productSlug: string;
};

const CART_KEY = "bss_cart";

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

export function getCart(): CartItem[] {
  if (!isBrowser()) return [];
  try {
    const raw = localStorage.getItem(CART_KEY);
    return raw ? (JSON.parse(raw) as CartItem[]) : [];
  } catch {
    return [];
  }
}

export const CART_UPDATE_EVENT = "bss-cart-update";

function saveCart(items: CartItem[]): void {
  if (!isBrowser()) return;
  localStorage.setItem(CART_KEY, JSON.stringify(items));
  window.dispatchEvent(new Event(CART_UPDATE_EVENT));
}

export function addToCart(item: Omit<CartItem, "quantity"> & { quantity?: number }): void {
  const cart = getCart();
  const existing = cart.find((c) => c.productId === item.productId);
  if (existing) {
    existing.quantity += item.quantity ?? 1;
    saveCart(cart);
  } else {
    saveCart([...cart, { ...item, quantity: item.quantity ?? 1 }]);
  }
}

export function updateQuantity(productId: string, quantity: number): void {
  if (quantity <= 0) {
    removeFromCart(productId);
    return;
  }
  const cart = getCart().map((c) =>
    c.productId === productId ? { ...c, quantity } : c,
  );
  saveCart(cart);
}

export function removeFromCart(productId: string): void {
  saveCart(getCart().filter((c) => c.productId !== productId));
}

export function clearCart(): void {
  if (!isBrowser()) return;
  localStorage.removeItem(CART_KEY);
}

export function getCartCount(): number {
  return getCart().reduce((sum, c) => sum + c.quantity, 0);
}
