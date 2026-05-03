'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import {
  Sparkles, ArrowLeft, Trophy, Calendar,
  Briefcase, ChevronRight, Loader2, Inbox,
} from 'lucide-react';

function getAvatar(name: string): { initials: string; bg: string } {
  const initials = name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase() || '?';
  const palette = ['#6366f1','#8b5cf6','#ec4899','#f43f5e','#f97316','#eab308','#22c55e','#14b8a6','#3b82f6','#06b6d4'];
  const bg = palette[name.split('').reduce((a, c) => a + c.charCodeAt(0), 0) % palette.length];
  return { initials, bg };
}
import { useAuth } from '@/contexts/AuthContext';
import { getUserSessions, SavedSession } from '@/lib/session-store';
import InterviewEvaluation from '@/components/InterviewEvaluation';

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

export default function HistoryPage() {
  const { user, loading: authLoading, logout } = useAuth();
  const router = useRouter();
  const [sessions, setSessions] = useState<SavedSession[]>([]);
  const [loadingSessions, setLoadingSessions] = useState(true);
  const [selected, setSelected] = useState<SavedSession | null>(null);

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
          onReset={() => setSelected(null)}
          prefetchedEvaluation={selected.evaluation}
          isPrefetching={false}
          prefetchError={null}
        />
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-black text-white relative overflow-hidden">
      <div className="absolute -top-40 -right-40 w-[500px] h-[500px] bg-blue-600/8 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] bg-purple-600/8 rounded-full blur-[120px] pointer-events-none" />

      <div className="relative z-10 max-w-5xl mx-auto px-4 py-8">

        {/* Navbar */}
        <div className="flex items-center justify-between mb-12">
          <button
            onClick={() => router.push('/')}
            className="flex items-center gap-2 group"
          >
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
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10"
        >
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
              Selesaikan sesi interview pertamamu dan hasil evaluasinya akan tersimpan otomatis di sini.
            </p>
            <button
              onClick={() => router.push('/')}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition-all text-sm"
            >
              Mulai Interview
            </button>
          </motion.div>
        ) : (
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

                return (
                  <motion.div
                    key={session.id}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
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

                      <div className="flex items-center gap-2 text-slate-600 group-hover:text-white transition-colors shrink-0">
                        <span className="text-xs font-medium hidden sm:inline">Lihat Evaluasi</span>
                        <ChevronRight size={18} />
                      </div>
                    </div>

                    {/* Score bars for ConCISE avg */}
                    <div className="mt-4 flex gap-1.5">
                      {(['consistency','clarity','information','structure','effectiveness'] as const).map(k => {
                        const avg = Math.round(
                          session.evaluation.qa_analysis.reduce((s, q) => s + q.concise[k].score, 0) /
                          session.evaluation.qa_analysis.length
                        );
                        const pct = avg * 10;
                        const c = pct >= 80 ? '#22c55e' : pct >= 60 ? '#3b82f6' : pct >= 40 ? '#f59e0b' : '#ef4444';
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
                      {['C','C','I','S','E'].map((l, i) => (
                        <div key={i} className="flex-1 text-center text-[9px] text-slate-700">{l}</div>
                      ))}
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>
    </main>
  );
}
