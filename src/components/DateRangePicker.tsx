import { useState } from "react";
import { Calendar as CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

interface DateRangePickerProps {
  onDateRangeChange: (startDate: Date, endDate: Date) => void;
  className?: string;
}

export default function DateRangePicker({ onDateRangeChange, className }: DateRangePickerProps) {
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [isOpen, setIsOpen] = useState(false);

  const handleDateSelect = (date: Date | undefined, type: 'start' | 'end') => {
    if (type === 'start') {
      setStartDate(date);
      if (date && endDate && onDateRangeChange) {
        onDateRangeChange(date, endDate);
      }
    } else {
      setEndDate(date);
      if (date && startDate && onDateRangeChange) {
        onDateRangeChange(startDate, date);
      }
    }
  };

  const formatDateRange = () => {
    if (startDate && endDate) {
      return `${format(startDate, "MMM dd")} - ${format(endDate, "MMM dd, yyyy")}`;
    }
    if (startDate) {
      return `${format(startDate, "MMM dd, yyyy")} - Select end date`;
    }
    return "Select date range";
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-[280px] justify-start text-left font-normal",
            !startDate && "text-muted-foreground",
            className
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {formatDateRange()}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <div className="flex">
          <div className="p-3">
            <div className="text-sm font-medium mb-2">Start Date</div>
            <Calendar
              mode="single"
              selected={startDate}
              onSelect={(date) => handleDateSelect(date, 'start')}
              disabled={(date) => date > new Date() || date < new Date("2020-01-01")}
              initialFocus
            />
          </div>
          <div className="p-3 border-l">
            <div className="text-sm font-medium mb-2">End Date</div>
            <Calendar
              mode="single"
              selected={endDate}
              onSelect={(date) => handleDateSelect(date, 'end')}
              disabled={(date) => {
                if (date > new Date() || date < new Date("2020-01-01")) return true;
                if (startDate && date < startDate) return true;
                return false;
              }}
              initialFocus
            />
          </div>
        </div>
        <div className="p-3 border-t">
          <Button 
            onClick={() => setIsOpen(false)} 
            className="w-full"
            disabled={!startDate || !endDate}
          >
            Apply Date Range
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}