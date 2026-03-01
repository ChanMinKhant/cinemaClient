import { useEffect, useState, useMemo } from 'react';
import { useShowtimeStore } from '@/stores/showtime.store';
import { useMovieStore } from '@/stores/movie.store';
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
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Trash2, Plus, Pencil, Loader2, CalendarDays, MapPin, Clock } from 'lucide-react';
import { toast } from 'react-toastify';

const ROOM_OPTIONS = ['A', 'B', 'C'];

export default function SchedulesTab() {
  // 1. Consume Global Stores
  const { showtimes, loading: sLoading, fetchShowtimes, addShowtime, updateShowtime, deleteShowtime } = useShowtimeStore();
  const { movies, fetchMovies, loading: mLoading } = useMovieStore();

  // 2. Local UI State
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [filterMovie, setFilterMovie] = useState<string>('all');
  const [filterRoom, setFilterRoom] = useState<string>('all');
  const [filterDate, setFilterDate] = useState('');

  // 3. Form State
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState({
    movieId: '',
    room: '',
    showDate: '',
    showTime: '',
  });

  useEffect(() => {
    fetchShowtimes();
    fetchMovies();
  }, [fetchShowtimes, fetchMovies]);

  // Helpers for Date display
  const formatDateSmart = (timestamp: number) => {
    const d = new Date(timestamp);
    const today = new Date();
    if (d.toDateString() === today.toDateString()) return 'Today';
    today.setDate(today.getDate() + 1);
    if (d.toDateString() === today.toDateString()) return 'Tomorrow';
    return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const handleEditClick = (s: any) => {
    setEditingId(s.id);
    setForm({
      movieId: String(s.movieId),
      room: s.room,
      showDate: new Date(s.showDate).toISOString().split('T')[0],
      showTime: s.showTime.slice(0, 5),
    });
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    const { movieId, room, showDate, showTime } = form;
    if (!movieId || !room || !showDate || !showTime) {
      toast.error("Please fill all fields");
      return;
    }

    // Convert string date to timestamp for the backend
    const timestamp = new Date(showDate).getTime();
    const formattedTime = showTime.length === 5 ? `${showTime}:00` : showTime;

    const payload = {
      movieId: Number(movieId),
      room: room as any,
      showDate: timestamp,
      showTime: formattedTime,
    };

    try {
      if (editingId) {
        await updateShowtime({ id: editingId, ...payload });
        toast.success("Schedule updated");
      } else {
        await addShowtime(payload);
        toast.success("Schedule created");
      }
      setIsDialogOpen(false);
      setEditingId(null);
      setForm({ movieId: '', room: '', showDate: '', showTime: '' });
    } catch (e) {
      toast.error("Operation failed");
    }
  };

  // 4. Memoized Filtering logic
  const filteredShowtimes = useMemo(() => {
    return showtimes.filter((s) => {
      const matchMovie = filterMovie === 'all' || s.movieId === Number(filterMovie);
      const matchRoom = filterRoom === 'all' || s.room === filterRoom;
      const matchDate = !filterDate || new Date(s.showDate).toISOString().split('T')[0] === filterDate;
      return matchMovie && matchRoom && matchDate;
    });
  }, [showtimes, filterMovie, filterRoom, filterDate]);

  const isLoading = sLoading || mLoading;

  return (
    <Card className='border-white/5 bg-black/40 shadow-2xl animate-in fade-in duration-500'>
      <CardHeader className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-white/5 pb-6'>
        <div>
          <CardTitle className="text-xl font-black uppercase italic tracking-tighter">Showtime Schedules</CardTitle>
          <CardDescription className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Coordinate movie screenings & rooms</CardDescription>
        </div>

        <Button 
          className='gap-2 font-bold uppercase italic' 
          onClick={() => {
            setEditingId(null);
            setForm({ movieId: '', room: '', showDate: '', showTime: '' });
            setIsDialogOpen(true);
          }}
        >
          <Plus size={16} /> Add Schedule
        </Button>
      </CardHeader>

      <CardContent className="pt-6">
        {/* FILTERS BAR */}
        <div className='grid grid-cols-1 sm:grid-cols-4 gap-3 mb-6'>
          <Select value={filterMovie} onValueChange={setFilterMovie}>
            <SelectTrigger className="bg-white/5 border-white/10 h-10">
              <SelectValue placeholder='Filter Movie' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='all'>All Movies</SelectItem>
              {movies.map((m) => (
                <SelectItem key={m.id} value={String(m.id)}>{m.title}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={filterRoom} onValueChange={setFilterRoom}>
            <SelectTrigger className="bg-white/5 border-white/10 h-10">
              <SelectValue placeholder='Filter Room' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='all'>All Rooms</SelectItem>
              {ROOM_OPTIONS.map((r) => (
                <SelectItem key={r} value={r}>Room {r}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="relative">
            <CalendarDays className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={14} />
            <Input
              type='date'
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              className="bg-white/5 border-white/10 pl-10 h-10"
            />
          </div>
          
          {(filterMovie !== 'all' || filterRoom !== 'all' || filterDate) && (
            <Button variant="ghost" onClick={() => { setFilterMovie('all'); setFilterRoom('all'); setFilterDate(''); }} className="text-[10px] uppercase font-black text-slate-500">
              Clear Filters
            </Button>
          )}
        </div>

        {/* SCHEDULE TABLE */}
        <div className="rounded-xl border border-white/5 overflow-hidden">
          <Table>
            <TableHeader className="bg-white/5">
              <TableRow className="border-white/5">
                <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-400">Movie Title</TableHead>
                <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-400">Location</TableHead>
                <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-400">Date</TableHead>
                <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-400">Time</TableHead>
                <TableHead className='text-right text-[10px] font-black uppercase tracking-widest text-slate-400'>Actions</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {isLoading && showtimes.length === 0 ? (
                <TableRow><TableCell colSpan={5} className='h-40 text-center'><Loader2 className="animate-spin mx-auto text-primary" /></TableCell></TableRow>
              ) : filteredShowtimes.length === 0 ? (
                <TableRow><TableCell colSpan={5} className='h-40 text-center text-slate-500 italic uppercase text-[10px] font-bold tracking-widest'>No schedules found for these filters</TableCell></TableRow>
              ) : (
                filteredShowtimes.map((s) => (
                  <TableRow key={s.id} className="border-white/5 group hover:bg-white/[0.02] transition-colors">
                    <TableCell className='font-bold text-white py-4'>
                      {movies.find((m) => m.id === s.movieId)?.title || 'Unknown Movie'}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 px-2 py-1 rounded bg-primary/10 border border-primary/20 w-fit">
                        <MapPin size={10} className="text-primary" />
                        <span className='text-[10px] font-black text-primary'>ROOM {s.room}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-slate-300 text-sm font-medium">
                       {formatDateSmart(s.showDate)}
                    </TableCell>
                    <TableCell className="text-slate-300">
                       <div className="flex items-center gap-2">
                         <Clock size={12} className="text-slate-500" />
                         <span className="font-mono">{s.showTime.slice(0, 5)}</span>
                       </div>
                    </TableCell>
                    <TableCell className='text-right'>
                      <div className='flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity'>
                        <Button variant='ghost' size='icon' onClick={() => handleEditClick(s)} className="h-8 w-8 hover:bg-white/10"><Pencil size={14} /></Button>
                        <Button 
                          variant='ghost' 
                          size='icon' 
                          className='h-8 w-8 hover:text-destructive hover:bg-destructive/10' 
                          onClick={() => { if(confirm("Delete this schedule?")) deleteShowtime(s.id); }}
                        >
                          <Trash2 size={14} />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>

      {/* MODAL FORM */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className='glass border-white/10 text-white'>
          <DialogHeader>
            <DialogTitle className="font-black italic uppercase">{editingId ? 'Edit Schedule' : 'Create New Schedule'}</DialogTitle>
          </DialogHeader>

          <div className='space-y-4 pt-4'>
            <div className='space-y-2'>
              <Label className="text-[10px] font-black uppercase text-slate-500">Target Movie</Label>
              <Select value={form.movieId} onValueChange={(v) => setForm({...form, movieId: v})}>
                <SelectTrigger className="bg-white/5 border-white/10"><SelectValue placeholder='Select movie' /></SelectTrigger>
                <SelectContent>{movies.map((m) => (<SelectItem key={m.id} value={String(m.id)}>{m.title}</SelectItem>))}</SelectContent>
              </Select>
            </div>

            <div className='space-y-2'>
              <Label className="text-[10px] font-black uppercase text-slate-500">Cinema Room</Label>
              <Select value={form.room} onValueChange={(v) => setForm({...form, room: v})}>
                <SelectTrigger className="bg-white/5 border-white/10"><SelectValue placeholder='Select room' /></SelectTrigger>
                <SelectContent>{ROOM_OPTIONS.map((r) => (<SelectItem key={r} value={r}>Room {r}</SelectItem>))}</SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className='space-y-2'>
                <Label className="text-[10px] font-black uppercase text-slate-500">Date</Label>
                <Input type='date' value={form.showDate} onChange={(e) => setForm({...form, showDate: e.target.value})} className="bg-white/5 border-white/10" />
              </div>
              <div className='space-y-2'>
                <Label className="text-[10px] font-black uppercase text-slate-500">Time</Label>
                <Input type='time' value={form.showTime} onChange={(e) => setForm({...form, showTime: e.target.value})} className="bg-white/5 border-white/10" />
              </div>
            </div>

            <Button onClick={handleSave} className='w-full font-bold uppercase italic mt-4' disabled={isLoading}>
              {isLoading ? <Loader2 className="animate-spin" /> : editingId ? 'Update Schedule' : 'Confirm Schedule'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
}