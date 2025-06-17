import { useState, useEffect } from "react";
import { Calendar as CalendarIcon, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { format, subDays } from "date-fns";

export type TimeFrameType = '7d' | '30d' | '90d' | 'custom';

interface TimeFrameOption {
  value: TimeFrameType;
  label: string;
  days: number;
}

interface TimeFrameSelectorProps {
  onTimeFrameChange: (type: TimeFrameType, startDate?: Date, endDate?: Date) => void;
  className?: string;
  showRefresh?: boolean;
  onRefresh?: () => void;
}

const timeFrameOptions: TimeFrameOption[] = [
  { value: '7d', label: '7D', days: 7 },
  { value: '30d', label: '30D', days: 30 },
  { value: '90d', label: '90D', days: 90 },
];

export default function TimeFrameSelector({ 
  onTimeFrameChange, 
  className, 
  showRefresh = true,
  onRefresh 
}: TimeFrameSelectorProps) {
  const [selectedFrame, setSelectedFrame] = useState<TimeFrameType>('30d');
  const [customStartDate, setCustomStartDate] = useState<Date>();
  const [customEndDate, setCustomEndDate] = useState<Date>();
  const [isCustomOpen, setIsCustomOpen] = useState(false);

  // Initialize with 30D by default
  useEffect(() => {
    const today = new Date();
    const thirtyDaysAgo = subDays(today, 30);
    onTimeFrameChange('30d', thirtyDaysAgo, today);
  }, []);

  const handlePresetSelect = (timeFrame: TimeFrameType) => {
    setSelectedFrame(timeFrame);
    
    if (timeFrame === 'custom') {
      setIsCustomOpen(true);
      return;
    }

    const option = timeFrameOptions.find(opt => opt.value === timeFrame);
    if (option) {
      const today = new Date();
      const startDate = subDays(today, option.days);
      onTimeFrameChange(timeFrame, startDate, today);
    }
  };

  const handleCustomDateSelect = (date: Date | undefined, type: 'start' | 'end') => {
    if (type === 'start') {
      setCustomStartDate(date);
    } else {
      setCustomEndDate(date);
    }
  };

  const applyCustomRange = () => {
    if (customStartDate && customEndDate) {
      setSelectedFrame('custom');
      setIsCustomOpen(false);
      onTimeFrameChange('custom', customStartDate, customEndDate);
    }
  };

  const formatCustomRange = () => {
    if (customStartDate && customEndDate) {
      return `${format(customStartDate, "MMM dd")} - ${format(customEndDate, "MMM dd")}`;
    }
    return "Custom";
  };

  const getMaxDate = () => {
    const today = new Date();
    const ninetyDaysAgo = subDays(today, 90);
    return { min: ninetyDaysAgo, max: today };
  };

  const { min: minDate, max: maxDate } = getMaxDate();

  return (
    <div className={cn("flex items-center space-x-2", className)}>
      {/* Preset Time Frames */}
      <div className="flex items-center space-x-1">
        {timeFrameOptions.map((option) => (
          <Button
            key={option.value}
            variant={selectedFrame === option.value ? "default" : "outline"}
            size="sm"
            onClick={() => handlePresetSelect(option.value)}
            className="h-8 px-3"
          >
            {option.label}
          </Button>
        ))}
        
        {/* Custom Date Range */}
        <Popover open={isCustomOpen} onOpenChange={setIsCustomOpen}>
          <PopoverTrigger asChild>
            <Button
              variant={selectedFrame === 'custom' ? "default" : "outline"}
              size="sm"
              className="h-8 px-3 flex items-center space-x-1"
              onClick={() => handlePresetSelect('custom')}
            >
              <CalendarIcon className="h-3 w-3" />
              <span>{selectedFrame === 'custom' ? formatCustomRange() : 'Custom'}</span>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <div className="p-3">
              <div className="text-sm font-medium mb-3 text-center">
                Select Custom Date Range
                <Badge variant="secondary" className="ml-2 text-xs">
                  Max 90 days
                </Badge>
              </div>
              
              <div className="flex space-x-4">
                <div>
                  <div className="text-xs font-medium mb-2 text-muted-foreground">Start Date</div>
                  <Calendar
                    mode="single"
                    selected={customStartDate}
                    onSelect={(date) => handleCustomDateSelect(date, 'start')}
                    disabled={(date) => {
                      if (date > maxDate || date < minDate) return true;
                      if (customEndDate && date > customEndDate) return true;
                      return false;
                    }}
                    className="rounded-md border"
                  />
                </div>
                
                <div>
                  <div className="text-xs font-medium mb-2 text-muted-foreground">End Date</div>
                  <Calendar
                    mode="single"
                    selected={customEndDate}
                    onSelect={(date) => handleCustomDateSelect(date, 'end')}
                    disabled={(date) => {
                      if (date > maxDate || date < minDate) return true;
                      if (customStartDate && date < customStartDate) return true;
                      if (customStartDate) {
                        const maxEndDate = subDays(customStartDate, -90); // 90 days from start
                        if (date > maxEndDate) return true;
                      }
                      return false;
                    }}
                    className="rounded-md border"
                  />
                </div>
              </div>
              
              <div className="mt-4 pt-3 border-t flex space-x-2">
                <Button 
                  onClick={() => setIsCustomOpen(false)} 
                  variant="outline"
                  size="sm"
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button 
                  onClick={applyCustomRange}
                  size="sm"
                  className="flex-1"
                  disabled={!customStartDate || !customEndDate}
                >
                  Apply Range
                </Button>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {/* Refresh Button */}
      {showRefresh && (
        <Button
          variant="outline"
          size="sm"
          onClick={onRefresh}
          className="h-8 px-3 flex items-center space-x-1"
        >
          <RefreshCw className="h-3 w-3" />
          <span>Refresh</span>
        </Button>
      )}
    </div>
  );
}