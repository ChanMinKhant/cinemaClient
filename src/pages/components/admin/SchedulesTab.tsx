import { useEffect, useState } from 'react';
import api from '@/lib/api';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Trash2, Plus, Pencil } from 'lucide-react';

/* ======================
    Types
====================== */
type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T;
};

type Movie = {
  id: number;
  title: string;
};

type Showtime = {
  id: number;
  movieId: number;
  room: string;
  showDate: string | number; // timestamp or ISO string
  showTime: string;
};

const ROOM_OPTIONS = ['A', 'B', 'C'];

/* ======================
    Helper functions
====================== */
const formatDate = (value: string | number) => {
  if (!value) return '—';
  const date =
    typeof value === 'number' ? new Date(value) : new Date(`${value}T00:00:00`);
  return date.toLocaleDateString('en-GB', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
  });
};

const formatDateSmart = (value: string | number) => {
  const d =
    typeof value === 'number' ? new Date(value) : new Date(value + 'T00:00:00');
  const today = new Date();
  if (d.toDateString() === today.toDateString()) return 'Today';
  today.setDate(today.getDate() + 1);
  if (d.toDateString() === today.toDateString()) return 'Tomorrow';
  return formatDate(value);
};

/* ======================
    Component
====================== */
export default function SchedulesTab() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [showtimes, setShowtimes] = useState<Showtime[]>([]);
  const [loading, setLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  /* ===== Filters ===== */
  const [filterMovie, setFilterMovie] = useState<string>('all');
  const [filterRoom, setFilterRoom] = useState<string>('all');
  const [filterDate, setFilterDate] = useState('');

  /* ===== Form State ===== */
  const [editing, setEditing] = useState<Showtime | null>(null);
  const [movieId, setMovieId] = useState('');
  const [room, setRoom] = useState('');
  const [showDate, setShowDate] = useState('');
  const [showTime, setShowTime] = useState('');

  /* ===== Load Data ===== */
  const loadData = async () => {
    try {
      setLoading(true);
      const [mRes, sRes] = await Promise.all([
        api.get<ApiResponse<Movie[]>>('/movies'),
        api.get<ApiResponse<Showtime[]>>('/showtimes'),
      ]);
      setMovies(mRes.data.data);
      setShowtimes(sRes.data.data);
    } catch (e) {
      console.error('Failed to load schedules', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  /* ===== Form Helpers ===== */
  const resetForm = () => {
    setEditing(null);
    setMovieId('');
    setRoom('');
    setShowDate('');
    setShowTime('');
  };

  const handleEditClick = (s: Showtime) => {
    setEditing(s);
    setMovieId(String(s.movieId));
    setRoom(s.room);
    setShowDate(
      typeof s.showDate === 'number'
        ? new Date(s.showDate).toISOString().slice(0, 10)
        : s.showDate,
    );
    setShowTime(s.showTime.slice(0, 5));
    setIsDialogOpen(true);
  };

  const saveShowtime = async () => {
    if (!showDate || !showTime || !movieId || !room) {
      alert('Please fill in all fields, including the date.');
      return;
    }

    const payload = {
      id: editing?.id,
      movieId: Number(movieId),
      room,
      showDate,
      showTime: showTime.length === 5 ? `${showTime}:00` : showTime,
    };

    try {
      if (editing) {
        await api.put('/showtimes', payload);
      } else {
        await api.post('/showtimes', payload);
      }
      setIsDialogOpen(false);
      resetForm();
      loadData();
    } catch (e) {
      console.error('Save failed', e);
    }
  };

  const deleteShowtime = async (id: number) => {
    try {
      await api.delete(`/showtimes/${id}`);
      setShowtimes((prev) => prev.filter((s) => s.id !== id));
    } catch (e) {
      console.error('Delete failed', e);
    }
  };

  /* ===== Filtered showtimes ===== */
  const filtered = showtimes.filter((s) => {
    if (filterMovie !== 'all' && s.movieId !== Number(filterMovie))
      return false;
    if (filterRoom !== 'all' && s.room !== filterRoom) return false;
    if (filterDate && s.showDate.toString().slice(0, 10) !== filterDate)
      return false;
    return true;
  });

  /* ===== UI ===== */
  return (
    <Card className='border-white/5 bg-black/40'>
      <CardHeader className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2'>
        <div>
          <CardTitle>Showtime Schedules</CardTitle>
          <CardDescription>Manage movie schedules</CardDescription>
        </div>

        <Dialog
          open={isDialogOpen}
          onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) resetForm();
          }}
        >
          <DialogTrigger asChild>
            <Button
              className='gap-2'
              onClick={() => {
                resetForm();
                setIsDialogOpen(true);
              }}
            >
              <Plus className='w-4 h-4' /> Add Schedule
            </Button>
          </DialogTrigger>

          <DialogContent className='sm:max-w-[425px]'>
            <DialogHeader>
              <DialogTitle>
                {editing ? 'Edit Schedule' : 'Add Schedule'}
              </DialogTitle>
            </DialogHeader>

            <div className='space-y-4 py-4'>
              <div className='space-y-2'>
                <Label>Movie</Label>
                <Select value={movieId} onValueChange={setMovieId}>
                  <SelectTrigger>
                    <SelectValue placeholder='Select movie' />
                  </SelectTrigger>
                  <SelectContent>
                    {movies.map((m) => (
                      <SelectItem key={m.id} value={String(m.id)}>
                        {m.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className='space-y-2'>
                <Label>Room</Label>
                <Select value={room} onValueChange={setRoom}>
                  <SelectTrigger>
                    <SelectValue placeholder='Select room' />
                  </SelectTrigger>
                  <SelectContent>
                    {ROOM_OPTIONS.map((r) => (
                      <SelectItem key={r} value={r}>
                        Room {r}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className='space-y-2'>
                <Label htmlFor='date-input'>Show Date</Label>
                <Input
                  id='date-input'
                  type='date'
                  className='block w-full'
                  value={showDate}
                  onChange={(e) => setShowDate(e.target.value)}
                  required
                />
              </div>

              <div className='space-y-2'>
                <Label>Show Time</Label>
                <Input
                  type='time'
                  value={showTime}
                  onChange={(e) => setShowTime(e.target.value)}
                  required
                />
              </div>

              <Button onClick={saveShowtime} className='w-full mt-4'>
                {editing ? 'Update Schedule' : 'Save Schedule'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </CardHeader>

      <CardContent>
        {/* Filters */}
        <div className='grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4'>
          <Select value={filterMovie} onValueChange={setFilterMovie}>
            <SelectTrigger>
              <SelectValue placeholder='Movie' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='all'>All Movies</SelectItem>
              {movies.map((m) => (
                <SelectItem key={m.id} value={String(m.id)}>
                  {m.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={filterRoom} onValueChange={setFilterRoom}>
            <SelectTrigger>
              <SelectValue placeholder='Room' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='all'>All Rooms</SelectItem>
              {ROOM_OPTIONS.map((r) => (
                <SelectItem key={r} value={r}>
                  Room {r}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Input
            type='date'
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
          />
        </div>

        {/* Table */}
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Movie</TableHead>
              <TableHead>Room</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Time</TableHead>
              <TableHead className='text-right'>Action</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} className='text-center'>
                  Loading...
                </TableCell>
              </TableRow>
            ) : filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className='text-center'>
                  No schedules found
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((s) => (
                <TableRow key={s.id}>
                  <TableCell className='font-medium'>
                    {movies.find((m) => m.id === s.movieId)?.title || '—'}
                  </TableCell>
                  <TableCell>
                    <span className='rounded-md bg-muted px-2 py-1 text-xs'>
                      Room {s.room}
                    </span>
                  </TableCell>
                  <TableCell>{formatDateSmart(s.showDate)}</TableCell>
                  <TableCell>{s.showTime.slice(0, 5)}</TableCell>
                  <TableCell className='text-right'>
                    <div className='flex justify-end gap-1'>
                      <Button
                        variant='ghost'
                        size='icon'
                        onClick={() => handleEditClick(s)}
                      >
                        <Pencil className='w-4 h-4' />
                      </Button>
                      <Button
                        variant='ghost'
                        size='icon'
                        className='hover:text-destructive'
                        onClick={() => deleteShowtime(s.id)}
                      >
                        <Trash2 className='w-4 h-4' />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
