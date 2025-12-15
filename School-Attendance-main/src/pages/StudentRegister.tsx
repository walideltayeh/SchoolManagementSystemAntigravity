import { useState, useEffect } from "react";
import { QrCode, Save, ArrowLeft, User, FileDown } from "lucide-react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "@/hooks/use-toast";
import { dataService, ClassInfo, BusRoute } from "@/services/dataService";
import { getAvailableGrades, getAvailableSections } from "@/utils/classHelpers";
import { supabase } from "@/integrations/supabase/client";

export default function StudentRegister() {
  const navigate = useNavigate();
  const location = useLocation();
  const editStudent = location.state?.student;
  
  // Extract bus assignment data if editing
  const busAssignment = editStudent?.bus_assignments?.[0];
  const busRouteId = busAssignment?.route_id;
  const busStopId = busAssignment?.stop_id;
  
  const [barcodeValue, setBarcodeValue] = useState(editStudent?.student_code || "STU" + Math.floor(Math.random() * 10000).toString().padStart(4, '0'));
  const [hasAllergies, setHasAllergies] = useState(editStudent?.allergies || false);
  const [requiresBus, setRequiresBus] = useState(!!busRouteId);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string>(editStudent?.photo_url || "");
  
  // Student form state
  const [firstName, setFirstName] = useState(editStudent?.full_name?.split(' ')[0] || "");
  const [lastName, setLastName] = useState(editStudent?.full_name?.split(' ').slice(1).join(' ') || "");
  const [dateOfBirth, setDateOfBirth] = useState(editStudent?.date_of_birth || "");
  const [age, setAge] = useState<number | null>(null);
  const [gender, setGender] = useState(editStudent?.gender || "female");
  const [bloodType, setBloodType] = useState(editStudent?.blood_type || "");
  const [allergyDetails, setAllergyDetails] = useState(editStudent?.allergies_details || "");
  const [grade, setGrade] = useState(editStudent?.grade || "");
  const [section, setSection] = useState(editStudent?.section || "");
  const [busRoute, setBusRoute] = useState(busRouteId || "");
  const [address, setAddress] = useState(editStudent?.address || "");
  
  // Guardian form state
  const [guardianName, setGuardianName] = useState("");
  const [guardianEmail, setGuardianEmail] = useState("");
  const [guardianUsername, setGuardianUsername] = useState("");
  const [guardianPhone, setGuardianPhone] = useState("");
  const [guardianRelation, setGuardianRelation] = useState("");
  
  // Loaded data
  const [classes, setClasses] = useState<ClassInfo[]>([]);
  const [busRoutes, setBusRoutes] = useState<BusRoute[]>([]);
  const [availableGrades, setAvailableGrades] = useState<string[]>([]);
  const [availableSections, setAvailableSections] = useState<string[]>([]);
  const [matchingClass, setMatchingClass] = useState<any>(null);
  const [autoEnroll, setAutoEnroll] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      const loadedClasses = dataService.getClasses();
      setClasses(loadedClasses);
      
      // Fetch bus routes from Supabase
      const { data: routes, error } = await supabase
        .from('bus_routes')
        .select('*')
        .eq('status', 'active')
        .order('name');
      
      if (error) {
        console.error("Error loading bus routes:", error);
        toast({
          title: "Error",
          description: "Failed to load bus routes",
          variant: "destructive"
        });
      } else {
        // Map Supabase data to BusRoute type
        const mappedRoutes = routes?.map(route => ({
          id: route.id,
          name: route.name,
          driver: route.driver_name,
          phone: route.driver_phone,
          departureTime: route.departure_time,
          returnTime: route.return_time,
          students: 0,
          stops: 0,
          status: route.status
        })) || [];
        console.log('Loaded bus routes:', mappedRoutes);
        setBusRoutes(mappedRoutes);
      }
      
      getAvailableGrades().then(grades => setAvailableGrades(grades));
      
      // Load guardian info if editing
      if (editStudent?.id) {
        const { data: guardians } = await supabase
          .from('guardians')
          .select('*')
          .eq('student_id', editStudent.id)
          .eq('is_primary', true)
          .single();
        
        if (guardians) {
          setGuardianName(guardians.full_name);
          setGuardianEmail(guardians.email || "");
          setGuardianPhone(guardians.phone);
          setGuardianRelation(guardians.relation);
        }
      }
    };
    
    loadData();
  }, [editStudent?.id]);

  useEffect(() => {
    if (grade) {
      getAvailableSections(grade).then(sections => setAvailableSections(sections));
    }
  }, [grade, classes]);

  // Check for matching class when grade/section changes
  useEffect(() => {
    const checkMatchingClass = async () => {
      if (grade && section) {
        const { data: matchingClasses } = await supabase
          .from('classes')
          .select('*')
          .eq('grade', grade)
          .eq('section', section)
          .limit(1);
        
        if (matchingClasses && matchingClasses.length > 0) {
          setMatchingClass(matchingClasses[0]);
        } else {
          setMatchingClass(null);
        }
      } else {
        setMatchingClass(null);
      }
    };
    
    checkMatchingClass();
  }, [grade, section]);

  // Calculate age when date of birth changes
  useEffect(() => {
    if (dateOfBirth) {
      const today = new Date();
      const birthDate = new Date(dateOfBirth);
      let calculatedAge = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        calculatedAge--;
      }
      
      setAge(calculatedAge);
    } else {
      setAge(null);
    }
  }, [dateOfBirth]);

  const handlePhotoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File Too Large",
          description: "Photo must be less than 5MB",
          variant: "destructive"
        });
        return;
      }
      
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Invalid File Type",
          description: "Please select an image file",
          variant: "destructive"
        });
        return;
      }
      
      setPhotoFile(file);
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    
    if (isSubmitting) return;
    
    console.log('=== FORM SUBMISSION STARTED ===', { isEdit: !!editStudent });
    
    // Validate all fields before showing confirmation
    if (!firstName || !lastName || !grade || !section || !bloodType) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    // Validate date of birth
    if (dateOfBirth) {
      const birthDate = new Date(dateOfBirth);
      const today = new Date();
      
      // Check if date is not in the future
      if (birthDate > today) {
        toast({
          title: "Invalid Date of Birth",
          description: "Date of birth cannot be in the future.",
          variant: "destructive"
        });
        return;
      }
      
      // Check if age is within reasonable range (2-20 years for school)
      if (age !== null && (age < 2 || age > 20)) {
        toast({
          title: "Invalid Age",
          description: "Student age must be between 2 and 20 years old.",
          variant: "destructive"
        });
        return;
      }
    }
    
    if (hasAllergies && !allergyDetails) {
      toast({
        title: "Missing Information",
        description: "Please provide details about the allergies.",
        variant: "destructive"
      });
      return;
    }
    
    if (requiresBus && (!busRoute || !address)) {
      toast({
        title: "Missing Information",
        description: "Please select a bus route and provide an address for bus pickup.",
        variant: "destructive"
      });
      return;
    }
    
    // All validation passed, show confirmation dialog
    setShowConfirmDialog(true);
  };

  const confirmAndSubmit = async () => {
    setShowConfirmDialog(false);
    setIsSubmitting(true);
    
    try {
      let photoUrl = null;
      
      if (photoFile) {
        const fileExt = photoFile.name.split('.').pop();
        const fileName = `${barcodeValue}-${Date.now()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from('student-photos')
          .upload(fileName, photoFile);

        if (uploadError) {
          console.error('Error uploading photo:', uploadError);
          toast({
            title: "Photo Upload Failed",
            description: "Student will be registered without photo",
            variant: "default"
          });
        } else {
          const { data: { publicUrl } } = supabase.storage
            .from('student-photos')
            .getPublicUrl(fileName);
          photoUrl = publicUrl;
        }
      }
      
      let newStudent;
      let studentError;

      if (editStudent) {
        // Update existing student
        const updateData: any = {
          full_name: `${firstName} ${lastName}`,
          date_of_birth: dateOfBirth || null,
          gender: gender,
          grade: grade,
          section: section,
          blood_type: bloodType,
          allergies: hasAllergies,
          allergies_details: hasAllergies ? allergyDetails : null,
          address: address || null,
        };
        
        // Only update photo if new one was uploaded
        if (photoUrl) {
          updateData.photo_url = photoUrl;
        }

        const result = await supabase
          .from('students')
          .update(updateData)
          .eq('id', editStudent.id)
          .select()
          .single();
        
        newStudent = result.data;
        studentError = result.error;
      } else {
        // Insert new student
        console.log('Attempting to insert new student...');
        const result = await supabase
          .from('students')
          .insert({
            student_code: barcodeValue,
            full_name: `${firstName} ${lastName}`,
            date_of_birth: dateOfBirth || null,
            gender: gender,
            grade: grade,
            section: section,
            blood_type: bloodType,
            allergies: hasAllergies,
            allergies_details: hasAllergies ? allergyDetails : null,
            address: address || null,
            status: 'active',
            photo_url: photoUrl
          } as any)
          .select()
          .single();
        
        console.log('Insert result:', { data: result.data, error: result.error });
        newStudent = result.data;
        studentError = result.error;
      }

      if (studentError) {
        console.error('Error saving student:', studentError);
        setIsSubmitting(false);
        toast({
          title: "Error",
          description: `Failed to ${editStudent ? 'update' : 'register'} student: ${studentError.message}`,
          variant: "destructive"
        });
        return;
      }

      console.log('Student saved successfully:', newStudent);

      // Handle bus assignments
      if (editStudent) {
        // Delete existing bus assignment if user disabled bus or changed route
        const { error: deleteError } = await supabase
          .from('bus_assignments')
          .delete()
          .eq('student_id', newStudent.id);

        if (deleteError) {
          console.error('Error removing old bus assignment:', deleteError);
        }
      }

      // Handle guardian information (required for parent portal access)
      if (guardianName && guardianPhone && guardianEmail && guardianRelation && newStudent) {
        if (editStudent) {
          // Update existing guardian
          const { error: guardianError } = await supabase
            .from('guardians')
            .upsert({
              student_id: newStudent.id,
              full_name: guardianName,
              email: guardianEmail.toLowerCase(),
              phone: guardianPhone,
              relation: guardianRelation,
              is_primary: true
            });

          if (guardianError) {
            console.error('Error saving guardian:', guardianError);
          }
        } else {
          // Insert new guardian
          const { error: guardianError } = await supabase
            .from('guardians')
            .insert({
              student_id: newStudent.id,
              full_name: guardianName,
              email: guardianEmail.toLowerCase(),
              phone: guardianPhone,
              relation: guardianRelation,
              is_primary: true
            });

          if (guardianError) {
            console.error('Error saving guardian:', guardianError);
          }
        }
      } else if (newStudent && (!guardianName || !guardianPhone || !guardianEmail || !guardianRelation)) {
        toast({
          title: "Warning",
          description: "Guardian information is incomplete. Parent portal access may not be available.",
          variant: "default"
        });
      }

      // Auto-enroll in class if enabled and matching class found
      if (autoEnroll && matchingClass && newStudent) {
        const { error: enrollError } = await supabase
          .from('class_enrollments')
          .insert({
            student_id: newStudent.id,
            class_id: matchingClass.id
          });

        if (enrollError) {
          console.error('Error enrolling student:', enrollError);
          toast({
            title: "Warning",
            description: `Student ${editStudent ? 'updated' : 'registered'} but auto-enrollment failed`,
            variant: "default"
          });
        } else {
          console.log('Student auto-enrolled successfully');
        }
      }

      if (requiresBus && busRoute && newStudent && address) {
        // Check if a bus stop already exists at this address for this route
        const { data: existingStops } = await supabase
          .from('bus_stops')
          .select('id')
          .eq('route_id', busRoute)
          .eq('location', address);

        let stopId;

        if (existingStops && existingStops.length > 0) {
          // Use existing stop
          stopId = existingStops[0].id;
        } else {
          // Create new bus stop at this address
          const { data: stopsForRoute } = await supabase
            .from('bus_stops')
            .select('stop_order')
            .eq('route_id', busRoute)
            .order('stop_order', { ascending: false })
            .limit(1);

          const nextOrder = stopsForRoute && stopsForRoute.length > 0 
            ? stopsForRoute[0].stop_order + 1 
            : 1;

          const { data: newStop, error: stopError } = await supabase
            .from('bus_stops')
            .insert({
              route_id: busRoute,
              name: `${firstName}'s Stop`,
              location: address,
              arrival_time: '07:00:00', // Default time, can be updated later
              stop_order: nextOrder
            })
            .select()
            .single();

          if (stopError) {
            console.error('Error creating bus stop:', stopError);
            toast({
              title: "Warning",
              description: `Student ${editStudent ? 'updated' : 'registered'} but bus stop creation failed`,
              variant: "default"
            });
            return;
          }

          stopId = newStop.id;
        }

        // Create bus assignment
        console.log('Creating bus assignment:', {
          student_id: newStudent.id,
          route_id: busRoute,
          stop_id: stopId,
          status: 'active'
        });

        const { data: assignmentData, error: assignmentError } = await supabase
          .from('bus_assignments')
          .insert({
            student_id: newStudent.id,
            route_id: busRoute,
            stop_id: stopId,
            status: 'active'
          })
          .select();

        if (assignmentError) {
          console.error('Error creating bus assignment:', assignmentError);
          toast({
            title: "Warning",
            description: `Student ${editStudent ? 'updated' : 'registered'} but bus assignment failed: ${assignmentError.message}`,
            variant: "default"
          });
        } else {
          console.log('Bus assignment created successfully:', assignmentData);
        }
      }
      
      console.log('Student registration completed successfully!', {
        studentId: newStudent.id,
        fullName: newStudent.full_name
      });
      
      toast({
        title: editStudent ? "Student Updated Successfully" : "Student Registered Successfully",
        description: "The student information has been saved to the system.",
      });
      
      console.log('=== NAVIGATING TO /students ===');
      setIsSubmitting(false);
      navigate("/students");
    } catch (error: any) {
      console.error('Error registering student:', error);
      console.error('Error details:', {
        message: error?.message,
        code: error?.code,
        details: error?.details
      });
      setIsSubmitting(false);
      toast({
        title: "Error",
        description: `Failed to ${editStudent ? 'update' : 'register'} student: ${error?.message || 'Unknown error'}`,
        variant: "destructive"
      });
    }
  };

  const generateNewBarcode = () => {
    setBarcodeValue("STU" + Math.floor(Math.random() * 10000).toString().padStart(4, '0'));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <Link to="/students" className="mr-4">
            <Button variant="outline" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h2 className="text-2xl font-bold tracking-tight">
              {editStudent ? "Edit Student" : "Register New Student"}
            </h2>
            <p className="text-muted-foreground">
              {editStudent ? "Update student information" : "Enter student information and generate ID card/barcode"}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="blue-outline" onClick={() => navigate("/admin")}>
            Go to Admin
          </Button>
        </div>
      </div>
      
      <form onSubmit={handleSubmit}>
        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Student Photo</CardTitle>
                <CardDescription>Upload a photo for identification (optional)</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4">
                  <div className="w-32 h-32 border-2 border-dashed border-border rounded-lg flex items-center justify-center overflow-hidden bg-muted">
                    {photoPreview ? (
                      <img src={photoPreview} alt="Student preview" className="w-full h-full object-cover" />
                    ) : (
                      <User className="h-12 w-12 text-muted-foreground" />
                    )}
                  </div>
                  <div className="flex-1">
                    <Label htmlFor="photo">Student Photo</Label>
                    <Input
                      id="photo"
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoChange}
                      className="mt-2"
                    />
                    <p className="text-sm text-muted-foreground mt-1">
                      Max 5MB. JPG, PNG, WEBP
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Student Information</CardTitle>
                <CardDescription>
                  Enter the basic information for the new student
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="studentId" className="text-right">
                      Student ID
                    </Label>
                    <div className="col-span-3 flex gap-2">
                      <Input id="studentId" value={barcodeValue} readOnly className="bg-muted" />
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={generateNewBarcode}
                        disabled={!!editStudent}
                      >
                        <QrCode className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="firstName" className="text-right">
                      First Name
                    </Label>
                    <Input 
                      id="firstName" 
                      className="col-span-3" 
                      required 
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                    />
                  </div>
                  
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="lastName" className="text-right">
                      Last Name
                    </Label>
                    <Input 
                      id="lastName" 
                      className="col-span-3" 
                      required 
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                    />
                  </div>
                  
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="dob" className="text-right">
                      Date of Birth
                    </Label>
                    <div className="col-span-3 space-y-2">
                      <Input 
                        id="dob" 
                        type="date" 
                        required 
                        value={dateOfBirth}
                        onChange={(e) => setDateOfBirth(e.target.value)}
                        max={new Date().toISOString().split('T')[0]}
                      />
                      {age !== null && (
                        <p className="text-sm text-muted-foreground">
                          Age: {age} years old
                        </p>
                      )}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label className="text-right">Gender</Label>
                    <RadioGroup 
                      value={gender} 
                      onValueChange={setGender} 
                      className="col-span-3 flex space-x-4"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="female" id="female" />
                        <Label htmlFor="female">Female</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="male" id="male" />
                        <Label htmlFor="male">Male</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="other" id="other" />
                        <Label htmlFor="other">Other</Label>
                      </div>
                    </RadioGroup>
                  </div>
                  
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="bloodType" className="text-right">
                      Blood Type
                    </Label>
                    <Select onValueChange={setBloodType} value={bloodType}>
                      <SelectTrigger id="bloodType" className="col-span-3">
                        <SelectValue placeholder="Select blood type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="A+">A+</SelectItem>
                        <SelectItem value="A-">A-</SelectItem>
                        <SelectItem value="B+">B+</SelectItem>
                        <SelectItem value="B-">B-</SelectItem>
                        <SelectItem value="AB+">AB+</SelectItem>
                        <SelectItem value="AB-">AB-</SelectItem>
                        <SelectItem value="O+">O+</SelectItem>
                        <SelectItem value="O-">O-</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="grade" className="text-right">
                      Grade
                    </Label>
                    <Select onValueChange={setGrade} value={grade}>
                      <SelectTrigger id="grade" className="col-span-3">
                        <SelectValue placeholder="Select grade" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableGrades.map(g => (
                          <SelectItem key={g} value={g}>{g}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="section" className="text-right">
                      Section
                    </Label>
                    <Select onValueChange={setSection} value={section} disabled={!grade}>
                      <SelectTrigger id="section" className="col-span-3">
                        <SelectValue placeholder="Select section" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableSections.map(s => (
                          <SelectItem key={s} value={s}>{s}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {matchingClass && (
                    <div className="grid grid-cols-4 items-center gap-4 bg-muted/50 p-3 rounded-lg">
                      <Label htmlFor="autoEnroll" className="text-right">
                        Auto-Enroll
                      </Label>
                      <div className="col-span-3 flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Switch
                            id="autoEnroll"
                            checked={autoEnroll}
                            onCheckedChange={setAutoEnroll}
                          />
                          <Label htmlFor="autoEnroll" className="font-normal cursor-pointer">
                            Enroll in "{matchingClass.name}"
                          </Label>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="address" className="text-right">
                      Home Address {requiresBus && <span className="text-destructive">*</span>}
                    </Label>
                    <Textarea 
                      id="address" 
                      placeholder="123 Main Street, City, State" 
                      className="col-span-3" 
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      required={requiresBus}
                    />
                    {requiresBus && (
                      <p className="col-start-2 col-span-3 text-xs text-muted-foreground">
                        This address will be used as the bus pickup/dropoff location
                      </p>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label className="text-right">Has Allergies</Label>
                    <div className="col-span-3 flex items-center space-x-2">
                      <Switch
                        checked={hasAllergies}
                        onCheckedChange={setHasAllergies}
                      />
                      <Label className="text-sm text-muted-foreground">
                        Student has known allergies
                      </Label>
                    </div>
                  </div>
                  
                  {hasAllergies && (
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="allergies" className="text-right">
                        Allergy Details
                      </Label>
                      <Textarea 
                        id="allergies" 
                        placeholder="Describe the allergies..." 
                        className="col-span-3" 
                        value={allergyDetails}
                        onChange={(e) => setAllergyDetails(e.target.value)}
                      />
                    </div>
                  )}
                  
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label className="text-right">Requires Bus</Label>
                    <div className="col-span-3 flex items-center space-x-2">
                      <Switch
                        checked={requiresBus}
                        onCheckedChange={setRequiresBus}
                      />
                      <Label className="text-sm text-muted-foreground">
                        Student will use school bus
                      </Label>
                    </div>
                  </div>
                  
                  {requiresBus && (
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="busRoute" className="text-right">
                        Bus Route
                      </Label>
                      <Select onValueChange={setBusRoute} value={busRoute}>
                        <SelectTrigger id="busRoute" className="col-span-3">
                          <SelectValue placeholder={busRoutes.length === 0 ? "No bus routes available" : "Select bus route"} />
                        </SelectTrigger>
                        <SelectContent className="bg-background z-50">
                          {busRoutes.length === 0 ? (
                            <div className="px-2 py-1.5 text-sm text-muted-foreground">
                              No bus routes available. Please create one in Admin panel.
                            </div>
                          ) : (
                            busRoutes.map(route => (
                              <SelectItem key={route.id} value={route.id}>{route.name}</SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Guardian Information</CardTitle>
                <CardDescription>
                  Enter guardian or parent contact information
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="guardianRelation" className="text-right">
                      Relationship
                    </Label>
                    <Select onValueChange={setGuardianRelation} value={guardianRelation}>
                      <SelectTrigger id="guardianRelation" className="col-span-3">
                        <SelectValue placeholder="Select relationship" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="mother">Mother</SelectItem>
                        <SelectItem value="father">Father</SelectItem>
                        <SelectItem value="guardian">Guardian</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="guardianName" className="text-right">
                      Full Name
                    </Label>
                    <Input 
                      id="guardianName" 
                      className="col-span-3" 
                      placeholder="Guardian's full name"
                      value={guardianName}
                      onChange={(e) => setGuardianName(e.target.value)}
                    />
                  </div>
                  
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="guardianEmail" className="text-right">
                      Email <span className="text-destructive">*</span>
                    </Label>
                    <Input 
                      id="guardianEmail" 
                      type="email" 
                      className="col-span-3" 
                      placeholder="guardian@example.com"
                      value={guardianEmail}
                      onChange={(e) => setGuardianEmail(e.target.value)}
                      required
                    />
                    <p className="col-start-2 col-span-3 text-xs text-muted-foreground">
                      Used for parent portal login
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="guardianPhone" className="text-right">
                      Phone <span className="text-destructive">*</span>
                    </Label>
                    <Input 
                      id="guardianPhone" 
                      type="tel" 
                      className="col-span-3" 
                      placeholder="+1 (555) 000-0000"
                      value={guardianPhone}
                      onChange={(e) => setGuardianPhone(e.target.value)}
                      required
                    />
                    <p className="col-start-2 col-span-3 text-xs text-muted-foreground">
                      Alternative login method for parent portal
                    </p>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Link to="/students">
                  <Button variant="outline" type="button">Cancel</Button>
                </Link>
                <Button type="submit" variant="blue" disabled={isSubmitting}>
                  <Save className="mr-2 h-4 w-4" />
                  {isSubmitting ? 'Saving...' : (editStudent ? 'Update Student' : 'Register Student')}
                </Button>
              </CardFooter>
            </Card>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Student ID Card Preview</CardTitle>
              <CardDescription>
                This is a preview of the student ID card
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center">
              <div className="border-2 border-school-primary p-6 rounded-lg w-full max-w-xs">
                <div className="bg-school-primary text-white text-center py-2 rounded-t-lg mb-4">
                  <h3 className="font-bold">SCHOOL SCAN CONNECT</h3>
                  <p className="text-xs">STUDENT IDENTIFICATION</p>
                </div>
                
                <div className="flex flex-col items-center mb-4">
                  <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mb-2 overflow-hidden">
                    {photoPreview ? (
                      <img src={photoPreview} alt="Student" className="w-full h-full object-cover" />
                    ) : (
                      <User className="h-12 w-12 text-gray-400" />
                    )}
                  </div>
                  <h4 className="font-bold">{firstName ? `${firstName} ${lastName}` : "New Student"}</h4>
                  <p className="text-sm text-gray-600">ID: {barcodeValue}</p>
                </div>
                
                <div className="space-y-2 mb-4">
                  <div className="grid grid-cols-3 text-sm">
                    <span className="font-medium">Grade:</span>
                    <span className="col-span-2">{grade || "Not Assigned"}</span>
                  </div>
                  <div className="grid grid-cols-3 text-sm">
                    <span className="font-medium">Section:</span>
                    <span className="col-span-2">{section || "Not Assigned"}</span>
                  </div>
                  <div className="grid grid-cols-3 text-sm">
                    <span className="font-medium">Blood Type:</span>
                    <span className="col-span-2">{bloodType || "Not Specified"}</span>
                  </div>
                  {requiresBus && (
                    <div className="grid grid-cols-3 text-sm">
                      <span className="font-medium">Bus Route:</span>
                      <span className="col-span-2">
                        {busRoute ? busRoutes.find(r => r.id === busRoute)?.name || "Not Specified" : "Not Specified"}
                      </span>
                    </div>
                  )}
                </div>
                
                <div className="border border-dashed border-gray-300 p-3 flex justify-center">
                  <QrCode className="h-24 w-24 text-school-primary" />
                </div>
                <div className="text-center mt-2 text-xs">Scan for attendance</div>
              </div>
            </CardContent>
            <CardFooter className="justify-center">
              <Button variant="outline" type="button">
                <FileDown className="mr-2 h-4 w-4" />
                Download ID Card
              </Button>
            </CardFooter>
          </Card>
        </div>
      </form>

      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {editStudent ? 'Confirm Student Update' : 'Confirm Student Registration'}
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-3">
              <p>Please review the student information before {editStudent ? 'updating' : 'registering'}:</p>
              <div className="bg-muted p-4 rounded-lg space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="font-medium">Name:</span>
                  <span>{firstName} {lastName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Student ID:</span>
                  <span>{barcodeValue}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Grade:</span>
                  <span>{grade}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Section:</span>
                  <span>{section}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Blood Type:</span>
                  <span>{bloodType}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Gender:</span>
                  <span className="capitalize">{gender}</span>
                </div>
                {requiresBus && (
                  <div className="flex justify-between">
                    <span className="font-medium">Bus Route:</span>
                    <span>{busRoutes.find(r => r.id === busRoute)?.name || "Not Specified"}</span>
                  </div>
                )}
                {guardianName && (
                  <>
                    <div className="border-t pt-2 mt-2">
                      <span className="font-medium">Guardian Information</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Name:</span>
                      <span>{guardianName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Email:</span>
                      <span>{guardianEmail}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Phone:</span>
                      <span>{guardianPhone}</span>
                    </div>
                  </>
                )}
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmAndSubmit}>
              {editStudent ? 'Update Student' : 'Register Student'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
