import { CircleHelp, LogOut, Menu, MessageCircle } from 'lucide-react';
import { getHelpUrl, getSupportChatUrl, getSupportEmail } from '@/lib/appUrls';
import { cn } from '@/lib/utils';
import { useAuth } from '@/lib/auth/AuthProvider';
import { isSupabaseMode } from '@/lib/dataMode';

function getGreetingName(user: ReturnType<typeof useAuth>['user']): string | null {
  if (!user) return null;
  const fullName = user.user_metadata?.full_name;
  if (typeof fullName === 'string' && fullName.trim()) return fullName.trim();
  if (user.email) return user.email.split('@')[0];
  return null;
}

function openExternal(url: string | undefined) {
  if (!url) return;
  window.open(url, '_blank', 'noopener,noreferrer');
}

interface AppBarProps {
  onMenuClick?: () => void;
  showMenuButton?: boolean;
}

export function AppBar({ onMenuClick, showMenuButton }: AppBarProps) {
  const { user, signOut } = useAuth();
  const displayName = getGreetingName(user);
  const showDevBadge = import.meta.env.DEV;
  const envLabel = isSupabaseMode() ? 'SUPABASE DEV' : 'MOCK MODE';

  const handleHelp = () => openExternal(getHelpUrl());
  const handleSupport = () => {
    const chatUrl = getSupportChatUrl();
    if (chatUrl) {
      openExternal(chatUrl);
      return;
    }
    const email = getSupportEmail();
    if (email) {
      window.open(`mailto:${email}`, '_blank', 'noopener,noreferrer');
    }
  };

  const handleLogout = async () => {
    try {
      await signOut();
    } catch {
      // signOut clears local state; guard handles redirect in supabase mode
    }
  };

  return (
    <header
      className={cn(
        'shrink-0 flex items-center gap-2 sm:gap-3 md:gap-4',
        'h-12 md:h-14 px-3 sm:px-4 md:px-5',
        'border-b border-[var(--color-border)] bg-[var(--color-surface-0)]',
      )}
    >
      {/* Left: menu + greeting */}
      <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
        {showMenuButton && (
          <button
            type="button"
            onClick={onMenuClick}
            className="lg:hidden p-2 -ml-1 rounded-lg hover:bg-[var(--color-surface-2)] text-[var(--color-text-secondary)] transition-colors shrink-0"
            aria-label="Abrir menu"
          >
            <Menu size={18} />
          </button>
        )}
        <p className="text-sm md:text-base font-medium text-[var(--color-text-primary)] truncate">
          {displayName ? (
            <>
              Olá, <span className="text-[var(--color-gold)]">{displayName}</span>
            </>
          ) : (
            'Olá'
          )}
        </p>
      </div>

      {/* Center: dev environment badge */}
      {showDevBadge && (
        <div className="hidden sm:flex flex-1 justify-center px-2">
          <span
            className={cn(
              'text-[10px] font-semibold tracking-wider uppercase px-2.5 py-1 rounded-full border',
              isSupabaseMode()
                ? 'text-sky-300 bg-sky-900/25 border-sky-700/40'
                : 'text-amber-300 bg-amber-900/25 border-amber-700/40',
            )}
          >
            {envLabel}
          </span>
        </div>
      )}

      {/* Right: actions */}
      <div className="flex items-center gap-0.5 sm:gap-1 md:gap-2 shrink-0">
        {showDevBadge && (
          <span
            className={cn(
              'sm:hidden text-[9px] font-semibold tracking-wide uppercase px-1.5 py-0.5 rounded border mr-1',
              isSupabaseMode()
                ? 'text-sky-300 bg-sky-900/25 border-sky-700/40'
                : 'text-amber-300 bg-amber-900/25 border-amber-700/40',
            )}
          >
            {isSupabaseMode() ? 'SB' : 'MOCK'}
          </span>
        )}

        <AppBarAction
          label="Help"
          icon={<CircleHelp size={17} />}
          onClick={handleHelp}
          disabled={false}
        />
        <AppBarAction
          label="Support"
          icon={<MessageCircle size={17} />}
          onClick={handleSupport}
          disabled={!getSupportChatUrl() && !getSupportEmail()}
        />
        <AppBarAction
          label="Logout"
          icon={<LogOut size={17} />}
          onClick={handleLogout}
          variant="danger"
        />
      </div>
    </header>
  );
}

function AppBarAction({
  label,
  icon,
  onClick,
  disabled,
  variant = 'default',
}: {
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  variant?: 'default' | 'danger';
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={label}
      className={cn(
        'inline-flex items-center gap-1.5 rounded-lg transition-colors',
        'px-2 py-1.5 sm:px-2.5 sm:py-2',
        'disabled:opacity-40 disabled:cursor-not-allowed',
        variant === 'danger'
          ? 'text-[var(--color-text-muted)] hover:text-red-400 hover:bg-red-900/20'
          : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-surface-2)]',
      )}
    >
      <span className="shrink-0">{icon}</span>
      <span className="hidden md:inline text-xs font-medium">{label}</span>
    </button>
  );
}
