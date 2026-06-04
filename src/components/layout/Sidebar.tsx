import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Calendar, Users, FileText, BookOpen,
  Layers, User, ChevronLeft, ChevronRight, Zap, X, Award, LogOut, Library,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { METHODOLOGIES } from '@/data/mock-data';
import { useAuth } from '@/lib/auth/AuthProvider';
import { isSupabaseMode } from '@/lib/dataMode';

const pendingCerts = METHODOLOGIES.filter(m => m.certificationStatus === 'pending').length;

const NAV_ITEMS = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard', badge: 0 },
  { to: '/sessions', icon: Calendar, label: 'Sessões', badge: 0 },
  { to: '/clients', icon: Users, label: 'Clientes', badge: 0 },
  { to: '/reports', icon: FileText, label: 'Relatórios', badge: 0 },
  { to: '/templates', icon: Layers, label: 'Templates', badge: 0 },
  { to: '/resources', icon: Library, label: 'Recursos', badge: 0 },
  { to: '/specialties', icon: BookOpen, label: 'Especialidades', badge: 0 },
  { to: '/certifications', icon: Award, label: 'Especialidades e Certs', badge: pendingCerts },
];

const BOTTOM_ITEMS = [
  { to: '/profile', icon: User, label: 'Perfil' },
];

interface SidebarProps {
  collapsed?: boolean;
  onToggle?: () => void;
  mobile?: boolean;
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

export function Sidebar({ collapsed, onToggle, mobile, mobileOpen, onMobileClose }: SidebarProps) {
  const location = useLocation().pathname;
  const { signOut } = useAuth();
  const supabaseMode = isSupabaseMode();

  const handleSignOut = async () => {
    if (!supabaseMode) return;
    try {
      await signOut();
    } catch {
      // signOut clears local state before throwing; guard still blocks protected routes
    }
    if (mobile) onMobileClose?.();
  };

  const isActive = (to: string) => {
    if (to === '/dashboard') return location === '/dashboard' || location === '/';
    return location.startsWith(to);
  };

  const sidebarContent = (
    <>
      <div className={cn(
        'flex items-center border-b border-[var(--color-border)] shrink-0',
        collapsed ? 'px-3 py-4 justify-center' : 'px-5 py-4 gap-3',
      )}>
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-600 to-amber-800 flex items-center justify-center shrink-0">
          <Zap size={16} className="text-amber-100" />
        </div>
        {!collapsed && (
          <div>
            <div className="font-cinzel text-sm font-bold text-gold-gradient">RADIONICS</div>
            <div className="text-[10px] text-[var(--color-text-tertiary)] font-inter">ByElamor</div>
          </div>
        )}
      </div>

      <nav className="flex-1 overflow-y-auto px-2 py-3 space-y-0.5">
        {NAV_ITEMS.map(({ to, icon: Icon, label, badge }) => (
          <Link
            key={to}
            to={to}
            onClick={mobile ? onMobileClose : undefined}
            title={collapsed ? label : undefined}
            className={cn(
              'nav-link',
              isActive(to) && 'active',
              collapsed && 'justify-center px-2',
            )}
          >
            <span className="relative shrink-0">
              <Icon size={17} className="nav-icon" />
              {badge > 0 && collapsed && (
                <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-amber-500" />
              )}
            </span>
            {!collapsed && <span className="flex-1">{label}</span>}
            {!collapsed && badge > 0 && (
              <span className="ml-auto min-w-[18px] h-[18px] px-1 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 text-[10px] font-bold flex items-center justify-center">
                {badge}
              </span>
            )}
          </Link>
        ))}
      </nav>

      <div className="px-2 py-3 border-t border-[var(--color-border)] space-y-0.5">
        {BOTTOM_ITEMS.map(({ to, icon: Icon, label }) => (
          <Link
            key={to}
            to={to}
            onClick={mobile ? onMobileClose : undefined}
            className={cn(
              'nav-link',
              isActive(to) && 'active',
              collapsed && 'justify-center px-2',
            )}
          >
            <Icon size={17} className="shrink-0" />
            {!collapsed && <span>{label}</span>}
          </Link>
        ))}

        {supabaseMode && (
          <button
            type="button"
            onClick={handleSignOut}
            title={collapsed ? 'Terminar sessão' : undefined}
            className={cn(
              'nav-link w-full text-red-400 hover:text-red-300 hover:bg-red-900/20',
              collapsed && 'justify-center px-2',
            )}
          >
            <LogOut size={17} className="shrink-0" />
            {!collapsed && <span>Terminar sessão</span>}
          </button>
        )}

        {!mobile && (
          <button type="button" onClick={onToggle} className="nav-link w-full">
            {collapsed ? <ChevronRight size={17} className="shrink-0" /> : (
              <>
                <ChevronLeft size={17} className="shrink-0" />
                <span>Recolher</span>
              </>
            )}
          </button>
        )}
      </div>
    </>
  );

  if (mobile) {
    return (
      <>
        {mobileOpen && (
          <div className="fixed inset-0 z-40 bg-black/60" onClick={onMobileClose} />
        )}
        <aside className={cn(
          'fixed top-0 left-0 bottom-0 z-50 w-64 flex flex-col',
          'bg-[var(--color-surface-0)] border-r border-[var(--color-border)]',
          'transition-transform duration-300',
          mobileOpen ? 'translate-x-0' : '-translate-x-full',
        )}>
          <div className="absolute top-4 right-4">
            <button type="button" onClick={onMobileClose} className="p-1.5 rounded-lg hover:bg-[var(--color-surface-2)] text-[var(--color-text-tertiary)]">
              <X size={16} />
            </button>
          </div>
          {sidebarContent}
        </aside>
      </>
    );
  }

  return (
    <aside className={cn(
      'hidden lg:flex flex-col h-full',
      'bg-[var(--color-surface-0)] border-r border-[var(--color-border)]',
      'transition-all duration-200',
      collapsed ? 'w-16' : 'w-56',
    )}>
      {sidebarContent}
    </aside>
  );
}
