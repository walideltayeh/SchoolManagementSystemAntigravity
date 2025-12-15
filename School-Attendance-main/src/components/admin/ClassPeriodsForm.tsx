
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "@/hooks/use-toast";
import { PlusCircle, Save, Trash, Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";

export function ClassPeriodsForm() {
  const [periods, setPeriods] = useState<Array<{ periodNumber: number; startTime: string; endTime: string; isAllDay: boolean }>>([
    { periodNumber: 1, startTime: "", endTime: "", isAllDay: false }
  ]);
  const [savedPeriods, setSavedPeriods] = useState<any[]>([]);

  useEffect(() => {
    loadPeriods();

    // Subscribe to real-time updates
    const channel = supabase
      .channel('periods-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'periods'
        },
        () => {
          console.log('Periods changed, reloading...');
          loadPeriods();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const loadPeriods = async () => {
    const { data, error } = await supabase
      .from('periods')
      .select('*')
      .order('period_number', { ascending: true });

    if (error) {
      console.error('Error loading periods:', error);
      return;
    }

    if (data && data.length > 0) {
      setSavedPeriods(data);
      setPeriods(data.map(p => ({
        periodNumber: p.period_number,
        startTime: p.start_time,
        endTime: p.end_time,
        isAllDay: p.is_all_day || false
      })));
    }
  };

  const handleAddPeriod = () => {
    const nextPeriodNumber = periods.length > 0 
      ? Math.max(...periods.map(p => p.periodNumber)) + 1 
      : 1;
      
    setPeriods([...periods, { 
      periodNumber: nextPeriodNumber, 
      startTime: "", 
      endTime: "",
      isAllDay: false
    }]);
  };

  const handleRemovePeriod = (index: number) => {
    if (periods.length > 1) {
      const newPeriods = [...periods];
      newPeriods.splice(index, 1);
      setPeriods(newPeriods);
    }
  };

  const updatePeriod = (index: number, field: "startTime" | "endTime" | "isAllDay", value: string | boolean) => {
    const newPeriods = [...periods];
    if (field === "isAllDay") {
      newPeriods[index][field] = value as boolean;
      // Clear times when switching to all day
      if (value === true) {
        newPeriods[index].startTime = "";
        newPeriods[index].endTime = "";
      }
    } else {
      newPeriods[index][field] = value as string;
    }
    setPeriods(newPeriods);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Save Periods clicked, current periods:', periods);
    
    // Validate: non-all-day periods must have start and end times
    const invalidPeriods = periods.filter(period => 
      !period.isAllDay && (!period.startTime || !period.endTime)
    );
    
    if (invalidPeriods.length > 0) {
      console.log('Validation failed for periods:', invalidPeriods);
      const periodNumbers = invalidPeriods.map(p => p.periodNumber).join(', ');
      toast({
        title: "Validation Error",
        description: `Period(s) ${periodNumbers} need start and end times, or mark them as "All Day"`,
        variant: "destructive",
      });
      return;
    }
    
    console.log('Validation passed, saving to database...');
    
    try {
      // Delete existing periods
      const { error: deleteError } = await supabase
        .from('periods')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000');

      if (deleteError) {
        console.error('Delete error:', deleteError);
        throw deleteError;
      }

      // Insert new periods
      const periodsToInsert = periods.map(period => ({
        period_number: period.periodNumber,
        start_time: period.isAllDay ? '00:00:00' : period.startTime,
        end_time: period.isAllDay ? '23:59:59' : period.endTime,
        is_all_day: period.isAllDay
      }));

      console.log('Inserting periods:', periodsToInsert);

      const { error: insertError } = await supabase
        .from('periods')
        .insert(periodsToInsert);

      if (insertError) {
        console.error('Insert error:', insertError);
        throw insertError;
      }

      console.log('Periods saved successfully');
      await loadPeriods();
      
      toast({
        title: "Success",
        description: `${periods.length} class period(s) saved successfully`,
      });
    } catch (error: any) {
      console.error('Error saving periods:', error);
      toast({
        title: "Error",
        description: "Failed to save periods: " + error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      {savedPeriods.length > 0 && (
        <Card className="p-4">
          <h3 className="text-sm font-semibold mb-3">Current Periods Summary</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
            {savedPeriods.map((period) => (
              <div key={period.id} className="flex items-center gap-2 text-sm bg-muted p-2 rounded">
                <Clock className="h-3 w-3 text-primary" />
                <span className="font-medium">Period {period.period_number}:</span>
                <span className="text-muted-foreground">
                  {period.is_all_day ? 'All Day' : `${period.start_time} - ${period.end_time}`}
                </span>
              </div>
            ))}
          </div>
        </Card>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex items-center justify-between">
          <Label className="text-lg font-medium">Configure Class Periods</Label>
          <Button 
            type="button" 
            variant="outline" 
            size="sm" 
            onClick={handleAddPeriod}
          >
            <PlusCircle className="h-4 w-4 mr-1" /> Add Period
          </Button>
        </div>
      
      {periods.map((period, index) => (
        <div key={index} className="border p-3 rounded-md space-y-3">
          <div className="flex items-center gap-2 pb-2 border-b">
            <Clock className="h-4 w-4 text-primary" />
            <Label className="font-semibold">
              Period {period.periodNumber}
            </Label>
          </div>
          
          <div className="flex items-center space-x-2 mb-3">
            <Checkbox 
              id={`allDay-${index}`}
              checked={period.isAllDay}
              onCheckedChange={(checked) => updatePeriod(index, "isAllDay", checked === true)}
            />
            <Label htmlFor={`allDay-${index}`} className="cursor-pointer font-medium">
              All Day
            </Label>
          </div>
          
          {!period.isAllDay && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor={`startTime-${index}`}>Start Time</Label>
                <Input
                  id={`startTime-${index}`}
                  type="time"
                  value={period.startTime}
                  onChange={(e) => updatePeriod(index, "startTime", e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor={`endTime-${index}`}>End Time</Label>
                <Input
                  id={`endTime-${index}`}
                  type="time"
                  value={period.endTime}
                  onChange={(e) => updatePeriod(index, "endTime", e.target.value)}
                />
              </div>
            </div>
          )}
          
          <div className="flex justify-end">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => handleRemovePeriod(index)}
              disabled={periods.length <= 1}
              className="text-destructive"
            >
              <Trash className="h-4 w-4 mr-1" /> Remove
            </Button>
          </div>
        </div>
      ))}
      
        <Button type="submit" variant="blue" className="w-full">
          <Save className="h-4 w-4 mr-2" /> Save Periods
        </Button>
      </form>
    </div>
  );
}
