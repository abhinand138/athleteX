import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

export default function PerformanceChart({ historyData = [] }) {
  if (!historyData || historyData.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        No performance history available yet. Update your performance to start tracking!
      </div>
    );
  }

  // Format the data for the chart
  const data = historyData.map(item => ({
    date: new Date(item.recordedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
    score: item.overallScore
  }));

  return (
    <div className="h-[300px] w-full mt-6">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{
            top: 10,
            right: 0,
            left: -20,
            bottom: 0,
          }}
        >
          <defs>
            <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#ff7b54" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#ff7b54" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
          <XAxis 
            dataKey="date" 
            stroke="#9ca3af" 
            tick={{fill: '#9ca3af', fontSize: 12}} 
            axisLine={false}
            tickLine={false}
            dy={10}
          />
          <YAxis 
            stroke="#9ca3af" 
            tick={{fill: '#9ca3af', fontSize: 12}}
            axisLine={false}
            tickLine={false}
            domain={[0, 100]}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#111317', 
              borderColor: 'rgba(255,255,255,0.1)',
              borderRadius: '12px',
              color: '#fff'
            }}
            itemStyle={{ color: '#ff7b54', fontWeight: 'bold' }}
          />
          <Area 
            type="monotone" 
            dataKey="score" 
            name="Overall Score"
            stroke="#ff7b54" 
            strokeWidth={3}
            fillOpacity={1} 
            fill="url(#colorScore)" 
            animationDuration={1500}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
