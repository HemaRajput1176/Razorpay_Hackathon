import React, { useState } from 'react';
import { BookOpen } from 'lucide-react';

export const CTFAcademyPage: React.FC = () => {
  const [challenges] = useState([
    { id: 1, title: 'Web Exploitation: SQLi Payload Inspection', points: 100, difficulty: 'BEGINNER', status: 'COMPLETED' },
    { id: 2, title: 'API Security: BOLA & Broken Auth Validation', points: 250, difficulty: 'INTERMEDIATE', status: 'COMPLETED' },
    { id: 3, title: 'Docker Lab: Pod Isolation & Lateral Traversal', points: 500, difficulty: 'ADVANCED', status: 'IN_PROGRESS' }
  ]);

  return (
    <div className="p-6 bg-slate-950 text-slate-100 min-h-screen font-mono">
      <div className="flex items-center justify-between border-b border-cyan-900/50 pb-6 mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-cyan-950 border border-cyan-500/40 rounded-xl">
            <BookOpen className="w-8 h-8 text-cyan-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-100">
              CTF SECURITY ACADEMY & DEFENSIVE LAB EXERCISES
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Hands-on cybersecurity challenges for authorized range validation and skills development
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl text-center">
          <span className="text-xs text-slate-400 block mb-1">TOTAL ACADEMY POINTS</span>
          <span className="text-3xl font-bold text-amber-400">850 PTS</span>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl text-center">
          <span className="text-xs text-slate-400 block mb-1">CHALLENGES SOLVED</span>
          <span className="text-3xl font-bold text-emerald-400">2 / 3</span>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl text-center">
          <span className="text-xs text-slate-400 block mb-1">RANKING</span>
          <span className="text-3xl font-bold text-purple-400">#1 ANALYST</span>
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl space-y-4">
        <h2 className="text-sm font-bold text-cyan-400 uppercase tracking-wider border-b border-slate-800 pb-3">
          ACTIVE SECURITY CHALLENGES
        </h2>

        <div className="space-y-3">
          {challenges.map((c) => (
            <div key={c.id} className="bg-slate-950 border border-slate-800 p-4 rounded-xl flex items-center justify-between">
              <div>
                <span className="font-bold text-xs text-slate-200 block">{c.title}</span>
                <span className="text-xs text-amber-400">{c.points} PTS • DIFFICULTY: {c.difficulty}</span>
              </div>
              <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                c.status === 'COMPLETED' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-amber-950 text-amber-400 border border-amber-800'
              }`}>
                {c.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
