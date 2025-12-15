import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { MapPin } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface AddBusStopFormProps {
  onSuccess?: () => void;
}

export function AddBusStopForm({ onSuccess }: AddBusStopFormProps) {
  const [busRoutes, setBusRoutes] = useState<any[]>([]);
  const [selectedRoute, setSelectedRoute] = useState("");
  const [stopName, setStopName] = useState("");
  const [location, setLocation] = useState("");
  const [arrivalTime, setArrivalTime] = useState("");
  const [stopOrder, setStopOrder] = useState("");

  useEffect(() => {
    fetchBusRoutes();

    // Subscribe to real-time updates for bus routes
    const busRoutesChannel = supabase
      .channel('bus-routes-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'bus_routes'
        },
        () => {
          console.log('Bus routes changed, reloading...');
          fetchBusRoutes();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(busRoutesChannel);
    };
  }, []);

  const fetchBusRoutes = async () => {
    const { data, error } = await supabase
      .from('bus_routes')
      .select('*')
      .order('name');
    
    if (error) {
      console.error("Error loading bus routes:", error);
      toast({
        title: "Error",
        description: "Failed to load bus routes",
        variant: "destructive"
      });
    } else {
      setBusRoutes(data || []);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedRoute || !stopName || !location || !arrivalTime || !stopOrder) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    const { error } = await supabase
      .from('bus_stops')
      .insert([{
        route_id: selectedRoute,
        name: stopName,
        location: location,
        arrival_time: arrivalTime,
        stop_order: parseInt(stopOrder)
      }]);

    if (error) {
      console.error("Error adding bus stop:", error);
      toast({
        title: "Error",
        description: "Failed to add bus stop: " + error.message,
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Success",
      description: "Bus stop added successfully",
    });

    // Reset form
    setSelectedRoute("");
    setStopName("");
    setLocation("");
    setArrivalTime("");
    setStopOrder("");

    onSuccess?.();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="busRoute">Bus Route *</Label>
          <Select value={selectedRoute} onValueChange={setSelectedRoute}>
            <SelectTrigger id="busRoute">
              <SelectValue placeholder="Select bus route" />
            </SelectTrigger>
            <SelectContent>
              {busRoutes.map(route => (
                <SelectItem key={route.id} value={route.id}>
                  {route.name} ({route.route_code})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="stopName">Stop Name *</Label>
          <Input
            id="stopName"
            value={stopName}
            onChange={(e) => setStopName(e.target.value)}
            placeholder="Main Street"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="location">Location *</Label>
          <Input
            id="location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="123 Main Street, City"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="arrivalTime">Arrival Time *</Label>
          <Input
            id="arrivalTime"
            type="time"
            value={arrivalTime}
            onChange={(e) => setArrivalTime(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="stopOrder">Stop Order *</Label>
          <Input
            id="stopOrder"
            type="number"
            min="1"
            value={stopOrder}
            onChange={(e) => setStopOrder(e.target.value)}
            placeholder="1"
          />
          <p className="text-xs text-muted-foreground">Order in which this stop appears on the route</p>
        </div>
      </div>

      <Button type="submit" variant="blue" className="w-full">
        <MapPin className="h-4 w-4 mr-2" /> Add Bus Stop
      </Button>
    </form>
  );
}
