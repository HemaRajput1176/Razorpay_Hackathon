import React, { useState, useEffect } from 'react';
import { Target, Play } from 'lucide-react';
import { CyberCard } from '../components/common/CyberCard';
import { Badge } from '../components/common/Badge';
import { exerciseService } from '../services/exerciseService';

interface ExerciseListPageProps {
  onSelectExercise: (exerciseCode: string) => void;
}

export const ExerciseListPage: React.FC<ExerciseListPageProps> = ({ onSelectExercise }) => {
  const [exercises, setExercises] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      const data = await exerciseService.getExercises();
      setExercises(data);
      setLoading(false);
    }
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full text-xs text-[#00E5FF] animate-pulse">
        [+] LOADING AUTHORIZED SECURITY EXERCISES...
      </div>
    );
  }

  return (
    <div className="space-y-4 font-mono-tech select-none">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#17232E] pb-3">
        <div>
          <h1 className="text-xl font-black text-[#E6F1F5] tracking-widest uppercase flex items-center gap-2">
            <Target className="w-5 h-5 text-[#22C55E]" /> AUTHORIZED SECURITY EXERCISES
          </h1>
          <p className="text-xs text-[#7F95A5] mt-0.5">
            Controlled adversary simulations & defensive validation pipelines inside Cyber Range
          </p>
        </div>
        <Badge variant="ONLINE">SECURITY MODEL: AUTHORIZED SCOPE ONLY</Badge>
      </div>

      {/* Exercise Cards List */}
      <CyberCard title="AVAILABLE SECURITY EXERCISES" subtitle="Select an authorized exercise to execute pre-flight checks and launch assessment pipeline">
        <div className="space-y-3">
          {exercises.map((ex) => (
            <div
              key={ex.id}
              className="p-4 bg-[#070B11] border border-[#17232E] hover:border-[#00E5FF]/60 rounded-md transition flex flex-col md:flex-row md:items-center justify-between gap-4 group"
            >
              <div className="space-y-1.5 flex-1">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold text-[#00E5FF] font-mono-tech bg-[#00E5FF]/10 px-2 py-0.5 rounded border border-[#00E5FF]/30">
                    {ex.code}
                  </span>
                  <h3 className="text-sm font-bold text-[#E6F1F5] group-hover:text-[#00E5FF] transition">
                    {ex.name}
                  </h3>
                  <Badge variant="INVESTIGATING">{ex.category}</Badge>
                  <span className="text-[10px] text-[#F59E0B] font-bold uppercase border border-[#F59E0B]/30 bg-[#F59E0B]/10 px-2 py-0.5 rounded">
                    {ex.difficulty}
                  </span>
                </div>
                <p className="text-xs text-[#7F95A5] leading-relaxed max-w-3xl">
                  {ex.description}
                </p>
                <div className="flex items-center gap-4 text-[11px] text-[#465663] pt-1">
                  <span>Primary Target: <strong className="text-[#E6F1F5]">{ex.primary_target}</strong></span>
                  <span>Supporting: <strong className="text-[#7F95A5]">{ex.supporting_targets}</strong></span>
                  <span>Status: <strong className="text-[#22C55E]">{ex.status}</strong></span>
                </div>
              </div>

              <div className="shrink-0 flex items-center gap-2">
                <button
                  onClick={() => onSelectExercise(ex.code)}
                  className="bg-[#00E5FF] hover:bg-[#00E5FF]/90 text-[#030609] font-bold py-2 px-5 rounded text-xs uppercase tracking-wider transition shadow-[0_0_12px_rgba(0,229,255,0.3)] flex items-center gap-1.5"
                >
                  <Play className="w-3.5 h-3.5 fill-current" /> [ OPEN EXERCISE ]
                </button>
              </div>
            </div>
          ))}
        </div>
      </CyberCard>
    </div>
  );
};
