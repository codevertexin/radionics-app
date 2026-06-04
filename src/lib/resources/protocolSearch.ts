import type { MethodologyAsset, MethodologyProtocol } from '@/types';
import { matchAssetSearch, normalizeResourceSearchText } from '@/lib/resources/resourceSearch';

export interface ProtocolWithLinkedAssets extends MethodologyProtocol {
  linkedAssets: MethodologyAsset[];
}

function matchProtocolFields(query: string, protocol: MethodologyProtocol): boolean {
  const q = normalizeResourceSearchText(query);
  if (!q) return true;

  if (normalizeResourceSearchText(protocol.name).includes(q)) return true;
  if (normalizeResourceSearchText(protocol.code).includes(q)) return true;
  if (protocol.description && normalizeResourceSearchText(protocol.description).includes(q)) {
    return true;
  }
  if (protocol.whyActivate && normalizeResourceSearchText(protocol.whyActivate).includes(q)) {
    return true;
  }
  return false;
}

/** Match protocol name, description, why_activate, and linked asset naming fields. */
export function matchProtocolWithAssets(
  query: string,
  protocol: MethodologyProtocol,
  linkedAssets: MethodologyAsset[],
): boolean {
  const q = query.trim();
  if (!q) return true;
  if (matchProtocolFields(q, protocol)) return true;

  return linkedAssets.some(asset => matchAssetSearch(q, asset) !== null);
}

export function searchProtocols(
  query: string,
  protocols: ProtocolWithLinkedAssets[],
): ProtocolWithLinkedAssets[] {
  const q = query.trim();
  if (!q) return protocols;
  return protocols.filter(p => matchProtocolWithAssets(q, p, p.linkedAssets));
}
