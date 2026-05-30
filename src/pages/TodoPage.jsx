import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageLayout } from '../components/layout/PageLayout';
import { useAlert } from '../hooks/useAlert';
import { authService } from '../services/auth.service';
import { todoService } from '../services/todo.service';
import { cn } from '../utils/cn';

function formatDateKey(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function formatDateDisplay(date) {
  return date.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).toUpperCase();
}

function isToday(date) {
  const today = new Date();
  return formatDateKey(date) === formatDateKey(today);
}

function getProgressColor(pct) {
  if (pct === 100) return 'bg-neu-green';
  if (pct >= 67)   return 'bg-neu-blue';
  if (pct >= 34)   return 'bg-neu-primary';
  return 'bg-neu-accent';
}

export default function TodoPage() {
  const navigate = useNavigate();
  const alert    = useAlert();

  const [user, setUser]               = useState(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [todos, setTodos]             = useState([]);
  const [isLoading, setIsLoading]     = useState(true);
  const [newTitle, setNewTitle]       = useState('');
  const [isAdding, setIsAdding]       = useState(false);
  const [editingId, setEditingId]     = useState(null);
  const [editValue, setEditValue]     = useState('');
  const [isSavingEdit, setIsSavingEdit] = useState(false);
  const [isCarrying, setIsCarrying]   = useState(false);

  const newInputRef  = useRef(null);
  const editInputRef = useRef(null);

  useEffect(() => {
    authService.getMe()
      .then(res => {
        const u = res.data;
        if (u?.role !== 'admin') { navigate('/dashboard'); return; }
        setUser(u);
      })
      .catch(() => navigate('/login'));
  }, []);

  useEffect(() => {
    if (!user) return;
    fetchTodos();
  }, [user, currentDate]);

  useEffect(() => {
    if (editingId && editInputRef.current) editInputRef.current.focus();
  }, [editingId]);

  async function fetchTodos() {
    setIsLoading(true);
    try {
      const res = await todoService.getByDate(formatDateKey(currentDate));
      setTodos(res.data ?? []);
    } catch {
      alert.error('Gagal memuat daftar to-do.');
    } finally {
      setIsLoading(false);
    }
  }

  function goToPrev() {
    setCurrentDate(d => { const nd = new Date(d); nd.setDate(nd.getDate() - 1); return nd; });
  }

  function goToNext() {
    setCurrentDate(d => { const nd = new Date(d); nd.setDate(nd.getDate() + 1); return nd; });
  }

  function goToToday() { setCurrentDate(new Date()); }

  async function handleAdd() {
    const title = newTitle.trim();
    if (!title) return;
    setIsAdding(true);
    try {
      const res = await todoService.create({ title, todoDate: formatDateKey(currentDate) });
      setTodos(prev => [...prev, res.data]);
      setNewTitle('');
      newInputRef.current?.focus();
    } catch {
      alert.error('Gagal menambahkan to-do.');
    } finally {
      setIsAdding(false);
    }
  }

  async function handleToggle(todo) {
    const optimistic = todos.map(t => t.id === todo.id ? { ...t, isCompleted: !t.isCompleted } : t);
    setTodos(optimistic);
    try {
      await todoService.toggle(todo.id, !todo.isCompleted);
    } catch {
      setTodos(todos);
      alert.error('Gagal mengubah status to-do.');
    }
  }

  function startEdit(todo) {
    setEditingId(todo.id);
    setEditValue(todo.title);
  }

  function cancelEdit() {
    setEditingId(null);
    setEditValue('');
  }

  async function handleSaveEdit(id) {
    const title = editValue.trim();
    if (!title) return;
    setIsSavingEdit(true);
    try {
      const res = await todoService.update(id, { title });
      setTodos(prev => prev.map(t => t.id === id ? res.data : t));
      setEditingId(null);
      setEditValue('');
    } catch {
      alert.error('Gagal menyimpan perubahan.');
    } finally {
      setIsSavingEdit(false);
    }
  }

  async function handleDelete(id) {
    try {
      await todoService.remove(id);
      setTodos(prev => prev.filter(t => t.id !== id));
    } catch {
      alert.error('Gagal menghapus to-do.');
    }
  }

  async function handleCarryForward() {
    setIsCarrying(true);
    const fromDate = new Date(currentDate);
    fromDate.setDate(fromDate.getDate() - 1);
    try {
      const res = await todoService.carryForward(formatDateKey(fromDate), formatDateKey(currentDate));
      const { todos: carried, count } = res.data;
      if (count === 0) {
        alert.info('Tidak ada to-do yang belum selesai dari hari sebelumnya.');
      } else {
        setTodos(prev => [...prev, ...carried]);
        alert.success(`${count} to-do berhasil dipindahkan dari hari sebelumnya.`);
      }
    } catch {
      alert.error('Gagal melakukan carry forward.');
    } finally {
      setIsCarrying(false);
    }
  }

  const completed = todos.filter(t => t.isCompleted).length;
  const total     = todos.length;
  const pct       = total > 0 ? Math.round((completed / total) * 100) : 0;

  if (!user) return null;

  return (
    <PageLayout user={user} title="My To-Do" alert={alert}>
      <div className="max-w-2xl mx-auto">

        {/* Date Navigator */}
        <div className="border-2 border-neu-black shadow-neu bg-neu-primary p-4 flex items-center justify-between gap-2">
          <button
            onClick={goToPrev}
            className="px-3 py-2 border-2 border-neu-black bg-neu-white font-display font-bold text-sm uppercase shadow-neu-sm hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all"
          >
            ← Prev
          </button>

          <div className="flex flex-col items-center gap-1 text-center">
            <span className="font-display font-bold text-base text-neu-black leading-tight">
              {formatDateDisplay(currentDate)}
            </span>
            {!isToday(currentDate) && (
              <button
                onClick={goToToday}
                className="px-2 py-0.5 border-2 border-neu-black bg-neu-white font-mono text-xs uppercase hover:shadow-neu-sm transition-all"
              >
                Hari Ini
              </button>
            )}
          </div>

          <button
            onClick={goToNext}
            className="px-3 py-2 border-2 border-neu-black bg-neu-white font-display font-bold text-sm uppercase shadow-neu-sm hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all"
          >
            Next →
          </button>
        </div>

        {/* Progress */}
        {total > 0 && (
          <div className="border-2 border-t-0 border-neu-black bg-neu-white p-4 shadow-neu-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="font-display font-bold text-sm text-neu-black">
                {completed} dari {total} selesai
              </span>
              <span className={cn(
                'font-mono text-xs font-bold px-2 py-0.5 border-2 border-neu-black',
                getProgressColor(pct),
              )}>
                {pct}%
              </span>
            </div>
            <div className="h-4 border-2 border-neu-black bg-neu-bg overflow-hidden">
              <div
                className={cn('h-full transition-all duration-300', pct === 100 ? 'bg-neu-green' : 'bg-neu-black')}
                style={{ width: `${pct}%` }}
              />
            </div>
            {pct === 100 && (
              <p className="font-display font-bold text-xs text-neu-green mt-2 uppercase tracking-wide">
                ✓ Semua selesai! Luar biasa!
              </p>
            )}
          </div>
        )}

        {/* Todo List */}
        <div className="mt-4 flex flex-col gap-2">
          {isLoading ? (
            <div className="border-2 border-neu-black bg-neu-white p-8 text-center shadow-neu-sm">
              <div className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-neu-black border-t-neu-primary animate-spin" />
                <span className="font-mono text-sm font-bold text-neu-black/50 uppercase tracking-widest">Memuat...</span>
              </div>
            </div>
          ) : todos.length === 0 ? (
            <div className="border-2 border-dashed border-neu-black/30 p-12 text-center">
              <div className="text-5xl mb-3 text-neu-black/20">✓</div>
              <p className="font-display font-bold text-neu-black/40 text-sm uppercase tracking-wide">Belum ada to-do untuk hari ini.</p>
              <p className="font-body text-xs text-neu-black/30 mt-1">Tambahkan task pertamamu di bawah.</p>
            </div>
          ) : (
            todos.map(todo => (
              <div
                key={todo.id}
                className={cn(
                  'flex items-center gap-3 px-4 py-3 border-2 border-neu-black shadow-neu-sm group transition-colors',
                  todo.isCompleted ? 'bg-neu-bg' : 'bg-neu-white hover:bg-neu-bg',
                )}
              >
                {/* Checkbox */}
                <button
                  onClick={() => handleToggle(todo)}
                  className={cn(
                    'w-5 h-5 flex-shrink-0 border-2 border-neu-black flex items-center justify-center transition-colors',
                    todo.isCompleted ? 'bg-neu-black' : 'bg-neu-white hover:bg-neu-bg',
                  )}
                  aria-label={todo.isCompleted ? 'Tandai belum selesai' : 'Tandai selesai'}
                >
                  {todo.isCompleted && (
                    <svg className="w-3 h-3 text-neu-white" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  )}
                </button>

                {/* Title / Edit Input */}
                {editingId === todo.id ? (
                  <input
                    ref={editInputRef}
                    value={editValue}
                    onChange={e => setEditValue(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter') handleSaveEdit(todo.id);
                      if (e.key === 'Escape') cancelEdit();
                    }}
                    className="flex-1 px-2 py-1 border-2 border-neu-black bg-neu-primary font-body text-sm outline-none shadow-neu-sm focus:shadow-neu"
                    maxLength={500}
                  />
                ) : (
                  <span
                    onClick={() => startEdit(todo)}
                    className={cn(
                      'flex-1 font-body text-sm cursor-pointer',
                      todo.isCompleted ? 'line-through text-neu-black/40' : 'text-neu-black',
                    )}
                  >
                    {todo.title}
                  </span>
                )}

                {/* Action Buttons */}
                {editingId === todo.id ? (
                  <div className="flex gap-1 flex-shrink-0">
                    <button
                      onClick={() => handleSaveEdit(todo.id)}
                      disabled={isSavingEdit}
                      className="px-2 py-1 border-2 border-neu-black bg-neu-green font-mono text-xs font-bold uppercase hover:shadow-neu-sm hover:translate-x-[1px] hover:translate-y-[1px] transition-all disabled:opacity-50"
                    >
                      {isSavingEdit ? '...' : 'Simpan'}
                    </button>
                    <button
                      onClick={cancelEdit}
                      className="px-2 py-1 border-2 border-neu-black bg-neu-white font-mono text-xs font-bold uppercase hover:bg-neu-bg transition-all"
                    >
                      ✕
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-1 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => startEdit(todo)}
                      className="p-1 border-2 border-transparent hover:border-neu-black hover:shadow-neu-sm transition-all"
                      aria-label="Edit"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                        <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleDelete(todo.id)}
                      className="px-2 py-1 border-2 border-transparent font-mono font-bold text-xs hover:border-neu-accent hover:text-neu-accent transition-all"
                      aria-label="Hapus"
                    >
                      ✕
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Add Input */}
        <div className="flex gap-2 mt-3">
          <input
            ref={newInputRef}
            value={newTitle}
            onChange={e => setNewTitle(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') handleAdd(); }}
            placeholder="+ Ketik task baru dan tekan Enter..."
            maxLength={500}
            className="flex-1 px-4 py-3 border-2 border-neu-black bg-neu-white font-body text-sm outline-none shadow-neu-sm focus:shadow-neu focus:translate-x-[-1px] focus:translate-y-[-1px] placeholder:text-neu-black/30 transition-all"
          />
          <button
            onClick={handleAdd}
            disabled={isAdding || !newTitle.trim()}
            className="px-4 py-3 bg-neu-primary border-2 border-neu-black shadow-neu font-display font-bold text-sm uppercase hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-neu-sm active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isAdding ? '...' : 'Tambah'}
          </button>
        </div>

        {/* Carry Forward */}
        <div className="mt-3">
          <button
            onClick={handleCarryForward}
            disabled={isCarrying}
            className="w-full py-3 border-2 border-dashed border-neu-black/40 font-display font-bold text-xs uppercase text-neu-black/50 hover:border-solid hover:border-neu-black hover:bg-neu-bg hover:text-neu-black hover:shadow-neu-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {isCarrying ? 'Memindahkan...' : '↑ Carry Forward — Pindahkan To-Do Belum Selesai dari Kemarin'}
          </button>
        </div>

      </div>
    </PageLayout>
  );
}
