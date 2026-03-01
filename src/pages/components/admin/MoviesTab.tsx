import { useEffect, useMemo, useState } from 'react';
import { useMovieStore } from '@/stores/movie.store';
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
import {
  Trash2,
  Plus,
  Loader2,
  Film,
  ArrowUpDown,
  Search,
} from 'lucide-react';
import { toast } from 'react-toastify';

type SortKey = 'title' | 'income';
type SortOrder = 'asc' | 'desc';

export default function MoviesTab() {
  const { movies, loading, fetchMovies, addMovie, deleteMovie } =
    useMovieStore();

  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({ title: '', duration: '' });

  // 🔍 Search & Sort
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('title');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');

  useEffect(() => {
    fetchMovies();
  }, [fetchMovies]);

  /* ======================
      SUMMARY
  ====================== */

  const totalMovies = movies.length;

  const totalIncome = useMemo(
    () => movies.reduce((sum, m) => sum + (m.income || 0), 0),
    [movies],
  );

  /* ======================
      SEARCH + SORT
  ====================== */

  const filteredMovies = useMemo(() => {
    let data = movies.filter((m) =>
      m.title.toLowerCase().includes(search.toLowerCase()),
    );

    data.sort((a, b) => {
      const aVal = sortKey === 'title' ? a.title : a.income || 0;
      const bVal = sortKey === 'title' ? b.title : b.income || 0;

      if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return data;
  }, [movies, search, sortKey, sortOrder]);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortOrder((o) => (o === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortOrder('asc');
    }
  };

  /* ======================
      ACTIONS
  ====================== */

  const handleSubmit = async () => {
    if (!formData.title || !formData.duration) {
      toast.error('Please fill all fields');
      return;
    }

    await addMovie({
      title: formData.title,
      duration: Number(formData.duration),
      income: 0,
    });

    setFormData({ title: '', duration: '' });
    setOpen(false);
    toast.success('Movie added');
  };

  const handleDelete = async (id: number) => {
    if (confirm('Remove this movie?')) {
      await deleteMovie(id);
      toast.info('Movie removed');
    }
  };

  /* ======================
      RENDER
  ====================== */

  return (
    <Card className="border-white/5 bg-black/40 shadow-xl animate-in fade-in duration-500">
      <CardHeader className="space-y-4">
        {/* TITLE + ACTION */}
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl font-black uppercase italic tracking-tighter">
              Movie Catalog
            </CardTitle>
            <CardDescription>
              Manage your cinema&apos;s film inventory
            </CardDescription>
          </div>

          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2 font-bold italic uppercase h-9 px-4">
                <Plus className="w-4 h-4" /> Add Movie
              </Button>
            </DialogTrigger>

            <DialogContent className="glass border-white/10 text-white">
              <DialogHeader>
                <DialogTitle className="font-black italic uppercase">
                  Add New Film
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-4 pt-4">
                <div>
                  <Label className="text-[10px] uppercase font-black tracking-widest text-slate-500">
                    Movie Title
                  </Label>
                  <Input
                    className="bg-white/5 border-white/10"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                  />
                </div>

                <div>
                  <Label className="text-[10px] uppercase font-black tracking-widest text-slate-500">
                    Duration (Minutes)
                  </Label>
                  <Input
                    type="number"
                    className="bg-white/5 border-white/10"
                    value={formData.duration}
                    onChange={(e) =>
                      setFormData({ ...formData, duration: e.target.value })
                    }
                  />
                </div>

                <Button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="w-full font-bold uppercase italic"
                >
                  {loading ? <Loader2 className="animate-spin" /> : 'Save Movie'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* STATS */}
        <div className="grid grid-cols-2 gap-4">
          <div className="rounded-lg bg-white/[0.03] p-4">
            <p className="text-[10px] uppercase font-bold tracking-widest text-slate-500">
              Total Movies
            </p>
            <p className="text-2xl font-black">{totalMovies}</p>
          </div>

          <div className="rounded-lg bg-white/[0.03] p-4">
            <p className="text-[10px] uppercase font-bold tracking-widest text-slate-500">
              Total Income
            </p>
            <p className="text-2xl font-black text-primary">
              {new Intl.NumberFormat('en-US').format(totalIncome)} Ks
            </p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* 🔍 COMPACT SEARCH */}
        <div className="flex justify-end">
          <div className="relative w-48">
            <Search className="absolute left-2 top-2 text-slate-500 w-4 h-4" />
            <Input
              placeholder="Search…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="
                pl-8
                h-8
                text-xs
                bg-white/5
                border-white/10
                placeholder:text-slate-500
              "
            />
          </div>
        </div>

        {/* TABLE */}
        <div className="rounded-md border border-white/5">
          <Table>
            <TableHeader className="bg-white/5">
              <TableRow>
                <TableHead
                  className="cursor-pointer"
                  onClick={() => toggleSort('title')}
                >
                  <span className="flex items-center gap-1">
                    Title <ArrowUpDown size={12} />
                  </span>
                </TableHead>
                <TableHead>Duration</TableHead>
                <TableHead
                  className="cursor-pointer"
                  onClick={() => toggleSort('income')}
                >
                  <span className="flex items-center gap-1">
                    Income <ArrowUpDown size={12} />
                  </span>
                </TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={4} className="h-32 text-center">
                    <Loader2 className="animate-spin mx-auto text-primary" />
                  </TableCell>
                </TableRow>
              ) : filteredMovies.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className="h-32 text-center text-slate-500 italic"
                  >
                    No movies found
                  </TableCell>
                </TableRow>
              ) : (
                filteredMovies.map((m) => (
                  <TableRow key={m.id} className="border-white/5">
                    <TableCell className="font-bold">
                      <div className="flex items-center gap-2">
                        <Film size={14} className="text-primary opacity-50" />
                        {m.title}
                      </div>
                    </TableCell>
                    <TableCell className="text-slate-400 text-xs">
                      {m.duration} MIN
                    </TableCell>
                    <TableCell className="font-black text-primary">
                      {new Intl.NumberFormat('en-US').format(m.income || 0)} Ks
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(m.id)}
                        className="text-slate-500 hover:text-destructive"
                      >
                        <Trash2 size={16} />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}