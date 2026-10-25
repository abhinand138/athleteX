import {
  AreaChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import {
  FaHeartbeat,
  FaFire,
  FaMedal,
  FaInfoCircle,
  FaRocket,
  FaBatteryFull,
  FaShieldAlt,
  FaExclamationTriangle,
  FaRunning
} from 'react-icons/fa';

export default function FitnessFreshnessWidget({ fitnessProfile }) {
  if (!fitnessProfile) {
    return null;
  }

  const {
    fitnessScore = 0,
    fatigueScore = 0,
    formScore = 0,
    formBadge = '🟢 Optimal Conditioning',
    formDescription = 'Conditioning load is balanced.',
    fitnessTier = 'VARSITY',
    acwr = 1.0,
    acwrStatus = 'SWEET_SPOT',
    acwrBadge = '🟢 Optimal Sweet Spot (0.8 - 1.3)',
    acwrRecommendation = 'Workload is in the optimal adaptation window with minimized injury risk.',
    acute7DayLoad = 0,
    chronic28DayLoad = 0,
    chronicWeeklyAverageLoad = 0,
    injuryRiskIndex = 20,
    trendData = []
  } = fitnessProfile;

  const getTierColor = (tier) => {
    switch (tier) {
      case 'ELITE_DIVISION':
        return 'from-purple-500/20 to-brand-peach/20 border-purple-500/40 text-purple-300';
      case 'SEMI_PRO':
        return 'from-brand-peach/20 to-amber-500/20 border-brand-peach/40 text-brand-peach';
      case 'VARSITY':
        return 'from-blue-500/20 to-cyan-500/20 border-blue-500/40 text-blue-300';
      default:
        return 'from-emerald-500/20 to-teal-500/20 border-emerald-500/40 text-emerald-300';
    }
  };

  const getFormStyle = (score) => {
    if (score >= 12) {
      return {
        bg: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400',
        text: 'text-emerald-400',
        accent: '#10B981'
      };
    } else if (score >= -4) {
      return {
        bg: 'bg-brand-peach/10 border-brand-peach/30 text-brand-peach',
        text: 'text-brand-peach',
        accent: '#EE9B74'
      };
    } else if (score >= -16) {
      return {
        bg: 'bg-amber-500/10 border-amber-500/30 text-amber-400',
        text: 'text-amber-400',
        accent: '#F59E0B'
      };
    } else {
      return {
        bg: 'bg-rose-500/10 border-rose-500/30 text-rose-400',
        text: 'text-rose-400',
        accent: '#F43F5E'
      };
    }
  };

  const formStyle = getFormStyle(formScore);

  return (
    <div className="glass-card rounded-2xl p-6 border border-white/5 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-brand-peach/10 text-brand-peach text-sm">
              <FaBatteryFull />
            </span>
            <h3 className="text-lg font-bold text-white tracking-wide">
              Banister Fitness & Freshness Model
            </h3>
            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-white/10 text-gray-300">
              Sports Science
            </span>
          </div>
          <p className="text-xs text-gray-400 mt-1">
            Real-time Training Stress Balance (TSB) comparing 42-day conditioning against 7-day acute strain.
          </p>
        </div>

        {/* Tier Badge */}
        <div className={`px-3 py-1.5 rounded-xl border bg-gradient-to-r text-xs font-bold flex items-center gap-2 self-start sm:self-auto ${getTierColor(fitnessTier)}`}>
          <FaMedal className="text-sm" />
          <span>{fitnessTier.replace('_', ' ')}</span>
        </div>
      </div>

      {/* Core KPI Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Form / Match Readiness */}
        <div className={`rounded-xl p-4 border transition-all ${formStyle.bg}`}>
          <div className="flex items-center justify-between text-xs font-medium text-gray-300 mb-1">
            <span className="flex items-center gap-1.5">
              <FaRocket className={formStyle.text} />
              Match Form (TSB)
            </span>
            <span className="text-[10px] text-gray-400 font-mono">Fitness - Fatigue</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black tracking-tight text-white">
              {formScore > 0 ? `+${formScore}` : formScore}
            </span>
          </div>
          <div className="mt-2 text-xs font-semibold flex items-center gap-1">
            {formBadge}
          </div>
          <p className="text-[11px] text-gray-400 mt-1 leading-snug">
            {formDescription}
          </p>
        </div>

        {/* Chronic Conditioning (Fitness, CTL) */}
        <div className="bg-black/30 rounded-xl p-4 border border-white/5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs font-medium text-gray-400 mb-1">
              <span className="flex items-center gap-1.5">
                <FaHeartbeat className="text-brand-peach" />
                Conditioning (CTL)
              </span>
              <span className="text-[10px] text-gray-500">42-Day Load</span>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-black text-white">{fitnessScore}</span>
              <span className="text-xs text-gray-500">/ 100</span>
            </div>
          </div>
          <div className="mt-3">
            <div className="w-full bg-white/5 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-brand-peach h-full rounded-full transition-all duration-1000"
                style={{ width: `${Math.min(100, fitnessScore)}%` }}
              />
            </div>
            <span className="text-[10px] text-gray-400 mt-1 block">
              Long-term aerobic & muscular adaptation
            </span>
          </div>
        </div>

        {/* Acute Fatigue (ATL) */}
        <div className="bg-black/30 rounded-xl p-4 border border-white/5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs font-medium text-gray-400 mb-1">
              <span className="flex items-center gap-1.5">
                <FaFire className="text-amber-400" />
                Acute Fatigue (ATL)
              </span>
              <span className="text-[10px] text-gray-500">7-Day Load</span>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-black text-white">{fatigueScore}</span>
              <span className="text-xs text-gray-500">/ 100</span>
            </div>
          </div>
          <div className="mt-3">
            <div className="w-full bg-white/5 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-amber-400 h-full rounded-full transition-all duration-1000"
                style={{ width: `${Math.min(100, fatigueScore)}%` }}
              />
            </div>
            <span className="text-[10px] text-gray-400 mt-1 block">
              Short-term residual muscular strain
            </span>
          </div>
        </div>
      </div>

      {/* Tim Gabbett ACWR & Injury Risk Meter Card */}
      <div className="rounded-2xl p-5 border border-white/10 bg-gradient-to-b from-white/[0.04] to-black/40 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-brand-peach/10 border border-brand-peach/30 flex items-center justify-center text-brand-peach">
              <FaShieldAlt className="text-base" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-extrabold text-white">
                  Acute-to-Chronic Workload Ratio (ACWR)
                </h4>
                <span className="text-[9px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Gabbett Sports Science
                </span>
              </div>
              <p className="text-[11px] text-gray-400 mt-0.5">
                Clinical metric monitoring tissue strain spikes vs chronic physiological capacity to protect against soft-tissue tears.
              </p>
            </div>
          </div>

          {/* ACWR Value Display */}
          <div className="flex items-center gap-3 self-start sm:self-auto">
            <div className="text-right">
              <span className="text-2xl font-black text-white font-mono">{acwr}x</span>
              <span className="text-[10px] text-gray-400 block uppercase font-bold">Ratio</span>
            </div>
            <span
              className={`px-3 py-1.5 rounded-xl text-xs font-bold border ${
                acwrStatus === "DANGER_ZONE"
                  ? "bg-rose-500/15 border-rose-500/30 text-rose-300"
                  : acwrStatus === "MODERATE_SPIKE"
                  ? "bg-amber-500/15 border-amber-500/30 text-amber-300"
                  : acwrStatus === "SWEET_SPOT"
                  ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-300"
                  : "bg-blue-500/15 border-blue-500/30 text-blue-300"
              }`}
            >
              {acwrBadge}
            </span>
          </div>
        </div>

        {/* 4-Zone Workload Spectrum Bar with Needle */}
        <div className="space-y-1.5 pt-1">
          <div className="relative">
            <div className="w-full h-3 rounded-full overflow-hidden flex">
              <div className="w-[40%] bg-blue-500/70" title="< 0.8 Under-training (40%)" />
              <div className="w-[25%] bg-emerald-500/80" title="0.8 - 1.3 Optimal Sweet Spot (25%)" />
              <div className="w-[10%] bg-amber-500/80" title="1.3 - 1.5 Strain Warning (10%)" />
              <div className="w-[25%] bg-rose-500/80" title="> 1.5 High Injury Danger (25%)" />
            </div>

            {/* Position Marker */}
            <div
              className="absolute -top-1.5 transform -translate-x-1/2 flex flex-col items-center pointer-events-none transition-all duration-700"
              style={{
                left: `${Math.max(4, Math.min(96, (acwr / 2.0) * 100))}%`
              }}
            >
              <div className="w-3.5 h-6 bg-white rounded-full border-2 border-black shadow-lg" />
            </div>
          </div>

          {/* Scale Labels */}
          <div className="flex items-center justify-between text-[10px] text-gray-400 font-mono px-1">
            <span>0.0</span>
            <span className="text-blue-400 font-bold">&lt; 0.8 Decay</span>
            <span className="text-emerald-400 font-bold">0.8 - 1.3 Sweet Spot</span>
            <span className="text-amber-400 font-bold">1.3 - 1.5 Warning</span>
            <span className="text-rose-400 font-bold">&gt; 1.5 Danger Zone</span>
            <span>2.0+</span>
          </div>
        </div>

        {/* Load Comparison Numbers + Clinical Coaching Cue */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
          <div className="p-3 rounded-xl bg-black/40 border border-white/5 flex items-center justify-between">
            <span className="text-[11px] text-gray-400">7-Day Acute Load</span>
            <span className="text-sm font-black text-white font-mono">{acute7DayLoad} AU</span>
          </div>
          <div className="p-3 rounded-xl bg-black/40 border border-white/5 flex items-center justify-between">
            <span className="text-[11px] text-gray-400">28-Day Weekly Base</span>
            <span className="text-sm font-black text-white font-mono">{chronicWeeklyAverageLoad} AU</span>
          </div>
          <div className="p-3 rounded-xl bg-black/40 border border-white/5 flex items-center justify-between">
            <span className="text-[11px] text-gray-400">Injury Risk Index</span>
            <span
              className={`text-sm font-black font-mono ${
                injuryRiskIndex >= 60
                  ? "text-rose-400"
                  : injuryRiskIndex >= 40
                  ? "text-amber-400"
                  : "text-emerald-400"
              }`}
            >
              {injuryRiskIndex}%
            </span>
          </div>
        </div>

        {/* Actionable Clinical Coaching Cue */}
        <div className="p-3.5 rounded-xl bg-brand-peach/[0.07] border border-brand-peach/20 text-xs text-gray-300 flex items-start gap-2.5">
          <FaInfoCircle className="text-brand-peach text-sm shrink-0 mt-0.5" />
          <p className="leading-relaxed text-[11px]">
            <strong className="text-white">Sports Science Prescription:</strong> {acwrRecommendation}
          </p>
        </div>
      </div>

      {/* 14-Day Trend Chart */}
      {trendData && trendData.length > 0 && (
        <div className="pt-2">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-xs font-bold text-gray-300 uppercase tracking-wider flex items-center gap-1.5">
              <span>14-Day Conditioning & Form Trajectory</span>
            </h4>
            <div className="flex items-center gap-3 text-[11px] text-gray-400">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-brand-peach" /> Conditioning
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-amber-400" /> Fatigue
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400" /> Form
              </span>
            </div>
          </div>

          <div className="h-[220px] w-full bg-black/20 rounded-xl p-2 border border-white/5">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="fitnessGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#EE9B74" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#EE9B74" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="formGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis
                  dataKey="date"
                  stroke="#6b7280"
                  tick={{ fill: '#9ca3af', fontSize: 10 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  stroke="#6b7280"
                  tick={{ fill: '#9ca3af', fontSize: 10 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0c0c0e',
                    borderColor: 'rgba(255,255,255,0.1)',
                    borderRadius: '10px',
                    color: '#fff',
                    fontSize: '11px'
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="fitness"
                  name="Conditioning (CTL)"
                  stroke="#EE9B74"
                  strokeWidth={2.5}
                  fill="url(#fitnessGrad)"
                />
                <Area
                  type="monotone"
                  dataKey="fatigue"
                  name="Fatigue (ATL)"
                  stroke="#F59E0B"
                  strokeWidth={2}
                  fill="none"
                  strokeDasharray="4 4"
                />
                <Area
                  type="monotone"
                  dataKey="form"
                  name="Match Form (TSB)"
                  stroke="#10B981"
                  strokeWidth={2}
                  fill="url(#formGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Sports Science Footnote */}
      <div className="flex items-start gap-2 text-[11px] text-gray-400 bg-white/5 rounded-xl p-3 border border-white/5">
        <FaInfoCircle className="text-brand-peach text-xs mt-0.5 shrink-0" />
        <span>
          <strong>Scientific Principle:</strong> Athletic peak performance occurs when high conditioning (Fitness) intersects with positive freshness (Form &gt; +10). When Form dips below -15, acute fatigue is high, indicating optimal time for rest or mobility deload.
        </span>
      </div>
    </div>
  );
}
