/**
 * Clients service — in-memory store (Phase 3A).
 * Supabase persistence is not wired yet; same store is used in all VITE_DATA_MODE values.
 */

import { CLIENTS } from '@/data/mock-data';
import type { Client } from '@/types';

const delay = (ms = 80) => new Promise<void>(r => setTimeout(r, ms));

let clientsStore: Client[] = CLIENTS.map(c => ({ ...c }));

export async function listClients(): Promise<Client[]> {
  await delay();
  return clientsStore.map(c => ({ ...c }));
}

export async function getClientById(id: string): Promise<Client | undefined> {
  await delay();
  const client = clientsStore.find(c => c.id === id);
  return client ? { ...client } : undefined;
}

export function resetClientsStore(): void {
  clientsStore = CLIENTS.map(c => ({ ...c }));
}
