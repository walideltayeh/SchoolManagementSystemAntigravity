import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { PlusCircle, Edit, Trash2, Building2, Link } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { QuickRoomAssignment } from "./QuickRoomAssignment";

interface Room {
  id: string;
  name: string;
  building?: string;
  floor?: number;
  capacity?: number;
}

interface ClassInfo {
  id: string;
  name: string;
  grade: string;
  section: string;
  subject: string;
}

export function RoomManagement() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [classes, setClasses] = useState<ClassInfo[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isQuickAssignOpen, setIsQuickAssignOpen] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    building: "",
    floor: "",
    capacity: ""
  });

  useEffect(() => {
    loadRooms();
    loadClasses();

    // Subscribe to real-time updates
    const roomsChannel = supabase
      .channel('rooms-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'rooms'
        },
        () => {
          loadRooms();
        }
      )
      .subscribe();

    const classesChannel = supabase
      .channel('classes-changes-rooms')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'classes'
        },
        () => {
          loadClasses();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(roomsChannel);
      supabase.removeChannel(classesChannel);
    };
  }, []);

  const loadRooms = async () => {
    console.log('Loading rooms from database...');
    const { data, error } = await supabase
      .from('rooms')
      .select('*')
      .order('name', { ascending: true });

    if (error) {
      console.error('Error loading rooms:', error);
      toast({
        title: "Error",
        description: `Failed to load rooms: ${error.message}`,
        variant: "destructive",
      });
      return;
    }

    console.log('Loaded rooms:', data);
    setRooms(data || []);
    
    if (data && data.length > 0) {
      toast({
        title: "Rooms Loaded",
        description: `Found ${data.length} room(s)`,
      });
    }
  };

  const loadClasses = async () => {
    const { data, error } = await supabase
      .from('classes')
      .select('*')
      .order('grade', { ascending: true })
      .order('section', { ascending: true });

    if (error) {
      console.error('Error loading classes:', error);
      return;
    }

    setClasses(data || []);
  };

  const validateForm = () => {
    if (!formData.name || formData.name.trim() === "") {
      toast({
        title: "Validation Error",
        description: "Room name is required",
        variant: "destructive",
      });
      return false;
    }

    if (formData.name.length > 50) {
      toast({
        title: "Validation Error",
        description: "Room name must be less than 50 characters",
        variant: "destructive",
      });
      return false;
    }

    if (formData.building && formData.building.length > 50) {
      toast({
        title: "Validation Error",
        description: "Building name must be less than 50 characters",
        variant: "destructive",
      });
      return false;
    }

    if (formData.floor && (isNaN(Number(formData.floor)) || Number(formData.floor) < -10 || Number(formData.floor) > 100)) {
      toast({
        title: "Validation Error",
        description: "Floor must be a number between -10 and 100",
        variant: "destructive",
      });
      return false;
    }

    if (formData.capacity && (isNaN(Number(formData.capacity)) || Number(formData.capacity) < 1 || Number(formData.capacity) > 1000)) {
      toast({
        title: "Validation Error",
        description: "Capacity must be a number between 1 and 1000",
        variant: "destructive",
      });
      return false;
    }

    return true;
  };

  const handleAdd = async () => {
    if (!validateForm()) return;

    const roomData: any = {
      name: formData.name.trim(),
      building: formData.building.trim() || null,
      floor: formData.floor ? Number(formData.floor) : null,
      capacity: formData.capacity ? Number(formData.capacity) : null
    };

    console.log('Attempting to add room:', roomData);

    const { data, error } = await supabase
      .from('rooms')
      .insert([roomData])
      .select();

    if (error) {
      console.error('Error adding room:', error);
      console.error('Error details:', { code: error.code, message: error.message, details: error.details });
      
      let errorMessage = "Failed to add room";
      if (error.message.includes('duplicate')) {
        errorMessage = "A room with this name already exists";
      } else if (error.message.includes('row-level security') || error.code === '42501') {
        errorMessage = "Permission denied. Please ensure you're logged in with admin privileges.";
      }
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      return;
    }

    console.log('Room added successfully:', data);
    toast({
      title: "Success",
      description: "Room added successfully",
    });

    setIsAddDialogOpen(false);
    resetForm();
    await loadRooms();
  };

  const handleEdit = async () => {
    if (!selectedRoom || !validateForm()) return;

    const roomData: any = {
      name: formData.name.trim(),
      building: formData.building.trim() || null,
      floor: formData.floor ? Number(formData.floor) : null,
      capacity: formData.capacity ? Number(formData.capacity) : null
    };

    const { error } = await supabase
      .from('rooms')
      .update(roomData)
      .eq('id', selectedRoom.id);

    if (error) {
      console.error('Error updating room:', error);
      toast({
        title: "Error",
        description: error.message.includes('duplicate') 
          ? "A room with this name already exists" 
          : "Failed to update room",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Success",
      description: "Room updated successfully",
    });

    setIsEditDialogOpen(false);
    setSelectedRoom(null);
    resetForm();
    await loadRooms(); // Explicitly reload to ensure UI updates
  };

  const handleDelete = async () => {
    if (!selectedRoom) return;

    const { error } = await supabase
      .from('rooms')
      .delete()
      .eq('id', selectedRoom.id);

    if (error) {
      console.error('Error deleting room:', error);
      toast({
        title: "Error",
        description: "Failed to delete room",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Success",
      description: "Room deleted successfully",
    });

    setIsDeleteDialogOpen(false);
    setSelectedRoom(null);
    await loadRooms(); // Explicitly reload to ensure UI updates
  };

  const resetForm = () => {
    setFormData({
      name: "",
      building: "",
      floor: "",
      capacity: ""
    });
  };

  const openAddDialog = () => {
    resetForm();
    setIsAddDialogOpen(true);
  };

  const openEditDialog = (room: Room) => {
    setSelectedRoom(room);
    setFormData({
      name: room.name,
      building: room.building || "",
      floor: room.floor?.toString() || "",
      capacity: room.capacity?.toString() || ""
    });
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (room: Room) => {
    setSelectedRoom(room);
    setIsDeleteDialogOpen(true);
  };

  const openQuickAssignDialog = (room: Room) => {
    setSelectedRoom(room);
    setIsQuickAssignOpen(true);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="border-b bg-muted/50">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl font-bold text-primary flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Room Management
              </CardTitle>
              <CardDescription>Add and manage school rooms</CardDescription>
            </div>
            <div className="flex gap-2">
              <Button onClick={loadRooms} variant="outline" size="sm">
                Refresh
              </Button>
              <Button onClick={openAddDialog} variant="blue">
                <PlusCircle className="h-4 w-4 mr-2" />
                Add Room
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Room Name</TableHead>
                <TableHead>Building</TableHead>
                <TableHead>Floor</TableHead>
                <TableHead>Capacity</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rooms.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground">
                    No rooms added yet
                  </TableCell>
                </TableRow>
              ) : (
                rooms.map((room) => (
                  <TableRow key={room.id}>
                    <TableCell className="font-medium">{room.name}</TableCell>
                    <TableCell>{room.building || "-"}</TableCell>
                    <TableCell>{room.floor !== null && room.floor !== undefined ? room.floor : "-"}</TableCell>
                    <TableCell>{room.capacity || "-"}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openQuickAssignDialog(room)}
                          title="Quick assign to class and period"
                        >
                          <Link className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEditDialog(room)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openDeleteDialog(room)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {rooms.length > 0 && (
        <Card>
          <CardHeader className="border-b bg-muted/50">
            <CardTitle className="text-2xl font-bold text-primary">Rooms Summary</CardTitle>
            <CardDescription>Overview of all created rooms</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
                <p className="text-sm text-muted-foreground">Total Rooms</p>
                <p className="text-3xl font-bold text-primary">{rooms.length}</p>
              </div>
              <div className="p-4 rounded-lg bg-secondary/50 border border-secondary">
                <p className="text-sm text-muted-foreground">Total Capacity</p>
                <p className="text-3xl font-bold">
                  {rooms.reduce((sum, room) => sum + (room.capacity || 0), 0)}
                </p>
              </div>
              <div className="p-4 rounded-lg bg-accent/50 border border-accent">
                <p className="text-sm text-muted-foreground">Buildings</p>
                <p className="text-3xl font-bold">
                  {new Set(rooms.map(r => r.building).filter(Boolean)).size || 'N/A'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Add Room Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Room</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="add-name">Room Name *</Label>
              <Input
                id="add-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., 101, Lab A, Auditorium"
                maxLength={50}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="add-building">Building</Label>
              <Input
                id="add-building"
                value={formData.building}
                onChange={(e) => setFormData({ ...formData, building: e.target.value })}
                placeholder="e.g., Main Building, Science Block"
                maxLength={50}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="add-floor">Floor</Label>
                <Input
                  id="add-floor"
                  type="number"
                  value={formData.floor}
                  onChange={(e) => setFormData({ ...formData, floor: e.target.value })}
                  placeholder="e.g., 1, 2"
                  min="-10"
                  max="100"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="add-capacity">Capacity</Label>
                <Input
                  id="add-capacity"
                  type="number"
                  value={formData.capacity}
                  onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                  placeholder="e.g., 30, 50"
                  min="1"
                  max="1000"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="blue" onClick={handleAdd}>
              Add Room
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Room Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Room</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Room Name *</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., 101, Lab A, Auditorium"
                maxLength={50}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-building">Building</Label>
              <Input
                id="edit-building"
                value={formData.building}
                onChange={(e) => setFormData({ ...formData, building: e.target.value })}
                placeholder="e.g., Main Building, Science Block"
                maxLength={50}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-floor">Floor</Label>
                <Input
                  id="edit-floor"
                  type="number"
                  value={formData.floor}
                  onChange={(e) => setFormData({ ...formData, floor: e.target.value })}
                  placeholder="e.g., 1, 2"
                  min="-10"
                  max="100"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-capacity">Capacity</Label>
                <Input
                  id="edit-capacity"
                  type="number"
                  value={formData.capacity}
                  onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                  placeholder="e.g., 30, 50"
                  min="1"
                  max="1000"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="blue" onClick={handleEdit}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Room</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{selectedRoom?.name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {selectedRoom && (
        <QuickRoomAssignment
          room={selectedRoom}
          isOpen={isQuickAssignOpen}
          onClose={() => setIsQuickAssignOpen(false)}
          onSuccess={() => {
            loadRooms();
            toast({
              title: "Success",
              description: "Schedule created successfully",
            });
          }}
        />
      )}
    </div>
  );
}
