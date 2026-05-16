'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import {
  Sparkles, ArrowLeft, Calendar,
  Briefcase, ChevronRight, Loader2, Inbox, Trash2, TrendingUp,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { getUserSessions, deleteSession, SavedSession } from '@/lib/session-store';
import InterviewEvaluation from '@/components/InterviewEvaluation';

function getAvatar(name: string): { initials: string; bg: string } {
  const initials = name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase() || '?';
  const palette = ['#6366f1','#8b5cf6','#ec4899','#f43f5e','#f97316','#eab308','#22c55e','#14b8a6','#3b82f6','#06b6d4'];
  const bg = palette[name.split('').reduce((a, c) => a + c.charCodeAt(0), 0) % palette.length];
  return { initials, bg };
}

const verdictLabel: Record<string, string> = {
  recommended: 'Direkomendasikan',
  conditional: 'Bersyarat',
  not_recommended: 'Belum Direkomendasikan',
};
const verdictColor: Record<string, string> = {
  recommended: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
  conditional: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
  not_recommended: 'text-red-400 bg-red-500/10 border-red-500/30',
};
const scoreColor = (s: number) =>
  s >= 80 ? 'text-emerald-400' : s >= 60 ? 'text-blue-400' : s >= 40 ? 'text-amber-400' : 'text-red-400';
const scoreBorder = (s: number) =>
  s >= 80 ? 'border-emerald-500/40' : s >= 60 ? 'border-blue-500/40' : s >= 40 ? 'border-amber-500/40' : 'border-red-500/40';
const barColor = (s: number) =>
  s >= 80 ? '#22c55e' : s >= 60 ? '#3b82f6' : s >= 40 ? '#f59e0b' : '#ef4444';

