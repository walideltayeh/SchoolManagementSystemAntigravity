import { useState, useEffect } from "react";
import { 
  Bus, 
  User, 
  MapPin, 
  Clock, 
  Search, 
  MoreHorizontal, 
  Plus,
  Route,
  Calendar,
  FileDown,
  UserPlus
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

export default function Transport() {
  const [searchQuery, setSearchQuery] = useState("");
  const [busRoutes, setBusRoutes] = useState<any[]>([]);
  const [busStops, setBusStops] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [assignedStudents, setAssignedStudents] = useState<any[]>([]);
  const [allAssignments, setAllAssignments] = useState<any[]>([]);
  const [selectedRoute, setSelectedRoute] = useState<string | null>(null);
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState("");
  const [selectedStopId, setSelectedStopId] = useState("");
  const [unassignDialogOpen, setUnassignDialogOpen] = useState(false);
  const [reassignDialogOpen, setReassignDialogOpen] = useState(false);
  const [selectedAssignmentId, setSelectedAssignmentId] = useState("");
  const [reassignStopId, setReassignStopId] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetchBusRoutes();
    fetchStudents();
    fetchAllAssignments();
    fetchAllBusStops();

    // Subscribe to realtime updates for bus assignments
    const channel = supabase
      .channel('bus-assignments-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'bus_assignments'
        },
        () => {
          // Refresh all assignments and route details
          fetchAllAssignments();
          if (selectedRoute) {
            fetchRouteDetails(selectedRoute);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [selectedRoute]);

  useEffect(() => {
    if (selectedRoute) {
      fetchRouteDetails(selectedRoute);
    }
  }, [selectedRoute]);

  const fetchBusRoutes = async () => {
    const { data, error } = await supabase
      .from('bus_routes')
      .select('*')
      .order('name');
    
    if (error) {
      toast({
        title: "Error",
        description: "Failed to load bus routes",
        variant: "destructive",
      });
      return;
    }
    
    setBusRoutes(data || []);
  };

  const fetchStudents = async () => {
    const { data, error } = await supabase
      .from('students')
      .select('*')
      .eq('status', 'active')
      .order('full_name');
    
    if (error) {
      toast({
        title: "Error",
        description: "Failed to load students",
        variant: "destructive",
      });
      return;
    }
    
    setStudents(data || []);
  };

  const fetchAllAssignments = async () => {
    const { data, error } = await supabase
      .from('bus_assignments')
      .select('*')
      .eq('status', 'active');
    
    if (error) {
      console.error("Failed to load bus assignments:", error);
      return;
    }
    
    setAllAssignments(data || []);
  };

  const fetchAllBusStops = async () => {
    const { data, error } = await supabase
      .from('bus_stops')
      .select('*')
      .order('stop_order');
    
    if (error) {
      console.error("Failed to load bus stops:", error);
      return;
    }
    
    setBusStops(data || []);
  };

  const fetchRouteDetails = async (routeId: string) => {
    // Fetch bus stops for this route
    const { data: stopsData, error: stopsError } = await supabase
      .from('bus_stops')
      .select('*')
      .eq('route_id', routeId)
      .order('stop_order');
    
    if (stopsError) {
      toast({
        title: "Error",
        description: "Failed to load bus stops",
        variant: "destructive",
      });
    } else {
      setBusStops(stopsData || []);
    }

    // Fetch assigned students for this route
    const { data: assignmentsData, error: assignmentsError } = await supabase
      .from('bus_assignments')
      .select(`
        *,
        student:students(*),
        stop:bus_stops(*)
      `)
      .eq('route_id', routeId)
      .eq('status', 'active');
    
    if (assignmentsError) {
      toast({
        title: "Error",
        description: "Failed to load assigned students",
        variant: "destructive",
      });
    } else {
      setAssignedStudents(assignmentsData || []);
    }
  };

  const handleAssignStudent = async () => {
    if (!selectedStudentId || !selectedStopId || !selectedRoute) {
      toast({
        title: "Error",
        description: "Please select both a student and a bus stop",
        variant: "destructive",
      });
      return;
    }

    const { error } = await supabase
      .from('bus_assignments')
      .insert({
        student_id: selectedStudentId,
        route_id: selectedRoute,
        stop_id: selectedStopId,
        status: 'active'
      });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to assign student to bus route",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Success",
      description: "Student assigned to bus route successfully",
    });

    setAssignDialogOpen(false);
    setSelectedStudentId("");
    setSelectedStopId("");
    fetchRouteDetails(selectedRoute);
  };

  const handleUnassignStudent = async () => {
    if (!selectedAssignmentId) return;

    const { error } = await supabase
      .from('bus_assignments')
      .update({ status: 'inactive' })
      .eq('id', selectedAssignmentId);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to unassign student",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Success",
      description: "Student unassigned from bus route successfully",
    });

    setUnassignDialogOpen(false);
    setSelectedAssignmentId("");
    if (selectedRoute) {
      fetchRouteDetails(selectedRoute);
    }
  };

  const handleReassignStudent = async () => {
    if (!selectedAssignmentId || !reassignStopId) {
      toast({
        title: "Error",
        description: "Please select a bus stop",
        variant: "destructive",
      });
      return;
    }

    const { error } = await supabase
      .from('bus_assignments')
      .update({ stop_id: reassignStopId })
      .eq('id', selectedAssignmentId);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to reassign student",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Success",
      description: "Student reassigned to new bus stop successfully",
    });

    setReassignDialogOpen(false);
    setSelectedAssignmentId("");
    setReassignStopId("");
    if (selectedRoute) {
      fetchRouteDetails(selectedRoute);
    }
  };
  
  const filteredRoutes = busRoutes.filter(route =>
    route.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    route.route_code.toLowerCase().includes(searchQuery.toLowerCase()) ||
    route.driver_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleRouteSelect = (routeId: string) => {
    setSelectedRoute(routeId === selectedRoute ? null : routeId);
  };
  
  const handleExport = () => {
    // Create CSV content for bus routes
    const headers = ["ID", "Name", "Code", "Driver", "Phone", "Departure", "Return", "Status"];
    const csvContent = [
      headers.join(','),
      ...filteredRoutes.map(route => [
        route.id,
        route.name,
        route.route_code,
        route.driver_name,
        route.driver_phone,
        route.departure_time,
        route.return_time,
        route.status
      ].join(','))
    ].join('\n');
    
    // Create a blob and download link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'bus_routes.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({
      title: "Export Successful",
      description: "Bus routes data has been exported as CSV",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Transport</h2>
          <p className="text-muted-foreground">
            Manage bus routes and student transportation
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="blue-outline" onClick={() => navigate("/admin")}>
            Go to Admin
          </Button>
          <Button variant="blue-outline" onClick={handleExport}>
            <FileDown className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>
      
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle>Bus Routes</CardTitle>
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search routes..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          <CardDescription>
            View and manage school bus routes. To add new routes, please go to the Admin page.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Route Details</TableHead>
                <TableHead>Driver</TableHead>
                <TableHead>Schedule</TableHead>
                <TableHead>Passengers</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRoutes.map((route) => (
                <TableRow key={route.id} className={selectedRoute === route.id ? "bg-muted" : ""}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-school-light flex items-center justify-center">
                        <Bus className="h-5 w-5 text-school-primary" />
                      </div>
                      <div>
                        <p className="font-medium">{route.name}</p>
                        <p className="text-xs text-muted-foreground">Code: {route.route_code}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <p>{route.driver_name}</p>
                    <p className="text-xs text-muted-foreground">{route.driver_phone}</p>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex items-center gap-1 text-sm">
                        <Clock className="h-3 w-3 text-green-600" />
                        <span>Departs: {route.departure_time}</span>
                      </div>
                      <div className="flex items-center gap-1 text-sm">
                        <Clock className="h-3 w-3 text-orange-600" />
                        <span>Returns: {route.return_time}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex items-center gap-1">
                        <User className="h-3 w-3 text-muted-foreground" />
                        <span>{allAssignments.filter(a => a.route_id === route.id).length} students</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3 w-3 text-muted-foreground" />
                        <span>{busStops.filter(s => s.route_id === route.id).length} stops</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={route.status === "active" ? "default" : "secondary"} className={route.status === "active" ? "bg-school-success" : "bg-muted"}>
                      {route.status === "active" ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Open menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => handleRouteSelect(route.id)}>
                          <Route className="mr-2 h-4 w-4" />
                          {selectedRoute === route.id ? "Hide Details" : "View Details"}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => {
                          setSelectedRoute(route.id);
                          setAssignDialogOpen(true);
                        }}>
                          <UserPlus className="mr-2 h-4 w-4" />
                          Assign Students
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Calendar className="mr-2 h-4 w-4" />
                          Schedule
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>
                          <Bus className="mr-2 h-4 w-4" />
                          Bus Check-in
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
        <CardFooter className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {filteredRoutes.length} of {busRoutes.length} routes
          </p>
          <div className="flex items-center gap-2">
            <Button variant="blue-outline" size="sm" disabled>
              Previous
            </Button>
            <Button variant="blue-outline" size="sm">
              Next
            </Button>
          </div>
        </CardFooter>
      </Card>
      
      {selectedRoute && (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Route Information</CardTitle>
              <CardDescription>
                Bus stops for {busRoutes.find(r => r.id === selectedRoute)?.name}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="stops">
                <TabsList className="mb-4">
                  <TabsTrigger value="stops">Bus Stops</TabsTrigger>
                  <TabsTrigger value="students">Assigned Students</TabsTrigger>
                </TabsList>
                
                <TabsContent value="stops" className="space-y-4">
                  {busStops.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">No bus stops configured for this route</p>
                  ) : (
                    busStops.map((stop) => (
                      <div key={stop.id} className="flex items-center justify-between rounded-lg border p-3">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full bg-amber-100 flex items-center justify-center">
                            <MapPin className="h-4 w-4 text-amber-600" />
                          </div>
                          <div>
                            <p className="font-medium">{stop.name}</p>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <Clock className="h-3 w-3" />
                              <span>{stop.arrival_time}</span>
                            </div>
                          </div>
                        </div>
                        <Badge variant="outline" className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          <span>{assignedStudents.filter(a => a.stop_id === stop.id).length}</span>
                        </Badge>
                      </div>
                    ))
                  )}
                </TabsContent>
                
                <TabsContent value="students">
                  {assignedStudents.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">No students assigned to this route yet</p>
                  ) : (
                    <div className="rounded-lg border">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Student</TableHead>
                            <TableHead>Grade</TableHead>
                            <TableHead>Bus Stop</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {assignedStudents.map((assignment) => (
                            <TableRow key={assignment.id}>
                              <TableCell>
                                <div className="flex items-center gap-3">
                                  <Avatar>
                                    <AvatarFallback>
                                      {assignment.student?.full_name?.split(' ').map((n: string) => n[0]).join('') || '?'}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div>
                                    <p className="font-medium">{assignment.student?.full_name || 'Unknown'}</p>
                                    <p className="text-xs text-muted-foreground">Code: {assignment.student?.student_code}</p>
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>{assignment.student?.grade} - {assignment.student?.section}</TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <MapPin className="h-3 w-3 text-muted-foreground" />
                                  <span>{assignment.stop?.name || 'N/A'}</span>
                                </div>
                              </TableCell>
                              <TableCell className="text-right">
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon">
                                      <MoreHorizontal className="h-4 w-4" />
                                      <span className="sr-only">Open menu</span>
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                    <DropdownMenuItem onClick={() => {
                                      setSelectedAssignmentId(assignment.id);
                                      setReassignStopId(assignment.stop_id);
                                      setReassignDialogOpen(true);
                                    }}>
                                      <Route className="mr-2 h-4 w-4" />
                                      Reassign Stop
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem 
                                      className="text-destructive"
                                      onClick={() => {
                                        setSelectedAssignmentId(assignment.id);
                                        setUnassignDialogOpen(true);
                                      }}
                                    >
                                      <User className="mr-2 h-4 w-4" />
                                      Unassign Student
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>
                Tools for route management
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button 
                variant="blue" 
                className="w-full justify-start"
                onClick={() => navigate("/attendance")}
              >
                <Bus className="mr-2 h-4 w-4" />
                Start Bus Check-in
              </Button>
              <Button 
                variant="blue-outline" 
                className="w-full justify-start"
                onClick={() => {
                  if (!selectedRoute) {
                    toast({
                      title: "No Route Selected",
                      description: "Please select a bus route first",
                      variant: "destructive"
                    });
                    return;
                  }
                  setAssignDialogOpen(true);
                }}
              >
                <UserPlus className="mr-2 h-4 w-4" />
                Assign New Student
              </Button>
              <Button 
                variant="blue-outline" 
                className="w-full justify-start"
                onClick={() => navigate("/admin")}
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Bus Stop
              </Button>
              <Button 
                variant="blue-outline" 
                className="w-full justify-start"
                onClick={() => navigate("/calendar")}
              >
                <Calendar className="mr-2 h-4 w-4" />
                Modify Schedule
              </Button>
              
              <div className="rounded-lg border p-4 mt-6">
                <h4 className="font-semibold mb-3">Today's Schedule</h4>
                <div className="space-y-3">
                  <div className="grid grid-cols-3 text-sm">
                    <span className="font-medium text-muted-foreground">Morning Departure:</span>
                    <span className="col-span-2 font-mono">{busRoutes.find(r => r.id === selectedRoute)?.departureTime}</span>
                  </div>
                  <div className="grid grid-cols-3 text-sm">
                    <span className="font-medium text-muted-foreground">Arrival at School:</span>
                    <span className="col-span-2 font-mono">8:10 AM</span>
                  </div>
                  <div className="grid grid-cols-3 text-sm">
                    <span className="font-medium text-muted-foreground">Afternoon Departure:</span>
                    <span className="col-span-2 font-mono">3:00 PM</span>
                  </div>
                  <div className="grid grid-cols-3 text-sm">
                    <span className="font-medium text-muted-foreground">Return Completion:</span>
                    <span className="col-span-2 font-mono">{busRoutes.find(r => r.id === selectedRoute)?.returnTime}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      <Dialog open={assignDialogOpen} onOpenChange={setAssignDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign Student to Bus Route</DialogTitle>
            <DialogDescription>
              Select a student and bus stop to assign to {busRoutes.find(r => r.id === selectedRoute)?.name}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Student</Label>
              <Select value={selectedStudentId} onValueChange={setSelectedStudentId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a student" />
                </SelectTrigger>
                <SelectContent>
                  {students
                    .filter(s => !assignedStudents.some(a => a.student_id === s.id))
                    .map((student) => (
                      <SelectItem key={student.id} value={student.id}>
                        {student.full_name} - {student.grade} {student.section}
                        {student.address && ` - ${student.address.substring(0, 30)}${student.address.length > 30 ? '...' : ''}`}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Bus Stop</Label>
              {busStops.length === 0 ? (
                <div className="rounded-md border border-destructive/50 bg-destructive/10 p-4">
                  <p className="text-sm text-destructive font-medium mb-2">No bus stops available</p>
                  <p className="text-xs text-muted-foreground mb-3">
                    To assign students, you need to add bus stops first. Bus stops are automatically created when you register a student with a home address and bus requirement enabled.
                  </p>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      setAssignDialogOpen(false);
                      navigate("/admin");
                      toast({
                        title: "Add Bus Stops",
                        description: "Go to Bus Setup tab to add bus stops manually",
                      });
                    }}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add Bus Stops in Admin
                  </Button>
                </div>
              ) : (
                <Select value={selectedStopId} onValueChange={setSelectedStopId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a bus stop" />
                  </SelectTrigger>
                  <SelectContent>
                    {busStops.map((stop) => (
                      <SelectItem key={stop.id} value={stop.id}>
                        {stop.name} - {stop.location} - {stop.arrival_time}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setAssignDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="blue" onClick={handleAssignStudent}>
              Assign Student
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={unassignDialogOpen} onOpenChange={setUnassignDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Unassign Student</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to unassign this student from the bus route? This action can be reversed by reassigning the student.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleUnassignStudent}>
              Unassign
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={reassignDialogOpen} onOpenChange={setReassignDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reassign Student to Different Stop</DialogTitle>
            <DialogDescription>
              Select a new bus stop for this student on {busRoutes.find(r => r.id === selectedRoute)?.name}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>New Bus Stop</Label>
              <Select value={reassignStopId} onValueChange={setReassignStopId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a bus stop" />
                </SelectTrigger>
                <SelectContent>
                  {busStops.map((stop) => (
                    <SelectItem key={stop.id} value={stop.id}>
                      {stop.name} - {stop.arrival_time}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setReassignDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="blue" onClick={handleReassignStudent}>
              Reassign Student
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
