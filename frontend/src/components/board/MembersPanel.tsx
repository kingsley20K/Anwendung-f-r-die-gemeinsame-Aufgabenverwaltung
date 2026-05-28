import { useState, useEffect } from 'react';
import { useAuthStore } from '../../store/authStore';
import { useBoardStore } from '../../store/boardStore';
import * as membersApi from '../../api/endpoints/members.api';
import { listAllUsers } from '../../api/endpoints/auth.api';
import type { BoardMember } from '../../types';

interface Props {
  boardId: string;
  ownerId: string;
  onClose: () => void;
}

interface UserRow {
  id: string;
  displayName: string;
  email: string;
  role: 'owner' | 'member' | null; // null = not a member
}

export function MembersPanel({ boardId, ownerId, onClose }: Props) {
  const { user }          = useAuthStore();
  const { presenceUsers } = useBoardStore();
  const isOwner = user?.id === ownerId;

  const [rows, setRows]       = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [acting, setActing]   = useState<string | null>(null); // userId being added/removed

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const [{ users }, { members }] = await Promise.all([
          listAllUsers(),
          membersApi.listMembers(boardId),
        ]);
        const memberMap = new Map<string, 'owner' | 'member'>(
          members.map((m: BoardMember) => [m.id, m.role]),
        );
        const combined: UserRow[] = users.map((u) => ({
          id:          u.id,
          displayName: u.displayName,
          email:       u.email,
          role:        memberMap.get(u.id) ?? null,
        }));
        // Sort: owner first, then members, then non-members; within groups alphabetical
        combined.sort((a, b) => {
          const rank = (r: UserRow['role']) => r === 'owner' ? 0 : r === 'member' ? 1 : 2;
          if (rank(a.role) !== rank(b.role)) return rank(a.role) - rank(b.role);
          return a.displayName.localeCompare(b.displayName);
        });
        setRows(combined);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [boardId]);

  function isOnline(userId: string) {
    if (userId === user?.id) return true;
    return presenceUsers.some((p) => p.userId === userId);
  }

  async function handleAdd(userId: string) {
    setActing(userId);
    try {
      const member = await membersApi.addMember(boardId, { userId });
      setRows((prev) =>
        prev.map((r) => r.id === userId ? { ...r, role: member.role } : r),
      );
    } catch (err) {
      console.error(err);
    } finally {
      setActing(null);
    }
  }

  async function handleRemove(userId: string) {
    setActing(userId);
    try {
      await membersApi.removeMember(boardId, userId);
      setRows((prev) =>
        prev.map((r) => r.id === userId ? { ...r, role: null } : r),
      );
    } catch (err) {
      console.error(err);
    } finally {
      setActing(null);
    }
  }

  function initials(name: string) {
    return name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase();
  }

  const onlineCount  = rows.filter((r) => isOnline(r.id)).length;
  const memberCount  = rows.filter((r) => r.role !== null).length;

  return (
    <div
      className="fixed inset-0 bg-black/40 z-50 flex items-start justify-end p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-xl w-full max-w-sm flex flex-col mt-14 mr-2 max-h-[80vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div>
            <h2 className="font-semibold text-gray-800">Utilisateurs</h2>
            <p className="text-xs text-gray-400 mt-0.5">
              {onlineCount} en ligne · {memberCount} membre{memberCount > 1 ? 's' : ''} du tableau
            </p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none">×</button>
        </div>

        {/* Users list */}
        <div className="flex-1 overflow-y-auto px-5 py-3">
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-3 animate-pulse">
                  <div className="w-9 h-9 rounded-full bg-gray-200" />
                  <div className="flex-1 h-4 bg-gray-200 rounded" />
                </div>
              ))}
            </div>
          ) : (
            <ul className="space-y-1">
              {rows.map((row) => {
                const online = isOnline(row.id);
                const isMe   = row.id === user?.id;
                const isMember = row.role !== null;
                return (
                  <li key={row.id} className="flex items-center gap-3 py-1.5 px-1 rounded-lg hover:bg-gray-50">
                    {/* Avatar + online dot */}
                    <div className="relative shrink-0">
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold uppercase
                        ${online ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-400'}`}>
                        {initials(row.displayName)}
                      </div>
                      <span className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-white
                        ${online ? 'bg-green-400' : 'bg-gray-300'}`}
                      />
                    </div>

                    {/* Name + status */}
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium truncate ${online ? 'text-gray-800' : 'text-gray-500'}`}>
                        {row.displayName}{isMe ? ' (vous)' : ''}
                      </p>
                      <p className="text-xs text-gray-400 flex items-center gap-1.5">
                        {row.role === 'owner'
                          ? <span className="text-blue-500 font-medium">Propriétaire</span>
                          : row.role === 'member'
                          ? <span className="text-green-600 font-medium">Membre</span>
                          : <span className="text-gray-400">Non-membre</span>
                        }
                        <span>·</span>
                        <span className={online ? 'text-green-500' : 'text-gray-400'}>
                          {online ? 'En ligne' : 'Hors ligne'}
                        </span>
                      </p>
                    </div>

                    {/* Action button (owner only, not on self) */}
                    {isOwner && !isMe && (
                      <div className="shrink-0">
                        {acting === row.id ? (
                          <span className="text-gray-400 text-sm">…</span>
                        ) : isMember && row.role !== 'owner' ? (
                          <button
                            onClick={() => handleRemove(row.id)}
                            className="text-xs text-red-400 hover:text-red-600 font-medium transition-colors"
                          >
                            Retirer
                          </button>
                        ) : !isMember ? (
                          <button
                            onClick={() => handleAdd(row.id)}
                            className="text-xs text-blue-600 hover:text-blue-800 font-medium transition-colors"
                          >
                            Inviter
                          </button>
                        ) : null}
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