export default function HistoryPage() {
  const { user, loading: authLoading, logout } = useAuth();
  const router = useRouter();
  const [sessions, setSessions] = useState<SavedSession[]>([]);
  const [loadingSessions, setLoadingSessions] = useState(true);
  const [selected, setSelected] = useState<SavedSession | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) router.replace('/login');
  }, [user, authLoading, router]);

  useEffect(() => {
    if (!user) return;
    setLoadingSessions(true);
    getUserSessions(user.uid)
      .then(setSessions)
      .catch(console.error)
      .finally(() => setLoadingSessions(false));
  }, [user]);

  const handleDelete = async (sessionId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirmDelete !== sessionId) {
      setConfirmDelete(sessionId);
      return;
    }
    setDeletingId(sessionId);
    try {
      await deleteSession(sessionId);
      setSessions(prev => prev.filter(s => s.id !== sessionId));
    } catch (err) {
      console.error(err);
    } finally {
      setDeletingId(null);
      setConfirmDelete(null);
    }
  };

  if (authLoading || !user) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (selected) {
    return (
      <div className="min-h-screen bg-black text-white">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <button
            onClick={() => setSelected(null)}
            className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-6 text-sm font-medium"
          >
            <ArrowLeft size={16} /> Kembali ke Riwayat
          </button>
        </div>
        <InterviewEvaluation
          history={selected.history}
          cvText={selected.cvText}
          jdText={selected.jdText}
          crossMatchData={selected.crossMatchData ?? null}
          onReset={() => {
            sessionStorage.setItem('loginIntent', 'setup');
            router.push('/');
          }}
          prefetchedEvaluation={selected.evaluation}
          isPrefetching={false}
          prefetchError={null}
        />
      </div>
    );
  }

  // Chronological order for trend chart (oldest → newest)
  const chronological = [...sessions].reverse();

  return (
    <main
      className="min-h-screen bg-black text-white relative overflow-hidden"
      onClick={() => setConfirmDelete(null)}
    >
      <div className="absolute -top-40 -right-40 w-[500px] h-[500px] bg-blue-600/8 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] bg-purple-600/8 rounded-full blur-[120px] pointer-events-none" />

      <div className="relative z-10 max-w-5xl mx-auto px-4 py-8">

        {/* Navbar */}
        <div className="flex items-center justify-between mb-12">
          <button onClick={() => router.push('/')} className="flex items-center gap-2 cursor-pointer">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tighter">
              interv<span className="text-blue-500">you</span>
            </span>
          </button>

          <div className="flex items-center gap-3">
            {(() => { const a = getAvatar(user.displayName ?? user.email ?? '?'); return (
              <div style={{ background: a.bg }} className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-black shrink-0 select-none">
                {a.initials}
              </div>
            ); })()}
            <span className="text-sm text-slate-400 hidden sm:inline">{user.displayName}</span>
            <button
              onClick={logout}
              className="text-xs text-slate-500 hover:text-white transition-colors ml-2 px-3 py-1.5 border border-white/10 rounded-lg"
            >
              Keluar
            </button>
          </div>
        </div>

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-4xl font-bold tracking-tight mb-2">Riwayat Sesi</h1>
          <p className="text-slate-500">
            {loadingSessions
              ? 'Memuat...'
              : sessions.length === 0
              ? 'Belum ada sesi tersimpan'
              : `${sessions.length} sesi interview tersimpan`}
          </p>
        </motion.div>

        {/* Content */}
        {loadingSessions ? (
          <div className="flex items-center justify-center py-32">
            <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
          </div>
        ) : sessions.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-32 text-center"
          >
            <div className="w-20 h-20 bg-slate-900 border border-slate-800 rounded-3xl flex items-center justify-center mb-6">
              <Inbox className="w-10 h-10 text-slate-600" />
            </div>
            <h3 className="text-xl font-bold text-slate-300 mb-2">Belum Ada Sesi</h3>
            <p className="text-slate-500 text-sm max-w-xs mb-8">
              Selesaikan sesi interview pertamamu dan hasilnya akan tersimpan otomatis di sini.
            </p>
            <button
              onClick={() => router.push('/')}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition-all text-sm"
            >
              Mulai Interview
            </button>
          </motion.div>
        ) : (
          <>
            {/* ── TREND CHART ── */}
            {sessions.length >= 2 && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 bg-slate-950/60 border border-slate-800 rounded-2xl p-5"
              >
                <div className="flex items-center gap-2 mb-4">
                  <TrendingUp size={14} className="text-blue-400" />
                  <span className="text-sm font-semibold text-white">Tren Skor</span>
                  <span className="text-xs text-slate-500 ml-1">— progres dari sesi ke sesi</span>
                </div>

                <div className="flex items-end gap-2 h-20">
                  {chronological.map((s, i) => {
                    const score = s.evaluation.overall_score;
                    const heightPct = score; // score is 0-100, maps to 0-100% of 80px
                    const color = barColor(score);
                    const isLatest = i === chronological.length - 1;
                    return (
                      <button
                        key={s.id}
                        onClick={() => setSelected(s)}
                        title={`Sesi ${i + 1} — Skor ${score}`}
                        className="flex-1 flex flex-col items-center gap-1 group/bar"
                      >
                        <span className={`text-[9px] font-bold transition-opacity ${isLatest ? 'opacity-100' : 'opacity-0 group-hover/bar:opacity-100'}`}
                          style={{ color }}>
                          {score}
                        </span>
                        <div className="w-full bg-slate-800 rounded-sm overflow-hidden" style={{ height: 64 }}>
                          <div
                            className="w-full rounded-sm transition-all"
                            style={{
                              height: `${heightPct}%`,
                              background: color,
                              opacity: isLatest ? 1 : 0.55,
                              marginTop: 'auto',
                              position: 'relative',
                              top: `${100 - heightPct}%`,
                            }}
                          />
                        </div>
                        <span className="text-[8px] text-slate-700">
                          {i + 1}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* delta badge */}
                {(() => {
                  const latest = chronological[chronological.length - 1].evaluation.overall_score;
                  const prev = chronological[chronological.length - 2].evaluation.overall_score;
                  const delta = latest - prev;
                  if (delta === 0) return null;
                  return (
                    <p className={`text-xs mt-3 font-medium ${delta > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                      {delta > 0 ? '↑' : '↓'} Skor {delta > 0 ? 'naik' : 'turun'} {Math.abs(delta)} poin dari sesi sebelumnya
                    </p>
                  );
                })()}
              </motion.div>
            )}

            {/* ── SESSION LIST ── */}
            <div className="grid gap-4">
              <AnimatePresence>
                {sessions.map((session, i) => {
                  const score = session.evaluation.overall_score;
                  const verdict = session.evaluation.recommendation_verdict;
                  const dateStr = session.createdAt.toLocaleDateString('id-ID', {
                    day: 'numeric', month: 'long', year: 'numeric',
                  });
                  const timeStr = session.createdAt.toLocaleTimeString('id-ID', {
                    hour: '2-digit', minute: '2-digit',
                  });
                  const isConfirming = confirmDelete === session.id;
                  const isDeleting = deletingId === session.id;

                  return (
                    <motion.div
                      key={session.id}
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -24, scale: 0.97 }}
                      transition={{ delay: i * 0.04 }}
                      className={`group bg-slate-950/60 border ${scoreBorder(score)} border-l-4 rounded-2xl p-5 hover:bg-slate-900/60 transition-all cursor-pointer`}
                      onClick={() => setSelected(session)}
                    >
                      <div className="flex items-center justify-between gap-4 flex-wrap">
                        <div className="flex items-center gap-4">
                          {/* Score circle */}
                          <div className={`w-14 h-14 rounded-xl border-2 ${scoreBorder(score)} flex flex-col items-center justify-center shrink-0 bg-black/30`}>
                            <span className={`text-lg font-black leading-none ${scoreColor(score)}`}>{score}</span>
                            <span className="text-[9px] text-slate-600">/100</span>
                          </div>

                          <div>
                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                              <span className="font-bold text-white text-sm">{session.candidateName || 'Kandidat'}</span>
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${verdictColor[verdict] ?? 'text-slate-400 bg-slate-500/10 border-slate-500/30'}`}>
                                {verdictLabel[verdict] ?? verdict}
                              </span>
                            </div>
                            <div className="flex items-center gap-3 text-xs text-slate-500 flex-wrap">
                              <span className="flex items-center gap-1">
                                <Briefcase size={11} /> {session.jobTitle || 'Posisi tidak diketahui'}
                              </span>
                              <span className="flex items-center gap-1">
                                <Calendar size={11} /> {dateStr} · {timeStr}
                              </span>
                              <span>{session.evaluation.qa_analysis.length} pertanyaan</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          {/* Delete button */}
                          <AnimatePresence mode="wait">
                            {isConfirming ? (
                              <motion.div
                                key="confirm"
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                className="flex items-center gap-1.5"
                                onClick={e => e.stopPropagation()}
                              >
                                <span className="text-xs text-slate-400">Hapus sesi ini?</span>
                                <button
                                  onClick={(e) => handleDelete(session.id, e)}
                                  disabled={isDeleting}
                                  className="px-2.5 py-1 bg-red-500/15 hover:bg-red-500/25 border border-red-500/40 text-red-400 text-xs font-bold rounded-lg transition-all disabled:opacity-50"
                                >
                                  {isDeleting ? <Loader2 size={12} className="animate-spin" /> : 'Ya, Hapus'}
                                </button>
                                <button
                                  onClick={(e) => { e.stopPropagation(); setConfirmDelete(null); }}
                                  className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-400 text-xs rounded-lg transition-all"
                                >
                                  Batal
                                </button>
                              </motion.div>
                            ) : (
                              <motion.button
                                key="trash"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                onClick={(e) => handleDelete(session.id, e)}
                                className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-700 hover:text-red-400 hover:bg-red-500/10 transition-all opacity-0 group-hover:opacity-100"
                              >
                                <Trash2 size={14} />
                              </motion.button>
                            )}
                          </AnimatePresence>

                          <div className="flex items-center gap-1.5 text-slate-600 group-hover:text-white transition-colors">
                            <span className="text-xs font-medium hidden sm:inline">Lihat</span>
                            <ChevronRight size={18} />
                          </div>
                        </div>
                      </div>

                      {/* ConCISE mini bars */}
                      <div className="mt-4 flex gap-1.5">
                        {(['consistency','clarity','information','structure','effectiveness'] as const).map(k => {
                          const avg = Math.round(
                            session.evaluation.qa_analysis.reduce((s, q) => s + q.concise[k].score, 0) /
                            session.evaluation.qa_analysis.length
                          );
                          const pct = avg * 10;
                          const c = barColor(pct);
                          return (
                            <div key={k} className="flex-1" title={`${k}: ${avg}/10`}>
                              <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
                                <div style={{ width: `${pct}%`, background: c }} className="h-full rounded-full" />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                      <div className="flex gap-1.5 mt-1">
                        {['C','C','I','S','E'].map((l, idx) => (
                          <div key={idx} className="flex-1 text-center text-[9px] text-slate-700">{l}</div>
                        ))}
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          </>
        )}
      </div>
    </main>
  );
}
