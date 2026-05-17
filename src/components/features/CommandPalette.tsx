import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppTranslation } from '../../hooks/useAppTranslation';
import { useAuth } from '../../context/AuthContext';
import { HiOutlineMagnifyingGlass, HiOutlineCommandLine } from 'react-icons/hi2';

export interface CommandItem {
  id: string;
  label: string;
  href: string;
  group: string;
  keywords?: string;
}

interface CommandPaletteProps {
  open: boolean;
  onClose: () => void;
}

export function CommandPalette({ open, onClose }: CommandPaletteProps) {
  const { t } = useAppTranslation();
  const navigate = useNavigate();
  const { state } = useAuth();
  const role = state.user?.role;
  const [query, setQuery] = useState('');

  const items = useMemo<CommandItem[]>(() => {
    const base: CommandItem[] = [
      { id: 'home', label: t('nav.dashboard'), href: '/', group: t('nav.dashboard') },
      { id: 'mentors', label: t('nav.mentors'), href: '/mentors', group: 'Navigate', keywords: 'mentor' },
      { id: 'mentees', label: t('nav.mentees'), href: '/mentees', group: 'Navigate', keywords: 'mentee student' },
      { id: 'groups', label: t('nav.groups'), href: '/groups', group: 'Navigate' },
      { id: 'schedule', label: t('nav.schedule'), href: '/schedule', group: 'Navigate' },
      { id: 'slots', label: t('nav.slots'), href: '/slots', group: 'Navigate' },
      { id: 'sessions', label: t('nav.sessions'), href: '/session-logs', group: 'Navigate' },
      { id: 'analytics', label: t('nav.analytics'), href: '/analytics', group: 'Navigate' },
      { id: 'insights', label: t('nav.insights', 'AI Insights'), href: '/insights', group: 'Navigate', keywords: 'smart match ai' },
      { id: 'testimonials', label: t('nav.testimonials'), href: '/testimonials', group: 'Navigate' },
      { id: 'add-mentor', label: t('mentor.addMentor'), href: '/mentors/add', group: 'Actions', keywords: 'create new' },
      { id: 'add-mentee', label: t('mentee.addMentee'), href: '/mentees/add', group: 'Actions', keywords: 'create new' },
    ];

    if (role === 'mentor' || role === 'admin') {
      base.push({
        id: 'applications',
        label: t('nav.applications'),
        href: '/applications',
        group: 'Navigate',
      });
    }

    if (role === 'admin') {
      base.push(
        { id: 'export', label: t('nav.export'), href: '/admin/export', group: 'Admin' },
        { id: 'invite', label: t('nav.invites'), href: '/admin/invite', group: 'Admin' },
        { id: 'notifications', label: t('nav.notifications'), href: '/admin/notifications', group: 'Admin' }
      );
    }

    return base;
  }, [role, t]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter(
      (item) =>
        item.label.toLowerCase().includes(q) ||
        item.href.toLowerCase().includes(q) ||
        item.keywords?.toLowerCase().includes(q)
    );
  }, [items, query]);

  const grouped = useMemo(() => {
    const map = new Map<string, CommandItem[]>();
    filtered.forEach((item) => {
      const list = map.get(item.group) ?? [];
      list.push(item);
      map.set(item.group, list);
    });
    return map;
  }, [filtered]);

  useEffect(() => {
    if (!open) setQuery('');
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  const run = (href: string) => {
    navigate(href);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-start justify-center pt-[12vh] px-4">
      <button type="button" className="absolute inset-0 overlay-backdrop" aria-label="Close" onClick={onClose} />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={t('command.title', 'Command menu')}
        className="relative w-full max-w-lg rounded-xl modal-panel overflow-hidden animate-scale-in"
      >
        <div className="flex items-center gap-3 border-b px-4 py-3" style={{ borderColor: 'var(--border-default)' }}>
          <HiOutlineMagnifyingGlass className="h-5 w-5 text-muted shrink-0" />
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t('command.placeholder', 'Search pages and actions…')}
            className="flex-1 bg-transparent text-sm text-primary outline-none placeholder:text-muted"
          />
          <kbd className="hidden sm:inline-flex search-trigger px-1.5 py-0.5 text-[10px] font-medium rounded">esc</kbd>
        </div>
        <div className="max-h-[50vh] overflow-y-auto p-2">
          {filtered.length === 0 ? (
            <p className="px-3 py-8 text-center text-sm text-muted">{t('command.empty', 'No results')}</p>
          ) : (
            Array.from(grouped.entries()).map(([group, groupItems]) => (
              <div key={group} className="mb-2">
                <p className="px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-muted">{group}</p>
                <ul>
                  {groupItems.map((item) => (
                    <li key={item.id}>
                      <button type="button" onClick={() => run(item.href)} className="cmd-item">
                        {item.label}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ))
          )}
        </div>
        <div
          className="flex items-center gap-2 px-4 py-2 text-[10px] text-muted"
          style={{ borderTop: '1px solid var(--border-default)' }}
        >
          <HiOutlineCommandLine className="h-3.5 w-3.5" />
          <span>{t('command.hint', '↑↓ navigate · Enter open · Esc close')}</span>
        </div>
      </div>
    </div>
  );
}

export function useCommandPalette() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setOpen((v) => !v);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return { open, setOpen, onClose: () => setOpen(false) };
}
