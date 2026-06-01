/** Centralized external URLs with RADIONICS fallbacks. */

const DEFAULT_HELP_URL = 'https://help.byelamor.com/help/articles?app=radionics';
const DEFAULT_SUPPORT_CHAT_URL = 'https://help.byelamor.com/chat?app=radionics';

export function getHelpUrl(): string {
  const url = import.meta.env.VITE_HELP_URL as string | undefined;
  return url?.trim() || DEFAULT_HELP_URL;
}

export function getSupportChatUrl(): string | undefined {
  const url = import.meta.env.VITE_SUPPORT_CHAT_URL as string | undefined;
  return url?.trim() || DEFAULT_SUPPORT_CHAT_URL;
}

export function getSupportEmail(): string | undefined {
  const email = import.meta.env.VITE_SUPPORT_EMAIL as string | undefined;
  return email?.trim() || undefined;
}
