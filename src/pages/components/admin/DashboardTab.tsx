import { useEffect, useState } from 'react';
import api from '@/lib/api';

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

/* ======================
    Types
====================== */
type Movie = {
  id: number;
  title: string;
  duration: number;
  income: number;
};

type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T;
};

export default function DashboardTab() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(false);

  /* ======================
      Fetch movies
  ====================== */
  const fetchMovies = async () => {
    try {
      setLoading(true);
      const res = await api.get<ApiResponse<Movie[]>>('/movies');
      setMovies(res.data.data);
    } catch (err) {
      console.error('Failed to fetch dashboard movies', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMovies();
  }, []);

  /* ======================
      Formatting Helper
  ====================== */
  // Formats 1000000 to "1,000,000 Ks"
  const formatKyat = (value: number) => {
    return new Intl.NumberFormat('en-US').format(value) + ' Ks';
  };

  /* ======================
      Chart data
  ====================== */
  const chartData = movies.map((m) => ({
    name: m.title,
    income: m.income,
  }));

  return (
    <Card className='border-white/5 bg-black/40'>
      <CardHeader>
        <CardTitle>Income Overview</CardTitle>
        <CardDescription>Revenue generated per movie (MMK)</CardDescription>
      </CardHeader>

      <CardContent className='h-96'>
        {loading ? (
          <div className='h-full flex items-center justify-center text-muted-foreground'>
            Loading chart...
          </div>
        ) : (
          <ResponsiveContainer width='100%' height='100%'>
            <BarChart
              data={chartData}
              margin={{ top: 20, right: 30, left: 40, bottom: 5 }}
            >
              <CartesianGrid
                strokeDasharray='3 3'
                vertical={false}
                stroke='rgba(255,255,255,0.1)'
              />
              <XAxis
                dataKey='name'
                tickLine={false}
                axisLine={false}
                tick={{ fill: '#888' }}
              />
              <YAxis
                // Updated to show "Ks" and handle large numbers
                tickFormatter={(v) => `${v.toLocaleString()}`}
                tickLine={false}
                axisLine={false}
                tick={{ fill: '#888' }}
              />
              <Tooltip
                cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                contentStyle={{ backgroundColor: '#111', borderColor: '#333' }}
                // Handle 'undefined' by checking if v exists before formatting
                formatter={(v: number | string | undefined) => {
                  if (typeof v === 'number') {
                    return [formatKyat(v), 'Income'];
                  }
                  return [v || '0', 'Income'];
                }}
              />
              <Bar
                dataKey='income'
                fill='hsl(45 93% 47%)'
                radius={[4, 4, 0, 0]}
                barSize={48}
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
