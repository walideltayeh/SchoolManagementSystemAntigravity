
import {
  Pencil,
  Mail,
  Phone,
  User,
  Search,
  FileDown,
  MoreHorizontal,
  BookOpen,
  GraduationCap,
  Layers,
  Eye,
  BarChart
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Label } from "@/components/ui/label";
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { dataService, Teacher } from "@/services/dataService";
import { toast } from "@/components/ui/use-toast";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";

export default function Teachers() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isMessageDialogOpen, setIsMessageDialogOpen] = useState(false);
  const [messageText, setMessageText] = useState("");

  useEffect(() => {
    loadTeachers();

    // Subscribe to real-time updates
    const channel = supabase
      .channel('teachers-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'teachers'
        },
        () => {
          loadTeachers();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const loadTeachers = async () => {
    const { data, error } = await supabase
      .from('teachers')
      .select('id, teacher_code, subjects, full_name, email, phone')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error loading teachers:', error);
      return;
    }

    // Fetch classes for each teacher
    const teachersWithClasses = await Promise.all(
      (data || []).map(async (teacher: any) => {
        const { data: classesData } = await supabase
          .from('classes')
          .select('id, name, grade, section, subject')
          .eq('teacher_id', teacher.id);

        const classes = (classesData || []).map(
          (cls) => `${cls.grade} - Section ${cls.section} (${cls.subject})`
        );

        // Count total students across all classes
        let totalStudents = 0;
        if (classesData && classesData.length > 0) {
          const { count } = await supabase
            .from('class_enrollments')
            .select('*', { count: 'exact', head: true })
            .in('class_id', classesData.map(c => c.id));
          totalStudents = count || 0;
        }

        return {
          id: teacher.teacher_code || teacher.id,
          name: teacher.full_name || 'Unknown',
          email: teacher.email || '',
          phone: teacher.phone || '',
          subject: teacher.subjects?.[0] || 'N/A',
          subjects: teacher.subjects || [],
          classes: classes,
          students: totalStudents
        };
      })
    );

    setTeachers(teachersWithClasses);
  };

  const filteredTeachers = teachers.filter(teacher =>
    teacher.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    teacher.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    teacher.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    teacher.subject.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleExport = () => {
    // Create CSV content for teachers
    const headers = ["ID", "Name", "Email", "Phone", "Subject", "Classes", "Students"];
    const csvContent = [
      headers.join(','),
      ...filteredTeachers.map(teacher => [
        teacher.id,
        teacher.name,
        teacher.email,
        teacher.phone,
        teacher.subject,
        teacher.classes.join('; '),
        teacher.students
      ].join(','))
    ].join('\n');

    // Create a blob and download link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'teachers.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "Export Successful",
      description: "Teacher data has been exported as CSV",
    });
  };

  const handleViewDetails = (teacher: Teacher) => {
    setSelectedTeacher(teacher);
    setIsViewDialogOpen(true);
  };

  const handleEditTeacher = (teacher: Teacher) => {
    navigate("/admin", { state: { editTeacher: teacher } });
    toast({
      title: "Edit Teacher",
      description: `Redirecting to admin page to edit ${teacher.name}'s details`,
    });
  };

  const handleViewSchedule = (teacher: Teacher) => {
    setSelectedTeacher(teacher);
    toast({
      title: "Schedule",
      description: `Viewing schedule for ${teacher.name}`,
    });
  };

  const handleSendMessage = (teacher: Teacher) => {
    setSelectedTeacher(teacher);
    setIsMessageDialogOpen(true);
  };

  const handleSubmitMessage = () => {
    if (!messageText.trim()) {
      toast({
        title: "Error",
        description: "Please enter a message",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Message Sent",
      description: `Message sent to ${selectedTeacher?.name}`,
    });
    setMessageText("");
    setIsMessageDialogOpen(false);
  };

  const handleAssignClass = (teacher: Teacher) => {
    toast({
      title: "Assign Class",
      description: `Redirecting to admin page to assign new class to ${teacher.name}`,
    });
    navigate("/admin", { state: { editTeacher: teacher, focusOnClassAssignment: true } });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Teachers</h2>
          <p className="text-muted-foreground">
            Manage teachers and class assignments
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="blue-outline" onClick={() => navigate("/admin")}>
            Go to Admin
          </Button>
          <Button variant="blue-outline" onClick={() => navigate("/reports")}>
            <BarChart className="mr-2 h-4 w-4" />
            Go to Reports
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
            <CardTitle>Teacher Directory</CardTitle>
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search teachers..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          <CardDescription>
            View and manage teachers (add teachers in Admin)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Subjects</TableHead>
                <TableHead>Classes</TableHead>
                <TableHead>Students</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTeachers.map((teacher) => (
                <TableRow key={teacher.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarFallback className="bg-school-primary text-white">
                          {teacher.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{teacher.name}</p>
                        <p className="text-xs text-muted-foreground">ID: {teacher.id}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex items-center gap-1 text-sm">
                        <Mail className="h-3 w-3 text-muted-foreground" />
                        <span>{teacher.email}</span>
                      </div>
                      <div className="flex items-center gap-1 text-sm">
                        <Phone className="h-3 w-3 text-muted-foreground" />
                        <span>{teacher.phone}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      {teacher.subjects.map((subject, i) => (
                        <Badge key={i} variant="outline" className="mr-1">
                          {subject}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      {teacher.classes.map((cls, i) => (
                        <Badge key={i} className="bg-school-light text-school-dark mr-1">
                          {cls}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span>{teacher.students}</span>
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
                        <DropdownMenuItem onClick={() => navigate(`/teachers/${teacher.id}`)}>
                          <Eye className="mr-2 h-4 w-4" />
                          View Full Profile
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleViewDetails(teacher)}>
                          <User className="mr-2 h-4 w-4" />
                          Quick View
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleEditTeacher(teacher)}>
                          <Pencil className="mr-2 h-4 w-4" />
                          Edit Details
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => handleSendMessage(teacher)}>
                          <Mail className="mr-2 h-4 w-4" />
                          Send Message
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleAssignClass(teacher)}>
                          <Layers className="mr-2 h-4 w-4" />
                          Assign Class
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
            Showing {filteredTeachers.length} of {teachers.length} teachers
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

      {/* View Teacher Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle>Teacher Profile</DialogTitle>
            <DialogDescription>
              Detailed information about the selected teacher.
            </DialogDescription>
          </DialogHeader>
          {selectedTeacher && (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarFallback className="text-lg bg-school-primary text-white">
                    {selectedTeacher.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-xl font-semibold">{selectedTeacher.name}</h3>
                  <p className="text-sm text-muted-foreground">ID: {selectedTeacher.id}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">Email</h4>
                  <p>{selectedTeacher.email}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">Phone</h4>
                  <p>{selectedTeacher.phone}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">Primary Subject</h4>
                  <p>{selectedTeacher.subject}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">Students</h4>
                  <p>{selectedTeacher.students}</p>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-2">Subjects</h4>
                <div className="flex flex-wrap gap-1">
                  {selectedTeacher.subjects.map((subject, i) => (
                    <Badge key={i} variant="outline">
                      {subject}
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-2">Classes</h4>
                <div className="flex flex-wrap gap-1">
                  {selectedTeacher.classes.map((cls, i) => (
                    <Badge key={i} className="bg-school-light text-school-dark">
                      {cls}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Send Message Dialog */}
      <Dialog open={isMessageDialogOpen} onOpenChange={setIsMessageDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Send Message</DialogTitle>
            <DialogDescription>
              Send a message to {selectedTeacher?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="message">Message</Label>
              <textarea
                id="message"
                className="min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                placeholder="Type your message here..."
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsMessageDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="blue" onClick={handleSubmitMessage}>Send</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
