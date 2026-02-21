import { useStore } from '@/lib/store';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

export default function BookingsTab() {
  const { bookings } = useStore();

  return (
    <Card className='border-white/5 bg-black/40'>
      <CardHeader>
        <CardTitle>Recent Bookings</CardTitle>
        <CardDescription>Live log of customer reservations</CardDescription>
      </CardHeader>

      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Movie</TableHead>
              <TableHead>Schedule</TableHead>
              <TableHead>Seats</TableHead>
              <TableHead className='text-right'>Amount</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {[...bookings].reverse().map((b) => (
              <TableRow key={b.id}>
                <TableCell className='font-medium'>{b.username}</TableCell>

                <TableCell>{b.movieTitle}</TableCell>

                <TableCell className='text-xs text-muted-foreground'>
                  <div>{b.date}</div>
                  <div>
                    {b.time} · Room {b.room}
                  </div>
                </TableCell>

                <TableCell>
                  <div className='flex gap-1 flex-wrap'>
                    {b.seats.map((s) => (
                      <span
                        key={s}
                        className='px-1 text-xs rounded bg-white/10'
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </TableCell>

                <TableCell className='text-right font-mono text-primary'>
                  ${b.totalPrice}
                </TableCell>
              </TableRow>
            ))}

            {bookings.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className='text-center py-8 text-muted-foreground'
                >
                  No bookings yet
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
