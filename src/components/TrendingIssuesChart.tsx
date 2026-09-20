import React, { useState, useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie,
} from 'recharts';
import {
  TrendingUp,
  BarChart3,
  MapPin,
  Filter,
  Layers,
  CheckCircle2,
  AlertTriangle,
  Info,
  Flame,
  ArrowUpRight,
} from 'lucide-react';
import { Complaint } from '../types';
import { Language, translations } from '../data/translations';

interface TrendingIssuesChartProps {
  complaints?: Complaint[];
  language?: Language;
  selectedWardFilter?: string;
}

// Preset wards in Mysuru with sample counts & aggregated live metrics
const MYSURU_WARDS = [
  { id: 'all', name: 'All Mysuru Wards', zone: 'District Aggregated' },
  { id: 'ward-24', name: 'Ward 24 (K.G. Koppal)', zone: 'MCC Zone 4' },
  { id: 'ward-12', name: 'Ward 12 (Jayalakshmipuram)', zone: 'MCC Zone 3' },
  { id: 'ward-35', name: 'Ward 35 (Kuvempunagar)', zone: 'MCC Zone 5' },
  { id: 'ward-48', name: 'Ward 48 (Hinkal Sector)', zone: 'MCC Zone 8 / GP' },
  { id: 'ward-19', name: 'Ward 19 (Bogadi Urban)', zone: 'Bogadi TMC' },
  { id: 'ward-7', name: 'Ward 7 (Chamundipuram)', zone: 'MCC Zone 2' },
  { id: 'ward-52', name: 'Ward 52 (Vijayanagar)', zone: 'MCC Zone 6' },
];

const CATEGORY_COLORS: Record<string, string> = {
  'Pothole / Road Damage': '#DC2626', // Red
  'Garbage Overflow': '#D97706', // Amber
  'Blocked Drain': '#087F5B', // Civic Green
  'Streetlight Problem': '#2563EB', // Blue
  'Water Issue': '#0284C7', // Sky Blue
  'Construction Waste': '#7C3AED', // Purple
};

