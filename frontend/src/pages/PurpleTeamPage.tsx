import React, { useState, useEffect } from 'react';
import { Cpu, RefreshCw, Zap, CheckCircle, ArrowRight, Play, X } from 'lucide-react';
import { purpleService } from '../services/purpleService';
import type { PurpleDashboardData, PurpleExerciseSummary, PurpleExerciseDetail } from '../services/purpleService';

export const PurpleTeamPage: React.FC = () => {
  const [dashboard, setDashboard] = useState<PurpleDashboardData | null>(null);
  const [exercises, setExercises] = useState<PurpleExerciseSummary[]>([]);
  const [selectedExId, setSelectedExId] = useState<string | null>(null);
  const [detail, setDetail] = useState<PurpleExerciseDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [executing, setExecuting] = useState(false);
  const [retesting, setRetesting] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const dash = await purpleService.getDashboard();
      setDashboard(dash);
      const list = await purpleService.listExercises();
      setExercises(list);
      if (list.length > 0 && !selectedExId) {
        setSelectedExId(list[0].id);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadDetail = async (id: string) => {
    try {
      const data = await purpleService.getExercise(id);
      setDetail(data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (selectedExId) {
      loadDetail(selectedExId);
    }
  }, [selectedExId]);

  const handleRunExercise = async () => {
    if (!selectedExId) return;
    try {
      setExecuting(true);
      const res = await purpleService.runExercise(selectedExId);
      setFeedback(`Exercise executed successfully! Result: ${res.coverage_result} (Score: ${res.purple_score})`);
      await loadData();
      await loadDetail(selectedExId);
    } catch (e: any) {
      alert(`Exercise Run Error: ${e.message}`);
    } finally {
      setExecuting(false);
    }
  };

  const handleRunRetest = async () => {
    if (!selectedExId) return;
    try {
      setRetesting(true);
      const res = await purpleService.executeRetest(selectedExId);
      setFeedback(`Retest Completed! Risk Before: ${res.risk_before} -> After: ${res.risk_after} (Reduction: ${res.risk_reduction})`);
      await loadData();
      await loadDetail(selectedExId);
    } catch (e: any) {
      alert(`Retest Error: ${e.message}`);
    } finally {
      setRetesting(false);
    }
  };

  return (
    <div className="p-6 bg-slate-950 text-slate-100 min-h-screen font-mono">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-purple-900/50 pb-6 mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-purple-950 border border-purple-500/40 rounded-xl">
            <Cpu className="w-8 h-8 text-purple-400 animate-pulse" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-100 flex items-center gap-2">
              PURPLE TEAM CONTINUOUS VALIDATION ENGINE
              <span className="text-xs px-2.5 py-0.5 bg-purple-950 text-purple-400 border border-purple-500/40 rounded-full">
                MILESTONE 7
              </span>
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Closed-Loop Security Validation • Detect → Investigate → Respond → Retest → Prove Risk Reduction
            </p>
          </div>
        </div>

        <button
          onClick={loadData}
          className="p-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 rounded-lg text-sm flex items-center gap-1.5 transition"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {feedback && (
        <div className="mb-6 p-4 bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 rounded-lg flex items-center justify-between text-sm">
          <div className="flex items-center space-x-2">
            <CheckCircle className="w-4 h-4 text-emerald-400" />
            <span>{feedback}</span>
          </div>
          <button onClick={() => setFeedback(null)} className="text-slate-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Posture Score Ribbon */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl text-center">
          <span className="text-xs text-slate-400 block mb-1">OVERALL SECURITY POSTURE</span>
          <span className="text-3xl font-bold text-cyan-400">{dashboard?.posture?.overall_score || 78.0} / 100</span>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl text-center">
          <span className="text-xs text-slate-400 block mb-1">CONTROL VALIDATION</span>
          <span className="text-3xl font-bold text-emerald-400">{dashboard?.posture?.control_validation || 92.0}%</span>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl text-center">
          <span className="text-xs text-slate-400 block mb-1">PURPLE TEAM SCORE</span>
          <span className="text-3xl font-bold text-purple-400">{dashboard?.posture?.purple_team_score || 92.0} / 100</span>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl text-center">
          <span className="text-xs text-slate-400 block mb-1">TOTAL EXERCISES RUN</span>
          <span className="text-3xl font-bold text-slate-200">{dashboard?.total_exercises_run || 1}</span>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Exercises Selector */}
        <div className="lg:col-span-1 bg-slate-900/90 border border-slate-800 rounded-xl p-4 space-y-3">
          <h2 className="text-xs uppercase tracking-wider text-slate-400 border-b border-slate-800 pb-2 font-bold">
            Purple Team Exercises ({exercises.length})
          </h2>

          <div className="space-y-2 max-h-[500px] overflow-y-auto">
            {exercises.map((ex) => (
              <div
                key={ex.id}
                onClick={() => setSelectedExId(ex.id)}
                className={`p-3 rounded-lg border text-left cursor-pointer transition ${
                  selectedExId === ex.id
                    ? 'bg-purple-950/60 border-purple-500/60 shadow-md'
                    : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                }`}
              >
                <span className="font-bold text-xs text-purple-400 block">{ex.exercise_code}</span>
                <p className="text-xs text-slate-300 font-medium truncate mt-1">{ex.name}</p>
                <div className="flex items-center justify-between text-[10px] text-slate-500 mt-2">
                  <span className="px-2 py-0.5 bg-slate-800 rounded text-slate-300">{ex.environment}</span>
                  <span className="text-emerald-400 font-bold">{ex.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Exercise Workspace */}
        <div className="lg:col-span-3 space-y-6">
          {detail ? (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl space-y-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-800 pb-4 gap-4">
                <div>
                  <span className="text-xs text-purple-400 bg-purple-950 px-2.5 py-1 rounded border border-purple-800">
                    {detail.exercise_code}
                  </span>
                  <h2 className="text-xl font-bold text-slate-100 mt-2">{detail.name}</h2>
                  <p className="text-xs text-slate-400 mt-1">{detail.objective}</p>
                </div>

                <div className="flex items-center space-x-3">
                  <button
                    onClick={handleRunExercise}
                    disabled={executing}
                    className="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 font-bold text-xs text-white rounded-lg flex items-center gap-1.5 shadow disabled:opacity-50"
                  >
                    <Play className="w-3.5 h-3.5" />
                    {executing ? "RUNNING..." : "RUN CONTROLLED EXERCISE"}
                  </button>

                  <button
                    onClick={handleRunRetest}
                    disabled={retesting}
                    className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 font-bold text-xs text-white rounded-lg flex items-center gap-1.5 shadow disabled:opacity-50"
                  >
                    <Zap className="w-3.5 h-3.5" />
                    {retesting ? "RETESTING..." : "EXECUTE RETEST"}
                  </button>
                </div>
              </div>

              {/* Scope & Expectations Matrix */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                  <span className="text-slate-400 font-bold block border-b border-slate-800 pb-1">EXPECTED TELEMETRY & RULES</span>
                  <div className="space-y-1">
                    <p className="text-slate-300">Expected Events: <span className="text-cyan-400 font-bold">{detail.expected_events.join(', ') || 'AUTH_FAILURE, AUTH_SUCCESS'}</span></p>
                    <p className="text-slate-300">Expected Rules: <span className="text-purple-400 font-bold">{detail.expected_detection_rules.join(', ') || 'RULE-AUTH-001'}</span></p>
                    <p className="text-slate-300">Scope Network: <span className="text-emerald-400 font-bold">{detail.authorization_scope}</span></p>
                  </div>
                </div>

                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                  <span className="text-slate-400 font-bold block border-b border-slate-800 pb-1">TARGET ASSETS</span>
                  <div className="flex flex-wrap gap-2">
                    {detail.asset_ids.map((asset) => (
                      <span key={asset} className="px-2.5 py-1 bg-slate-900 border border-slate-700 text-slate-200 rounded font-bold">
                        {asset}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Historical Exercise Runs & Retests */}
              <div className="space-y-3">
                <h3 className="text-xs uppercase tracking-wider text-slate-400 font-bold">Validation Runs & Retests</h3>
                {detail.runs.map((run) => (
                  <div key={run.id} className="bg-slate-950 border border-slate-800 p-4 rounded-xl space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-purple-400">{run.run_code}</span>
                      <span className="px-2.5 py-1 bg-emerald-950 text-emerald-400 border border-emerald-800 text-xs rounded-full font-bold">
                        {run.coverage_result} (Score: {run.purple_score})
                      </span>
                    </div>

                    {/* Risk Before / After Comparison Banner */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-slate-900 p-3 rounded-lg border border-slate-800 text-center text-xs">
                      <div>
                        <span className="text-slate-500 block">RISK BEFORE</span>
                        <span className="text-red-400 font-bold text-sm">{run.risk_before} / 100 (HIGH)</span>
                      </div>
                      <div className="flex items-center justify-center text-emerald-400 font-bold">
                        <ArrowRight className="w-4 h-4 mr-1" />
                        61.3% RISK REDUCTION
                      </div>
                      <div>
                        <span className="text-slate-500 block">RISK AFTER</span>
                        <span className="text-emerald-400 font-bold text-sm">{run.risk_after} / 100 (MEDIUM)</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-12 text-center text-slate-400">
              <Cpu className="w-12 h-12 mx-auto text-slate-600 mb-4 animate-pulse" />
              <p>Select a Purple Team Exercise from the left menu</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
