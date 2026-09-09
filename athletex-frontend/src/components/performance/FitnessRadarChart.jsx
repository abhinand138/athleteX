import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  Tooltip,
  Legend
} from 'recharts';
import { FaBolt, FaRunning, FaDumbbell, FaHeartbeat, FaCheckCircle, FaShieldAlt } from 'react-icons/fa';

export default function FitnessRadarChart({ radarData = [], overallScore = 0 }) {
  if (!radarData || radarData.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-400">
        No athletic radar metrics available yet.
      </div>
    );
  }

  const getPillarIcon = (pillar) => {
    switch (pillar.toLowerCase()) {
      case 'speed':
        return <FaBolt className="text-amber-400" />;
      case 'endurance':
        return <FaHeartbeat className="text-rose-400" />;
      case 'strength':
        return <FaDumbbell className="text-purple-400" />;
      case 'agility':
        return <FaRunning className="text-emerald-400" />;
      case 'consistency':
        return <FaCheckCircle className="text-blue-400" />;
      default:
        return <FaShieldAlt className="text-brand-peach" />;
    }
  };

  return (
    <div className="glass-card rounded-2xl p-6 border border-white/5 relative overflow-hidden">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-brand-peach animate-pulse" />
            <h3 className="text-lg font-bold text-white tracking-wide">
              5-Pillar Athletic Radar Profile
            </h3>
          </div>
          <p className="text-xs text-gray-400 mt-1">
            Holistic athletic index evaluated across Speed, Strength, Endurance, Agility & Consistency.
          </p>
        </div>
        <div className="flex items-center gap-3 bg-white/5 px-3 py-1.5 rounded-xl border border-white/10">
          <span className="text-xs text-gray-400">Fitness Index</span>
          <span className="text-base font-black text-brand-peach">{overallScore}</span>
          <span className="text-[10px] text-gray-500">/ 100</span>
        </div>
      </div>

      {/* Radar Chart */}
      <div className="h-[280px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarData}>
            <PolarGrid stroke="rgba(255, 255, 255, 0.1)" strokeDasharray="3 3" />
            <PolarAngleAxis
              dataKey="pillar"
              stroke="#9ca3af"
              tick={{ fill: '#e5e7eb', fontSize: 12, fontWeight: 600 }}
            />
            <PolarRadiusAxis
              angle={90}
              domain={[0, 100]}
              stroke="rgba(255, 255, 255, 0.15)"
              tick={{ fill: '#6b7280', fontSize: 10 }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#0c0c0e',
                borderColor: 'rgba(238, 155, 116, 0.3)',
                borderRadius: '12px',
                color: '#fff',
                fontSize: '12px',
                boxShadow: '0 8px 30px rgba(0,0,0,0.5)'
              }}
            />
            <Legend
              wrapperStyle={{ paddingTop: '10px', fontSize: '11px' }}
              iconType="circle"
            />
            <Radar
              name="Athlete Rating"
              dataKey="value"
              stroke="#EE9B74"
              fill="#EE9B74"
              fillOpacity={0.45}
              strokeWidth={2.5}
            />
            <Radar
              name="Division Benchmark"
              dataKey="benchmark"
              stroke="#38BDF8"
              fill="#38BDF8"
              fillOpacity={0.15}
              strokeWidth={1.5}
              strokeDasharray="4 4"
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      {/* Pillar Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 mt-4 pt-4 border-t border-white/5">
        {radarData.map((item) => {
          const isAboveBenchmark = item.value >= item.benchmark;
          return (
            <div
              key={item.pillar}
              className="bg-black/30 rounded-xl p-2.5 border border-white/5 flex flex-col items-center text-center transition hover:border-brand-peach/30"
            >
              <div className="flex items-center gap-1.5 text-xs text-gray-300 font-medium mb-1">
                {getPillarIcon(item.pillar)}
                <span>{item.pillar}</span>
              </div>
              <div className="text-base font-bold text-white">
                {item.value}
                <span className="text-[10px] text-gray-500 font-normal ml-0.5">/ 100</span>
              </div>
              <div className="mt-1 flex items-center gap-1">
                <span className={`text-[10px] font-semibold px-1.5 py-0.2 rounded ${
                  isAboveBenchmark ? 'bg-emerald-500/15 text-emerald-400' : 'bg-amber-500/15 text-amber-400'
                }`}>
                  {isAboveBenchmark ? `+${(item.value - item.benchmark).toFixed(0)} vs BM` : `${(item.value - item.benchmark).toFixed(0)} vs BM`}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
