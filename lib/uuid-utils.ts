/**
 * UUID Utility Module for ServeOS
 * Bridges legacy mock string IDs (rst-01, item-01, cat-01) with Supabase PostgreSQL UUID requirements.
 */

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Deterministic mappings for seeded demo records
const DEMO_ID_MAP: Record<string, string> = {
  // Users
  'usr-admin-01': '00000000-0000-0000-0000-000000000001',
  'usr-owner-01': '00000000-0000-0000-0000-000000000002',
  'usr-1': '00000000-0000-0000-0000-000000000002',

  // Restaurants
  'rst-01': '00000000-0000-0000-0000-000000000010',
  'rst-1': '00000000-0000-0000-0000-000000000010',
  'la-piazza': '00000000-0000-0000-0000-000000000010',
  'rst-02': '00000000-0000-0000-0000-000000000020',
  'rst-2': '00000000-0000-0000-0000-000000000020',
  'tokyo-ramen': '00000000-0000-0000-0000-000000000020',

  // Categories
  'cat-01': '00000000-0000-0000-0000-000000000101',
  'cat-1': '00000000-0000-0000-0000-000000000101',
  'cat-02': '00000000-0000-0000-0000-000000000102',
  'cat-2': '00000000-0000-0000-0000-000000000102',
  'cat-03': '00000000-0000-0000-0000-000000000103',
  'cat-3': '00000000-0000-0000-0000-000000000103',
  'cat-04': '00000000-0000-0000-0000-000000000104',
  'cat-4': '00000000-0000-0000-0000-000000000104',
  'cat-05': '00000000-0000-0000-0000-000000000105',
  'cat-5': '00000000-0000-0000-0000-000000000105',

  // Dishes / Menu Items
  'item-01': '00000000-0000-0000-0000-000000001001',
  'item-1': '00000000-0000-0000-0000-000000001001',
  'item-02': '00000000-0000-0000-0000-000000001002',
  'item-2': '00000000-0000-0000-0000-000000001002',
  'item-03': '00000000-0000-0000-0000-000000001003',
  'item-3': '00000000-0000-0000-0000-000000001003',
  'item-04': '00000000-0000-0000-0000-000000001004',
  'item-4': '00000000-0000-0000-0000-000000001004',
  'item-05': '00000000-0000-0000-0000-000000001005',
  'item-5': '00000000-0000-0000-0000-000000001005',
  'item-06': '00000000-0000-0000-0000-000000001006',
  'item-6': '00000000-0000-0000-0000-000000001006',
  'item-07': '00000000-0000-0000-0000-000000001007',
  'item-7': '00000000-0000-0000-0000-000000001007',
  'item-08': '00000000-0000-0000-0000-000000001008',
  'item-8': '00000000-0000-0000-0000-000000001008',
};

/**
 * Checks if a string is already a syntactically valid UUID
 */
export function isValidUUID(id?: string | null): boolean {
  if (!id || typeof id !== 'string') return false;
  return UUID_REGEX.test(id.trim());
}

/**
 * Deterministically creates a valid RFC-4122 v4-formatted UUID from any string.
 * Works seamlessly in Browser, Server, and Edge environments.
 */
export function hashStringToUUID(input: string): string {
  let hash1 = 0xdeadbeef;
  let hash2 = 0x41c64e6d;
  let hash3 = 0x9e3779b9;
  let hash4 = 0x7b8d42e1;

  for (let i = 0; i < input.length; i++) {
    const ch = input.charCodeAt(i);
    hash1 = Math.imul(hash1 ^ ch, 2654435761);
    hash2 = Math.imul(hash2 ^ ch, 1597334677);
    hash3 = Math.imul(hash3 ^ ch, 2246822507);
    hash4 = Math.imul(hash4 ^ ch, 3266489909);
  }

  hash1 = (hash1 ^ (hash1 >>> 16)) >>> 0;
  hash2 = (hash2 ^ (hash2 >>> 16)) >>> 0;
  hash3 = (hash3 ^ (hash3 >>> 16)) >>> 0;
  hash4 = (hash4 ^ (hash4 >>> 16)) >>> 0;

  const hex1 = hash1.toString(16).padStart(8, '0');
  const hex2 = hash2.toString(16).padStart(8, '0');
  const hex3 = hash3.toString(16).padStart(8, '0');
  const hex4 = hash4.toString(16).padStart(8, '0');

  const combined = hex1 + hex2 + hex3 + hex4; // 32 chars

  // Format as 8-4-4-4-12 with version 4 and variant 1
  return (
    combined.slice(0, 8) +
    '-' +
    combined.slice(8, 12) +
    '-4' +
    combined.slice(13, 16) +
    '-a' +
    combined.slice(17, 20) +
    '-' +
    combined.slice(20, 32)
  );
}

/**
 * Ensures any identifier is converted to a valid PostgreSQL UUID.
 * - If already a valid UUID -> returns as is.
 * - If mapped in DEMO_ID_MAP -> returns seeded UUID.
 * - If arbitrary string -> deterministically hashes to a valid UUID.
 * - If null/undefined -> generates a standard random UUID.
 */
export function toValidUUID(id?: string | null): string {
  if (!id || typeof id !== 'string' || id.trim() === '') {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      return crypto.randomUUID();
    }
    return hashStringToUUID(`random-${Date.now()}-${Math.random()}`);
  }

  const clean = id.trim();

  // Already a valid UUID
  if (isValidUUID(clean)) {
    return clean;
  }

  // Check known map
  const mapped = DEMO_ID_MAP[clean.toLowerCase()];
  if (mapped) {
    return mapped;
  }

  // Deterministically hash
  return hashStringToUUID(clean);
}
