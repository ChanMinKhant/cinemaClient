import { useEffect, useMemo, useState } from 'react';
import { useMovieStore } from '@/stores/movie.store';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { Loader2, AlertCircle, TrendingUp } from 'lucide-react';

/* ======================
   UX CONSTANTS
====================== */
const MAX_LABEL_LENGTH = 12;
const DEFAULT_VISIBLE = 10;

export default function DashboardTab() {
  const { movies, loading, error, fetchMovies } = useMovieStore();
  const [visibleCount, setVisibleCount] = useState(DEFAULT_VISIBLE);

  useEffect(() => {
    fetchMovies();
  }, [fetchMovies]);

  /* ======================
      Helpers
  ====================== */
  const formatKyat = (value: number) =>
    new Intl.NumberFormat('en-US').format(value) + ' Ks';

  const truncate = (text: string) =>
    text.length > MAX_LABEL_LENGTH
      ? text.slice(0, MAX_LABEL_LENGTH) + '…'
      : text;

  /* ======================
      Data Preparation
  ====================== */
  const chartData = useMemo(() => {
    return [...movies]
      .sort((a, b) => (b.income || 0) - (a.income || 0))
      .slice(0, visibleCount)
      .map((m) => ({
        shortName: truncate(m.title),
        fullName: m.title,
        income: m.income || 0,
      }));
  }, [movies, visibleCount]);

  return (
    <Card className="border-white/5 bg-black/40 shadow-2xl overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between border-b border-white/5 bg-white/[0.02] mb-6">
        <div>
          <CardTitle className="text-xl font-black uppercase italic tracking-tighter flex items-center gap-2">
            <TrendingUp className="text-primary" size={20} />
            Income Overview
          </CardTitle>
          <CardDescription className="text-[10px] uppercase tracking-widest font-bold text-slate-500">
            Revenue per movie (MMK)
          </CardDescription>
        </div>

        {error && (
          <div className="flex items-center gap-2 text-red-500 text-[10px] font-black uppercase bg-red-500/10 px-3 py-1 rounded-full border border-red-500/20">
            <AlertCircle size={14} /> Sync Error
          </div>
        )}
      </CardHeader>

      <CardContent>
        <div className="h-[420px] w-full min-h-0 relative">
          {loading && movies.length === 0 ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/20 rounded-xl">
              <Loader2 className="animate-spin text-primary w-8 h-8" />
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                Syncing Financial Data…
              </span>
            </div>
          ) : movies.length === 0 ? (
            <div className="absolute inset-0 flex items-center justify-center text-slate-600 italic text-sm">
              No data available
            </div>
          ) : (
            <div className="w-full overflow-x-auto">
              <div
                className="min-w-[700px]"
                style={{ height: '400px' }}
              >
                <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                  <BarChart
                    data={chartData}
                    margin={{ top: 10, right: 20, left: 0, bottom: 70 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                      stroke="rgba(255,255,255,0.05)"
                    />
                    <XAxis
                      dataKey="shortName"
                      angle={0}
                      textAnchor="end"
                      interval={0}
                      height={70}
                      tick={{
                        fill: '#888',
                        fontSize: 10,
                        fontWeight: 700,
                      }}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      tickFormatter={(v) =>
                        v >= 1000 ? `${v / 1000}k` : v
                      }
                      tickLine={false}
                      axisLine={false}
                      tick={{ fill: '#666', fontSize: 10 }}
                      width={40}
                    />
                    <Tooltip
                      cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                      contentStyle={{
                        backgroundColor: '#09090b',
                        borderColor: 'rgba(255,255,255,0.1)',
                        borderRadius: '12px',
                        fontSize: '12px',
                      }}
                      formatter={(v: number, _, item) => [
                        formatKyat(v),
                        item.payload.fullName,
                      ]}
                    />
                    <Bar
                      dataKey="income"
                      fill="hsl(45 93% 47%)"
                      radius={[6, 6, 0, 0]}
                      barSize={36}
                      className="drop-shadow-[0_0_12px_rgba(216,180,0,0.25)]"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </div>

        {/* Controls */}
        {movies.length > DEFAULT_VISIBLE && (
          <div className="flex justify-center mt-4">
            <button
              onClick={() =>
                setVisibleCount((v) =>
                  v === DEFAULT_VISIBLE ? movies.length : DEFAULT_VISIBLE
                )
              }
              className="text-[10px] uppercase tracking-widest font-bold text-primary hover:underline"
            >
              {visibleCount === DEFAULT_VISIBLE
                ? 'Show All Movies'
                : 'Show Top Movies'}
            </button>
          </div>
        )}
      </CardContent>

      <div className="px-6 py-4 bg-white/[0.02] border-t border-white/5">
        <p className="text-[9px] text-slate-600 font-bold uppercase tracking-[0.2em] text-center">
          Last Updated: {new Date().toLocaleTimeString()} • Live Financial Sync
        </p>
      </div>
    </Card>
  );
}