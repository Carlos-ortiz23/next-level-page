/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Product } from '../types';

const BASE_URL = 'https://script.google.com/macros/s/AKfycbzFQP33quxOUC2Tq3TwQ8Qdme5Ipt3t3elvP2sSrrpACs7B0yPBwys70S2E9oaM_08r8Q/exec';

// Cache in memory to make the UI ultra-fast and avoid redundant API hits
let cachedProducts: Product[] | null = null;
let cachedCategories: string[] | null = null;

// Persistent fallback cache: if the Apps Script API is slow or down, the catalog
// still renders with the last successful data instead of showing an error screen.
const STORAGE_KEY = 'nl_catalog_cache_v1';

interface StoredCatalog {
  products?: Product[];
  categories?: string[];
  savedAt?: number;
}

function readStoredCatalog(): StoredCatalog | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return null;
    return parsed as StoredCatalog;
  } catch {
    return null;
  }
}

function writeStoredCatalog(patch: StoredCatalog): void {
  try {
    const current = readStoredCatalog() || {};
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...current, ...patch, savedAt: Date.now() }));
  } catch {
    // Storage full or unavailable (private mode) — the app still works without it
  }
}

// Fetch with timeout + retry so a hung Apps Script request never leaves the UI loading forever
async function fetchJson(url: string, timeoutMs = 15000, retries = 1): Promise<any> {
  for (let attempt = 0; ; attempt++) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const response = await fetch(url, { signal: controller.signal });
      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status}`);
      }
      return await response.json();
    } catch (err) {
      if (attempt >= retries) throw err;
      await new Promise(resolve => setTimeout(resolve, 800 * (attempt + 1)));
    } finally {
      clearTimeout(timer);
    }
  }
}

// Safe parser to convert raw API response items to type-safe Product objects
function parseProduct(raw: any): Product {
  const getBool = (val: any): boolean => {
    if (typeof val === 'boolean') return val;
    if (typeof val === 'string') {
      const lower = val.toLowerCase().trim();
      return lower === 'true' || lower === '1' || lower === 'si' || lower === 'yes' || lower === 'activo';
    }
    if (typeof val === 'number') return val === 1;
    return false;
  };

  const getNum = (val: any, fallback = 0): number => {
    if (typeof val === 'number') return val;
    if (typeof val === 'string') {
      const clean = val.replace(/[^0-9.-]/g, '');
      const parsed = parseFloat(clean);
      return isNaN(parsed) ? fallback : parsed;
    }
    return fallback;
  };

  const getArray = (val: any): string[] => {
    if (!val) return [];
    if (Array.isArray(val)) return val.map(v => String(v).trim()).filter(Boolean);
    if (typeof val === 'string') {
      return val.split(',')
        .map(v => v.trim())
        .filter(Boolean);
    }
    return [String(val).trim()];
  };

  // Collect images safely
  const imagenes: string[] = [];
  for (let i = 1; i <= 5; i++) {
    const key = `imagen${i}`;
    if (raw[key] && typeof raw[key] === 'string' && raw[key].trim().startsWith('http')) {
      imagenes.push(raw[key].trim());
    }
  }

  // Fallback placeholder image if none found or format invalid
  if (imagenes.length === 0) {
    imagenes.push('https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=1000&auto=format&fit=crop');
  }

  return {
    id: String(raw.id || '').trim(),
    nombre: String(raw.nombre || '').trim(),
    categoria: String(raw.categoria || '').trim(),
    genero: String(raw.genero || '').trim().toLowerCase(),
    marca: String(raw.marca || '').trim(),
    precio: getNum(raw.precio),
    descripcion: String(raw.descripcion || '').trim(),
    color: String(raw.color || '').trim(),
    tallas: getArray(raw.tallas),
    stock: getNum(raw.stock),
    disponible: raw.disponible !== undefined ? getBool(raw.disponible) : true,
    nuevo: getBool(raw.nuevo),
    destacado: getBool(raw.destacado),
    etiquetas: getArray(raw.etiquetas),
    orden: getNum(raw.orden, 999),
    imagenes,
    fecha_ingreso: String(raw.fecha_ingreso || ''),
    activo: raw.activo !== undefined ? getBool(raw.activo) : true,
  };
}

export const CatalogService = {
  /**
   * Fetches all products and normalizes them.
   */
  async getProducts(forceRefresh = false): Promise<Product[]> {
    if (cachedProducts && !forceRefresh) {
      return cachedProducts;
    }

    try {
      const data = await fetchJson(`${BASE_URL}?action=productos`);

      let rawList: any[] = [];
      if (Array.isArray(data)) {
        rawList = data;
      } else if (data && Array.isArray(data.data)) {
        rawList = data.data;
      } else if (data && typeof data === 'object') {
        // Look for any array property
        const foundArray = Object.values(data).find(val => Array.isArray(val));
        if (foundArray) {
          rawList = foundArray as any[];
        }
      }

      // Filter only active and available products, then sort by 'orden'
      const products = rawList
        .map(parseProduct)
        .filter(p => p.activo && p.id)
        .sort((a, b) => a.orden - b.orden);

      cachedProducts = products;
      writeStoredCatalog({ products });
      return products;
    } catch (error) {
      console.error('Error fetching products:', error);
      // Fallback chain: memory cache → localStorage → error
      if (cachedProducts) return cachedProducts;
      const stored = readStoredCatalog();
      if (stored?.products && stored.products.length > 0) {
        cachedProducts = stored.products;
        return stored.products;
      }
      throw error;
    }
  },

  /**
   * Fetches categories directly from the API or infers them from products.
   */
  async getCategories(forceRefresh = false): Promise<string[]> {
    if (cachedCategories && !forceRefresh) {
      return cachedCategories;
    }

    try {
      const data = await fetchJson(`${BASE_URL}?action=categorias`);

      let categoriesList: string[] = [];
      if (Array.isArray(data)) {
        categoriesList = data.map(c => String(c).trim()).filter(Boolean);
      } else if (data && Array.isArray(data.data)) {
        categoriesList = data.data.map((c: any) => typeof c === 'object' ? String(c.nombre || c.categoria || '') : String(c)).map((s: string) => s.trim()).filter(Boolean);
      } else if (data && typeof data === 'object') {
        const foundArray = Object.values(data).find(val => Array.isArray(val));
        if (foundArray) {
          categoriesList = (foundArray as any[]).map(c => typeof c === 'object' ? String(c.nombre || c.categoria || '') : String(c)).map(s => s.trim()).filter(Boolean);
        }
      }

      // If categories from API is empty, infer from products
      if (categoriesList.length === 0) {
        const products = await this.getProducts(forceRefresh);
        const unique = new Set<string>(products.map(p => p.categoria));
        categoriesList = Array.from(unique) as string[];
      }

      cachedCategories = categoriesList;
      writeStoredCatalog({ categories: categoriesList });
      return categoriesList;
    } catch (error) {
      console.error('Error fetching categories, falling back to inferred:', error);
      const stored = readStoredCatalog();
      if (stored?.categories && stored.categories.length > 0) {
        cachedCategories = stored.categories;
        return stored.categories;
      }
      try {
        const products = await this.getProducts();
        const unique = new Set<string>(products.map(p => p.categoria));
        return Array.from(unique) as string[];
      } catch (err) {
        // Last resort: no API, no cache — an empty list still renders the catalog shell
        return [];
      }
    }
  },

  /**
   * Fetches featured products.
   */
  async getFeaturedProducts(): Promise<Product[]> {
    try {
      const all = await this.getProducts();
      return all.filter(p => p.destacado);
    } catch {
      return [];
    }
  },

  /**
   * Fetches new products.
   */
  async getNewProducts(): Promise<Product[]> {
    try {
      const all = await this.getProducts();
      return all.filter(p => p.nuevo);
    } catch {
      return [];
    }
  },

  /**
   * Fetches an individual product by ID.
   */
  async getProductById(id: string): Promise<Product | null> {
    try {
      // First check cache
      if (cachedProducts) {
        const found = cachedProducts.find(p => p.id === id);
        if (found) return found;
      }

      // Query product detail
      const data = await fetchJson(`${BASE_URL}?action=producto&id=${encodeURIComponent(id)}`);
      if (!data) return null;

      // Handle item structure
      const rawItem = Array.isArray(data) ? data[0] : (data.data && Array.isArray(data.data) ? data.data[0] : data);
      return parseProduct(rawItem);
    } catch (error) {
      console.error(`Error fetching product ${id}:`, error);
      // Fallback to cache search
      const all = await this.getProducts();
      return all.find(p => p.id === id) || null;
    }
  },

  /**
   * Generates WhatsApp checkout link.
   */
  getWhatsAppLink(product: Product, selectedSize?: string): string {
    const phoneNumber = '573008000029'; // Format without '+' for WhatsApp API
    const priceFormatted = new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(product.precio);

    let message = `Hola, estoy interesado en este producto.\n\n`;
    message += `🛍️ *Producto:* ${product.nombre}\n`;
    message += `🏷️ *Marca:* ${product.marca}\n`;
    message += `💰 *Precio:* ${priceFormatted}\n`;
    message += `🆔 *ID:* ${product.id}\n`;
    if (product.color) {
      message += `🎨 *Color:* ${product.color}\n`;
    }
    if (selectedSize) {
      message += `📏 *Talla seleccionada:* ${selectedSize}\n`;
    }
    message += `\n¿Está disponible para envío?`;

    const encodedMessage = encodeURIComponent(message);
    return `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
  }
};
