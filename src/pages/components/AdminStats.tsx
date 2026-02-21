import { useStore } from '@/lib/store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, Users, Film } from 'lucide-react';

export default function AdminStats() {
  const { movies, bookings } = useStore();

  const totalIncome = bookings.reduce((s, b) => s + b.totalPrice, 0);
  const totalSeats = bookings.reduce((s, b) => s + b.seats.length, 0);

  return (
    <div className='grid md:grid-cols-3 gap-6'>
      <StatCard
        title='Total Income'
        value={totalIncome}
        icon={<DollarSign />}
      />
      <StatCard title='Seats Booked' value={totalSeats} icon={<Users />} />
      <StatCard title='Active Movies' value={movies.length} icon={<Film />} />
    </div>
  );
}

function StatCard({
  title,
  value,
  icon,
}: {
  title: string;
  value: number;
  icon: React.ReactNode;
}) {
  return (
    <Card className='glass border-white/5'>
      <CardHeader className='pb-2'>
        <CardTitle className='text-sm'>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className='text-4xl font-bold flex gap-2 items-center'>
          {icon} {value}
        </div>
      </CardContent>
    </Card>
  );
}
