import { db } from './firebase';
import {
  collection, addDoc, getDocs,
  query, where, doc, getDoc, Timestamp,
} from 'firebase/firestore';
import { EvaluationData } from './evaluate';
import { CrossMatchData } from './cross-match';

export interface SavedSession {
  id: string;
  userId: string;
  createdAt: Date;
  evaluation: EvaluationData;
  cvText: string;
  jdText: string;
  history: string;
  crossMatchData?: CrossMatchData | null;
  jobTitle: string;
  candidateName: string;
}

export async function saveSession(params: {
  userId: string;
  evaluation: EvaluationData;
  cvText: string;
  jdText: string;
  history: string;
  crossMatchData?: CrossMatchData | null;
  jobTitle: string;
  candidateName: string;
}): Promise<string> {
  const ref = await addDoc(collection(db, 'sessions'), {
    ...params,
    overallScore: params.evaluation.overall_score,
    createdAt: Timestamp.now(),
  });
  return ref.id;
}

export async function getUserSessions(userId: string): Promise<SavedSession[]> {
  const q = query(collection(db, 'sessions'), where('userId', '==', userId));
  const snap = await getDocs(q);
  return snap.docs
    .map(d => ({
      id: d.id,
      ...d.data(),
      createdAt: (d.data().createdAt as Timestamp).toDate(),
    } as SavedSession))
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
}

export async function getSession(sessionId: string): Promise<SavedSession | null> {
  const snap = await getDoc(doc(db, 'sessions', sessionId));
  if (!snap.exists()) return null;
  return {
    id: snap.id,
    ...snap.data(),
    createdAt: (snap.data().createdAt as Timestamp).toDate(),
  } as SavedSession;
}
