
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { BusRoute } from "@/services/dataService";
import { Save } from "lucide-react";

interface AddBusRouteFormProps {
  onSubmit: (route: Omit<BusRoute, "id">) => void;
}

export function AddBusRouteForm({ onSubmit }: AddBusRouteFormProps) {
  const [routeName, setRouteName] = useState("");
  const [driverName, setDriverName] = useState("");
  const [phone, setPhone] = useState("");
  const [departureTime, setDepartureTime] = useState("");
  const [returnTime, setReturnTime] = useState("");
  const [capacity, setCapacity] = useState("");
  const [status, setStatus] = useState<"active" | "inactive">("active");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!routeName || !driverName || !phone || !departureTime || !returnTime) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    const newRoute: Omit<BusRoute, "id"> = {
      name: routeName,
      driver: driverName,
      phone: phone,
      departureTime: departureTime,
      returnTime: returnTime,
      students: 0,
      stops: 0,
      capacity: capacity ? parseInt(capacity) : undefined,
      status: status
    };

    onSubmit(newRoute);

    setRouteName("");
    setDriverName("");
    setPhone("");
    setDepartureTime("");
    setReturnTime("");
    setCapacity("");
    setStatus("active");

    toast({
      title: "Success",
      description: "Bus route added successfully",
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="routeName">Route Name</Label>
          <Input
            id="routeName"
            value={routeName}
            onChange={(e) => setRouteName(e.target.value)}
            placeholder="North Route"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="driverName">Driver Name</Label>
          <Input
            id="driverName"
            value={driverName}
            onChange={(e) => setDriverName(e.target.value)}
            placeholder="Michael Johnson"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">Phone Number</Label>
          <Input
            id="phone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="(555) 123-4567"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="capacity">Capacity</Label>
          <Input
            id="capacity"
            type="number"
            value={capacity}
            onChange={(e) => setCapacity(e.target.value)}
            placeholder="40"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="departureTime">Departure Time</Label>
          <Input
            id="departureTime"
            type="time"
            value={departureTime}
            onChange={(e) => setDepartureTime(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="returnTime">Return Time</Label>
          <Input
            id="returnTime"
            type="time"
            value={returnTime}
            onChange={(e) => setReturnTime(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <Select value={status} onValueChange={(value: "active" | "inactive") => setStatus(value)}>
            <SelectTrigger id="status">
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <Button type="submit" variant="blue" className="w-full">
        <Save className="h-4 w-4 mr-2" /> Add Bus Route
      </Button>
    </form>
  );
}
