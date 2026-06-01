import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import type { SessionMode } from '@/types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date) {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('pt-PT', { day: '2-digit', month: 'long', year: 'numeric' });
}

export function formatTime(date: string | Date) {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' });
}

export function timeAgo(date: string | Date) {
  const d = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diff = Math.floor((now.getTime() - d.getTime()) / 1000);
  if (diff < 60) return `há ${diff} segundos`;
  if (diff < 3600) return `há ${Math.floor(diff / 60)} minutos`;
  if (diff < 86400) return `há ${Math.floor(diff / 3600)} horas`;
  return `há ${Math.floor(diff / 86400)} dias`;
}

export function getInitials(name: string) {
  return name.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase();
}

export const SESSION_MODE_LABELS: Record<SessionMode, string> = {
  presential: 'Presencial',
  online: 'Online',
  distance: 'À distância',
};

export const SESSION_STATUS_LABELS: Record<string, string> = {
  draft: 'Rascunho',
  in_progress: 'Em Curso',
  paused: 'Pausada',
  completed: 'Concluída',
  reported: 'Relatório Gerado',
};

export const SESSION_STATUS_COLORS: Record<string, string> = {
  draft: 'text-zinc-400 bg-zinc-800',
  in_progress: 'text-teal-300 bg-teal-900/50',
  paused: 'text-amber-300 bg-amber-900/50',
  completed: 'text-emerald-300 bg-emerald-900/50',
  reported: 'text-violet-300 bg-violet-900/50',
};

export const REPORT_STATUS_LABELS: Record<string, string> = {
  draft: 'Rascunho',
  in_review: 'Em Revisão',
  approved: 'Aprovado',
  shared: 'Partilhado',
};

export const REPORT_STATUS_COLORS: Record<string, string> = {
  draft: 'text-zinc-400 bg-zinc-800',
  in_review: 'text-amber-300 bg-amber-900/50',
  approved: 'text-emerald-300 bg-emerald-900/50',
  shared: 'text-sky-300 bg-sky-900/50',
};

export const CLIENT_TYPE_LABELS: Record<string, string> = {
  contact_only: 'Contacto',
  contact_with_email: 'Email',
  hub_user: 'HUB',
};

export const CLIENT_TYPE_COLORS: Record<string, string> = {
  contact_only: 'text-zinc-400 bg-zinc-800',
  contact_with_email: 'text-blue-300 bg-blue-900/50',
  hub_user: 'text-violet-300 bg-violet-900/50',
};

export const METHODOLOGY_COLORS: Record<string, string> = {
  MAP: '#8B5CF6',
  RAD_35: '#C9A84C',
  RAD_49: '#4ECDC4',
};
