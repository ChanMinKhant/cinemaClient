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
import { Label } from '@/components/ui/label';
import { Trash2, Plus } from 'lucide-react';

/* ========================
   Types
======================== */
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

export default function MoviesTab() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [title, setTitle] = useState('');
  const [duration, setDuration] = useState('');
  const [loading, setLoading] = useState(false);

  /* ========================
     Fetch movies
  ======================== */
  const fetchMovies = async () => {
    try {
      setLoading(true);
      const res = await api.get<ApiResponse<Movie[]>>('/movies');
      setMovies(res.data.data);
    } catch (err) {
      console.error('Failed to fetch movies', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMovies();
  }, []);

  /* ========================
     Create movie
  ======================== */
  const submit = async () => {
    if (!title || !duration) return;

    try {
      await api.post<ApiResponse<Movie>>('/movies', {
        title,
        duration: Number(duration),
      });

      setTitle('');
      setDuration('');
      fetchMovies();
    } catch (err) {
      console.error('Failed to create movie', err);
    }
  };

  /* ========================
     Delete movie
  ======================== */
  const removeMovie = async (id: number) => {
    try {
      await api.delete(`/movies/${id}`);
      setMovies((prev) => prev.filter((m) => m.id !== id));
    } catch (err) {
      console.error('Failed to delete movie', err);
    }
  };

  return (
    <Card className='border-white/5 bg-black/40'>
      <CardHeader className='flex flex-row items-center justify-between'>
        <div>
          <CardTitle>Movie Catalog</CardTitle>
          <CardDescription>Manage films</CardDescription>
        </div>

        <Dialog>
          <DialogTrigger asChild>
            <Button className='gap-2'>
              <Plus className='w-4 h-4' /> Add Movie
            </Button>
          </DialogTrigger>

          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Movie</DialogTitle>
            </DialogHeader>

            <div className='space-y-3'>
              <div>
                <Label>Title</Label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              <div>
                <Label>Duration (minutes)</Label>
                <Input
                  type='number'
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                />
              </div>

              <Button onClick={submit} className='w-full'>
                Save
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </CardHeader>

      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Duration</TableHead>
              <TableHead>Income</TableHead>
              <TableHead className='text-right'>Action</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {loading && (
              <TableRow>
                <TableCell colSpan={3} className='text-center'>
                  Loading...
                </TableCell>
              </TableRow>
            )}

            {!loading &&
              movies.map((m) => (
                <TableRow key={m.id}>
                  <TableCell>{m.title}</TableCell>
                  <TableCell>{m.duration} min</TableCell>
                  <TableCell>
                    {new Intl.NumberFormat('en-US').format(m.income)} Ks
                  </TableCell>
                  <TableCell className='text-right'>
                    <Button
                      variant='ghost'
                      onClick={() => removeMovie(m.id)}
                      className='hover:text-destructive'
                    >
                      <Trash2 className='w-4 h-4' />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}

            {!loading && movies.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={3}
                  className='text-center text-muted-foreground py-6'
                >
                  No movies found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
