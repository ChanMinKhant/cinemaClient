import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Ticket } from 'lucide-react';
import type { Room } from '@/stores/seat.store';

interface BookingFiltersProps {
  movies: { id: number; title: string }[];
  selectedMovie: string;
  onSelectMovie: (val: string) => void;

  availableDates: string[];
  selectedDate: string;
  onSelectDate: (val: string) => void;

  availableRooms: Room[];
  selectedRoom: string;
  onSelectRoom: (val: string) => void;

  availableTimes: string[];
  selectedTime: string;
  onSelectTime: (val: string) => void;
}

export function BookingFilters({
  movies,
  selectedMovie,
  onSelectMovie,

  availableDates,
  selectedDate,
  onSelectDate,

  availableRooms,
  selectedRoom,
  onSelectRoom,

  availableTimes,
  selectedTime,
  onSelectTime,
}: BookingFiltersProps) {
  return (
    <Card className="glass border-white/5">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Ticket className="text-primary" />
          Choose Movie & Session
        </CardTitle>
      </CardHeader>

      {/* ORDER: Movie → Date → Room → Time */}
      <CardContent className="grid md:grid-cols-4 gap-4">
        {/* Movie */}
        <div className="space-y-2">
          <label className="text-[10px] font-bold text-muted-foreground uppercase">
            Movie
          </label>
          <Select value={selectedMovie} onValueChange={onSelectMovie}>
            <SelectTrigger className="bg-background/50 border-white/10">
              <SelectValue placeholder="Select Movie" />
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

        {/* Date */}
        <div className="space-y-2">
          <label className="text-[10px] font-bold text-muted-foreground uppercase">
            Date
          </label>
          <Select
            value={selectedDate}
            onValueChange={onSelectDate}
            disabled={!selectedMovie}
          >
            <SelectTrigger className="bg-background/50 border-white/10">
              <SelectValue placeholder="Select Date" />
            </SelectTrigger>
            <SelectContent>
              {availableDates.map((d) => (
                <SelectItem key={d} value={d}>
                  {d}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Room */}
        <div className="space-y-2">
          <label className="text-[10px] font-bold text-muted-foreground uppercase">
            Room
          </label>
          <Select
            value={selectedRoom}
            onValueChange={onSelectRoom}
            disabled={!selectedDate}
          >
            <SelectTrigger className="bg-background/50 border-white/10">
              <SelectValue placeholder="Select Room" />
            </SelectTrigger>
            <SelectContent>
              {availableRooms.map((r) => (
                <SelectItem key={r} value={r}>
                  Room {r}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Time */}
        <div className="space-y-2">
          <label className="text-[10px] font-bold text-muted-foreground uppercase">
            Time
          </label>
          <Select
            value={selectedTime}
            onValueChange={onSelectTime}
            disabled={!selectedRoom}
          >
            <SelectTrigger className="bg-background/50 border-white/10">
              <SelectValue placeholder="Select Time" />
            </SelectTrigger>
            <SelectContent>
              {availableTimes.map((t) => (
                <SelectItem key={t} value={t}>
                  {t}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
}