export const TrendingIssuesChart: React.FC<TrendingIssuesChartProps> = ({
  complaints = [],
  language = 'en',
  selectedWardFilter = 'all',
}) => {
  const [activeWard, setActiveWard] = useState<string>(selectedWardFilter);
  const [chartMode, setChartMode] = useState<'categories-by-ward' | 'overall-ranking' | 'resolution-status'>('categories-by-ward');
  const [timeframe, setTimeframe] = useState<'7d' | '30d' | 'all'>('30d');

  const t = translations[language];

  // Ward data aggregation
  const wardCategoryData = useMemo(() => {
    // Base dataset representing Mysuru's municipal wards
    const baseWards = [
      {
        ward: 'Ward 24 (K.G. Koppal)',
        zone: 'Zone 4',
        potholes: 34,
        garbage: 22,
        drains: 18,
        streetlights: 12,
        water: 9,
        resolved: 65,
        breached: 8,
        total: 95,
      },
      {
        ward: 'Ward 12 (Jayalakshmi.)',
        zone: 'Zone 3',
        potholes: 16,
        garbage: 28,
        drains: 14,
        streetlights: 19,
        water: 7,
        resolved: 72,
        breached: 3,
        total: 84,
      },
      {
        ward: 'Ward 35 (Kuvempunagar)',
        zone: 'Zone 5',
        potholes: 25,
        garbage: 19,
        drains: 22,
        streetlights: 14,
        water: 15,
        resolved: 68,
        breached: 6,
        total: 95,
      },
      {
        ward: 'Ward 48 (Hinkal)',
        zone: 'Zone 8',
        potholes: 38,
        garbage: 31,
        drains: 19,
        streetlights: 8,
        water: 12,
        resolved: 54,
        breached: 14,
        total: 108,
      },
      {
        ward: 'Ward 19 (Bogadi)',
        zone: 'Bogadi TMC',
        potholes: 29,
        garbage: 24,
        drains: 15,
        streetlights: 11,
        water: 18,
        resolved: 62,
        breached: 9,
        total: 97,
      },
      {
        ward: 'Ward 7 (Chamundipuram)',
        zone: 'Zone 2',
        potholes: 18,
        garbage: 21,
        drains: 27,
        streetlights: 16,
        water: 10,
        resolved: 64,
        breached: 5,
        total: 92,
      },
      {
        ward: 'Ward 52 (Vijayanagar)',
        zone: 'Zone 6',
        potholes: 22,
        garbage: 18,
        drains: 12,
        streetlights: 24,
        water: 11,
        resolved: 71,
        breached: 4,
        total: 87,
      },
    ];

    // Merge any live user-reported complaints into the counts
    if (complaints && complaints.length > 0) {
      complaints.forEach((c) => {
        const loc = (c.locationName || '').toLowerCase();
        let targetIndex = 0;
        if (loc.includes('koppal')) targetIndex = 0;
        else if (loc.includes('jayalakshmi') || loc.includes('kalidasa')) targetIndex = 1;
        else if (loc.includes('kuvempu')) targetIndex = 2;
        else if (loc.includes('hinkal')) targetIndex = 3;
        else if (loc.includes('bogadi')) targetIndex = 4;
        else if (loc.includes('chamundi')) targetIndex = 5;
        else if (loc.includes('vijayanagar')) targetIndex = 6;

        const target = baseWards[targetIndex];
        if (target) {
          if (c.category.includes('Pothole') || c.category.includes('Road')) target.potholes += 1;
          else if (c.category.includes('Garbage')) target.garbage += 1;
          else if (c.category.includes('Drain')) target.drains += 1;
          else if (c.category.includes('Streetlight')) target.streetlights += 1;
          else if (c.category.includes('Water')) target.water += 1;
          target.total += 1;
          if (c.status === 'Resolved' || c.status === 'Closed') target.resolved += 1;
          if (c.status === 'SLA Breached') target.breached += 1;
        }
      });
    }

    // Filter by specific ward if selected
    if (activeWard !== 'all') {
      const matchName = MYSURU_WARDS.find((w) => w.id === activeWard)?.name;
      if (matchName) {
        return baseWards.filter((w) => matchName.includes(w.zone) || matchName.toLowerCase().includes(w.ward.toLowerCase().slice(0, 7)));
      }
    }

    return baseWards;
  }, [complaints, activeWard]);

  // Overall category ranking data
  const overallRankingData = useMemo(() => {
    let totals = {
      potholes: 0,
      garbage: 0,
      drains: 0,
      streetlights: 0,
      water: 0,
    };

    wardCategoryData.forEach((w) => {
      totals.potholes += w.potholes;
      totals.garbage += w.garbage;
      totals.drains += w.drains;
      totals.streetlights += w.streetlights;
      totals.water += w.water;
    });

    return [
      { category: 'Pothole & Road Damage', count: totals.potholes, color: '#DC2626', growth: '+28%', authority: 'MCC Roads / PWD' },
      { category: 'Garbage Overflow', count: totals.garbage, color: '#D97706', growth: '+14%', authority: 'MCC Health (SWM)' },
      { category: 'Blocked Drains / UGD', count: totals.drains, color: '#087F5B', growth: '+9%', authority: 'MCC Drainage Div.' },
      { category: 'Streetlight Issues', count: totals.streetlights, color: '#2563EB', growth: '-6%', authority: 'CESC / Electrical' },
      { category: 'Drinking Water Leaks', count: totals.water, color: '#0284C7', growth: '+4%', authority: 'VVWW Mysuru' },
    ].sort((a, b) => b.count - a.count);
  }, [wardCategoryData]);

  // Custom Recharts Tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white/95 backdrop-blur-md p-3 rounded-2xl shadow-xl border border-slate-200 text-xs space-y-1.5 min-w-[200px]">
          <p className="font-black text-slate-900 border-b border-slate-100 pb-1 flex items-center justify-between">
            <span>{label}</span>
            <span className="text-[10px] text-slate-500 font-mono">Mysuru Municipal</span>
          </p>
          <div className="space-y-1 pt-0.5">
            {payload.map((entry: any, index: number) => (
              <div key={`item-${index}`} className="flex items-center justify-between gap-3">
                <span className="flex items-center gap-1.5 font-medium text-slate-600">
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: entry.color || entry.fill }}
                  />
                  {entry.name}:
                </span>
                <span className="font-mono font-bold text-slate-900">{entry.value} reports</span>
              </div>
            ))}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-sm space-y-5">
      {/* Header with Title & Badges */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center gap-2 text-[#087F5B] text-xs font-bold uppercase tracking-wider mb-1">
            <TrendingUp className="w-4 h-4" />
            <span>Civic Intelligence & Trending Issues</span>
          </div>
          <h2 className="text-xl font-black text-slate-900">
            Top Civic Complaints by Mysuru Ward
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Geographic frequency distribution across MCC zones, Town Municipal Councils & Gram Panchayats.
          </p>
        </div>

        {/* View Mode Toggle Controls */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <div className="flex rounded-xl bg-slate-100 p-1 border border-slate-200">
            <button
              onClick={() => setChartMode('categories-by-ward')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                chartMode === 'categories-by-ward'
                  ? 'bg-white text-[#087F5B] shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Categories by Ward
            </button>
            <button
              onClick={() => setChartMode('overall-ranking')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                chartMode === 'overall-ranking'
                  ? 'bg-white text-[#087F5B] shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Issue Ranking
            </button>
            <button
              onClick={() => setChartMode('resolution-status')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                chartMode === 'resolution-status'
                  ? 'bg-white text-[#087F5B] shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Resolution Rates
            </button>
          </div>

          {/* Ward Dropdown Filter */}
          <div className="flex items-center gap-1.5 bg-slate-50 p-1 rounded-xl border border-slate-200">
            <MapPin className="w-3.5 h-3.5 text-slate-400 ml-1.5" />
            <select
              value={activeWard}
              onChange={(e) => setActiveWard(e.target.value)}
              className="bg-transparent font-medium text-xs text-slate-700 pr-2 py-1 focus:outline-none cursor-pointer"
            >
              {MYSURU_WARDS.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* 4 Stat Highlights */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        <div className="p-3.5 rounded-2xl bg-rose-50/60 border border-rose-200">
          <span className="text-[11px] font-bold text-rose-800 flex items-center gap-1">
            <Flame className="w-3.5 h-3.5 text-rose-600" />
            <span>#1 Issue Volume</span>
          </span>
          <p className="text-lg font-black text-rose-950 mt-1">Potholes & Roads</p>
          <span className="text-[10px] text-rose-700 font-semibold">+28% rise after rain</span>
        </div>

        <div className="p-3.5 rounded-2xl bg-amber-50/60 border border-amber-200">
          <span className="text-[11px] font-bold text-amber-800 flex items-center gap-1">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
            <span>Highest Complaint Ward</span>
          </span>
          <p className="text-lg font-black text-amber-950 mt-1">Ward 48 (Hinkal)</p>
          <span className="text-[10px] text-amber-700 font-semibold">108 active reports</span>
        </div>

        <div className="p-3.5 rounded-2xl bg-emerald-50/60 border border-emerald-200">
          <span className="text-[11px] font-bold text-emerald-800 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Best Resolution Rate</span>
          </span>
          <p className="text-lg font-black text-emerald-950 mt-1">Ward 12 (85.7%)</p>
          <span className="text-[10px] text-emerald-700 font-semibold">Jayalakshmipuram</span>
        </div>

        <div className="p-3.5 rounded-2xl bg-blue-50/60 border border-blue-200">
          <span className="text-[11px] font-bold text-blue-800 flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5 text-blue-600" />
            <span>Fastest Turnaround</span>
          </span>
          <p className="text-lg font-black text-blue-950 mt-1">Streetlights (1.8d)</p>
          <span className="text-[10px] text-blue-700 font-semibold">CESC Mysuru Division</span>
        </div>
      </div>

      {/* Main Recharts Container */}
      <div className="w-full h-[360px] pt-2">
        {chartMode === 'categories-by-ward' && (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={wardCategoryData}
              margin={{ top: 20, right: 30, left: 0, bottom: 25 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
              <XAxis
                dataKey="ward"
                stroke="#64748B"
                fontSize={11}
                tickLine={false}
                interval={0}
                angle={-15}
                textAnchor="end"
              />
              <YAxis
                stroke="#64748B"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                label={{ value: 'Number of Reports', angle: -90, position: 'insideLeft', fontSize: 11, fill: '#64748B' }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                verticalAlign="top"
                align="right"
                wrapperStyle={{ paddingBottom: '12px', fontSize: '11px' }}
              />
              <Bar dataKey="potholes" name="Potholes / Road" fill="#DC2626" radius={[4, 4, 0, 0]} />
              <Bar dataKey="garbage" name="Garbage Overflow" fill="#D97706" radius={[4, 4, 0, 0]} />
              <Bar dataKey="drains" name="Blocked Drains" fill="#087F5B" radius={[4, 4, 0, 0]} />
              <Bar dataKey="streetlights" name="Streetlights" fill="#2563EB" radius={[4, 4, 0, 0]} />
              <Bar dataKey="water" name="Drinking Water" fill="#0284C7" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}

        {chartMode === 'overall-ranking' && (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={overallRankingData}
              layout="vertical"
              margin={{ top: 10, right: 30, left: 120, bottom: 10 }}
            >
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E2E8F0" />
              <XAxis type="number" stroke="#64748B" fontSize={11} tickLine={false} />
              <YAxis
                type="category"
                dataKey="category"
                stroke="#1E293B"
                fontSize={11}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip
                formatter={(value: any, name: any, item: any) => [
                  `${value} complaints (${item.payload.growth} trend)`,
                  `Responsible: ${item.payload.authority}`,
                ]}
              />
              <Bar dataKey="count" name="Reported Volume" radius={[0, 8, 8, 0]}>
                {overallRankingData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}

        {chartMode === 'resolution-status' && (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={wardCategoryData}
              margin={{ top: 20, right: 30, left: 0, bottom: 25 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
              <XAxis
                dataKey="ward"
                stroke="#64748B"
                fontSize={11}
                tickLine={false}
                interval={0}
                angle={-15}
                textAnchor="end"
              />
              <YAxis
                stroke="#64748B"
                fontSize={11}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                verticalAlign="top"
                align="right"
                wrapperStyle={{ paddingBottom: '12px', fontSize: '11px' }}
              />
              <Bar dataKey="resolved" name="Verified Resolved" fill="#16A34A" stackId="a" radius={[0, 0, 0, 0]} />
              <Bar dataKey="breached" name="SLA Overdue / Breached" fill="#DC2626" stackId="a" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Footer Notes & Statutory Attribution */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 border-t border-slate-100 text-[11px] text-slate-500">
        <div className="flex items-center gap-1.5">
          <Info className="w-3.5 h-3.5 text-slate-400" />
          <span>Data derived from Mysuru City Corporation (MCC) Ward Control Rooms & Namma Sethu telemetry.</span>
        </div>
        <span className="font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
          DEMO DATA — Civic Hackathon Demonstration
        </span>
      </div>
    </div>
  );
};
