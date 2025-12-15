import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Mail, Phone, BookOpen, Calendar, Users } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface TeacherProfile {
  id: string;
  teacher_code: string;
  subjects: string[];
  user_id: string;
  profiles: {
    full_name: string;
    email: string;
    phone: string | null;
    avatar_url: string | null;
  };
}

interface ClassInfo {
  id: string;
  name: string;
  grade: string;
  section: string;
  subject: string;
  student_count?: number;
}

interface Schedule {
  id: string;
  day: string;
  week_number: number;
  periods: {
    period_number: number;
    start_time: string;
    end_time: string;
  };
  classes: {
    name: string;
    grade: string;
    section: string;
    subject: string;
  };
}

interface Student {
  id: string;
  full_name: string;
  student_code: string;
  grade: string;
  section: string;
}

export default function TeacherProfile() {
  const { teacherId } = useParams<{ teacherId: string }>();
  const navigate = useNavigate();
  const [teacher, setTeacher] = useState<TeacherProfile | null>(null);
  const [classes, setClasses] = useState<ClassInfo[]>([]);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [studentsByClass, setStudentsByClass] = useState<Record<string, Student[]>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (teacherId) {
      loadTeacherData();
    }
  }, [teacherId]);

  const loadTeacherData = async () => {
    try {
      setLoading(true);

      // Fetch teacher profile
      const { data: teacherData, error: teacherError } = await supabase
        .from('teachers')
        .select(`
          id,
          teacher_code,
          subjects,
          user_id,
          profiles:user_id (
            full_name,
            email,
            phone,
            avatar_url
          )
        `)
        .eq('id', teacherId)
        .single();

      if (teacherError) throw teacherError;
      setTeacher(teacherData);

      // Fetch assigned classes
      const { data: classesData, error: classesError } = await supabase
        .from('classes')
        .select('*')
        .eq('teacher_id', teacherId);

      if (classesError) throw classesError;

      // Fetch student counts for each class
      const classesWithCounts = await Promise.all(
        (classesData || []).map(async (cls) => {
          const { count } = await supabase
            .from('class_enrollments')
            .select('*', { count: 'exact', head: true })
            .eq('class_id', cls.id);

          return { ...cls, student_count: count || 0 };
        })
      );

      setClasses(classesWithCounts);

      // Fetch schedules
      const { data: schedulesData, error: schedulesError } = await supabase
        .from('class_schedules')
        .select(`
          id,
          day,
          week_number,
          periods:period_id (
            period_number,
            start_time,
            end_time
          ),
          classes:class_id (
            name,
            grade,
            section,
            subject
          )
        `)
        .in('class_id', classesWithCounts.map(c => c.id))
        .order('day')
        .order('week_number');

      if (schedulesError) throw schedulesError;
      setSchedules(schedulesData || []);

      // Fetch students for each class
      const studentsData: Record<string, Student[]> = {};
      await Promise.all(
        classesWithCounts.map(async (cls) => {
          const { data: enrollments } = await supabase
            .from('class_enrollments')
            .select(`
              students:student_id (
                id,
                full_name,
                student_code,
                grade,
                section
              )
            `)
            .eq('class_id', cls.id);

          studentsData[cls.id] = enrollments?.map(e => e.students).filter(Boolean) || [];
        })
      );

      setStudentsByClass(studentsData);

    } catch (error) {
      console.error('Error loading teacher data:', error);
      toast({
        title: "Error",
        description: "Failed to load teacher profile",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getDaySchedule = (day: string, weekNumber: number = 1) => {
    return schedules
      .filter(s => s.day === day && s.week_number === weekNumber)
      .sort((a, b) => a.periods.period_number - b.periods.period_number);
  };

  const daysOfWeek = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading teacher profile...</p>
        </div>
      </div>
    );
  }

  if (!teacher) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-lg font-semibold">Teacher not found</p>
          <Button onClick={() => navigate('/teachers')} className="mt-4">
            Back to Teachers
          </Button>
        </div>
      </div>
    );
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase();
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <Button
        variant="ghost"
        onClick={() => navigate('/teachers')}
        className="mb-4"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Teachers
      </Button>

      {/* Teacher Header Card */}
      <Card>
        <CardHeader>
          <div className="flex items-start gap-6">
            <Avatar className="h-24 w-24">
              <AvatarImage src={teacher.profiles.avatar_url || undefined} />
              <AvatarFallback className="text-2xl">
                {getInitials(teacher.profiles.full_name)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <CardTitle className="text-3xl mb-2">{teacher.profiles.full_name}</CardTitle>
              <CardDescription className="text-lg mb-4">
                Teacher ID: {teacher.teacher_code}
              </CardDescription>
              <div className="flex flex-wrap gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span>{teacher.profiles.email}</span>
                </div>
                {teacher.profiles.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{teacher.profiles.phone}</span>
                  </div>
                )}
              </div>
              <div className="flex flex-wrap gap-2 mt-4">
                {teacher.subjects.map((subject, index) => (
                  <Badge key={index} variant="secondary">
                    <BookOpen className="h-3 w-3 mr-1" />
                    {subject}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Classes</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{classes.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {classes.reduce((sum, cls) => sum + (cls.student_count || 0), 0)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Weekly Periods</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{schedules.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs for Schedule and Classes */}
      <Tabs defaultValue="schedule" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="schedule">
            <Calendar className="h-4 w-4 mr-2" />
            Schedule
          </TabsTrigger>
          <TabsTrigger value="classes">
            <BookOpen className="h-4 w-4 mr-2" />
            Classes
          </TabsTrigger>
          <TabsTrigger value="students">
            <Users className="h-4 w-4 mr-2" />
            Students
          </TabsTrigger>
        </TabsList>

        {/* Schedule Tab */}
        <TabsContent value="schedule" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Weekly Schedule</CardTitle>
              <CardDescription>Class schedule for the week</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {daysOfWeek.map(day => {
                  const daySchedule = getDaySchedule(day);
                  if (daySchedule.length === 0) return null;

                  return (
                    <div key={day} className="border-l-4 border-primary pl-4">
                      <h3 className="text-lg font-semibold capitalize mb-3">{day}</h3>
                      <div className="space-y-2">
                        {daySchedule.map(schedule => (
                          <div
                            key={schedule.id}
                            className="flex items-center justify-between p-3 bg-muted rounded-lg"
                          >
                            <div className="flex-1">
                              <p className="font-medium">
                                {schedule.classes.subject} - Grade {schedule.classes.grade} Section {schedule.classes.section}
                              </p>
                            </div>
                            <div className="text-right">
                              <Badge variant="outline">
                                Period {schedule.periods.period_number}
                              </Badge>
                              <p className="text-sm text-muted-foreground mt-1">
                                {schedule.periods.start_time} - {schedule.periods.end_time}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
                {schedules.length === 0 && (
                  <p className="text-center text-muted-foreground py-8">
                    No schedule assigned yet
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Classes Tab */}
        <TabsContent value="classes" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Assigned Classes</CardTitle>
              <CardDescription>All classes taught by this teacher</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Class Name</TableHead>
                    <TableHead>Grade</TableHead>
                    <TableHead>Section</TableHead>
                    <TableHead>Subject</TableHead>
                    <TableHead className="text-right">Students</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {classes.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-muted-foreground">
                        No classes assigned yet
                      </TableCell>
                    </TableRow>
                  ) : (
                    classes.map(cls => (
                      <TableRow key={cls.id}>
                        <TableCell className="font-medium">{cls.name}</TableCell>
                        <TableCell>Grade {cls.grade}</TableCell>
                        <TableCell>Section {cls.section}</TableCell>
                        <TableCell>{cls.subject}</TableCell>
                        <TableCell className="text-right">{cls.student_count || 0}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Students Tab */}
        <TabsContent value="students" className="space-y-4">
          {classes.map(cls => {
            const students = studentsByClass[cls.id] || [];
            if (students.length === 0) return null;

            return (
              <Card key={cls.id}>
                <CardHeader>
                  <CardTitle>
                    {cls.subject} - Grade {cls.grade} Section {cls.section}
                  </CardTitle>
                  <CardDescription>
                    {students.length} student{students.length !== 1 ? 's' : ''} enrolled
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Student ID</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Grade</TableHead>
                        <TableHead>Section</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {students.map(student => (
                        <TableRow key={student.id}>
                          <TableCell className="font-medium">{student.student_code}</TableCell>
                          <TableCell>{student.full_name}</TableCell>
                          <TableCell>Grade {student.grade}</TableCell>
                          <TableCell>Section {student.section}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            );
          })}
          {classes.length === 0 && (
            <Card>
              <CardContent className="py-8">
                <p className="text-center text-muted-foreground">
                  No classes assigned yet
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
