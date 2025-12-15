import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { Bus, User, Phone, Clock, ArrowRight } from "lucide-react";

interface BusRoute {
  id: string;
  name: string;
  route_code: string;
  driver_name: string;
  driver_phone: string;
  departure_time: string;
  return_time: string;
}

export default function BusAttendance() {
  const navigate = useNavigate();
  const [busRoutes, setBusRoutes] = useState<BusRoute[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBusRoutes();
  }, []);

  const loadBusRoutes = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("bus_routes")
        .select("*")
        .eq("status", "active")
        .order("name");

      if (error) throw error;
      setBusRoutes(data || []);
    } catch (error) {
      console.error("Error loading bus routes:", error);
      toast({
        title: "Error",
        description: "Failed to load bus routes",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleBusSelect = (busId: string) => {
    navigate(`/bus-login/${busId}`);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">Bus Attendance</h1>
          <p className="text-muted-foreground">Select a bus route to start attendance</p>
        </div>

        {/* Bus Routes List */}
        {loading ? (
          <Card>
            <CardContent className="pt-6">
              <p className="text-center text-muted-foreground">Loading bus routes...</p>
            </CardContent>
          </Card>
        ) : busRoutes.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <p className="text-center text-muted-foreground">
                No active bus routes found. Please add bus routes in the Admin section.
              </p>
              <div className="flex justify-center mt-4">
                <Button onClick={() => navigate("/admin")} variant="outline">
                  Go to Admin
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {busRoutes.map((bus) => (
              <Card
                key={bus.id}
                className="cursor-pointer hover:border-primary transition-colors"
                onClick={() => handleBusSelect(bus.id)}
              >
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <CardTitle className="flex items-center gap-2">
                        <Bus className="h-5 w-5" />
                        {bus.name}
                      </CardTitle>
                      <CardDescription>
                        <Badge variant="outline">{bus.route_code}</Badge>
                      </CardDescription>
                    </div>
                    <Button size="sm" variant="outline">
                      Start Attendance
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-2 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <User className="h-4 w-4" />
                      <span>Driver: {bus.driver_name}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Phone className="h-4 w-4" />
                      <span>{bus.driver_phone}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      <span>Departure: {bus.departure_time} | Return: {bus.return_time}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Instructions */}
        <Card>
          <CardHeader>
            <CardTitle>How to Use Bus Attendance</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex gap-3">
              <Badge className="h-6 w-6 rounded-full flex items-center justify-center">1</Badge>
              <p className="text-sm">Select the bus route from the list above</p>
            </div>
            <div className="flex gap-3">
              <Badge className="h-6 w-6 rounded-full flex items-center justify-center">2</Badge>
              <p className="text-sm">Driver will log in to the bus device</p>
            </div>
            <div className="flex gap-3">
              <Badge className="h-6 w-6 rounded-full flex items-center justify-center">3</Badge>
              <p className="text-sm">Students scan their QR codes when boarding the bus</p>
            </div>
            <div className="flex gap-3">
              <Badge className="h-6 w-6 rounded-full flex items-center justify-center">4</Badge>
              <p className="text-sm">Attendance is automatically recorded in the system</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
