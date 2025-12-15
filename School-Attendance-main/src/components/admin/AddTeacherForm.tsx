
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { dataService, Teacher } from "@/services/dataService";
import { Save, Eye, EyeOff, Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface ClassAssignment {
  grade: string;
  section: string;
  subject: string;
}

interface AvailableClass {
  id: string;
  grade: string;
  section: string;
  subject: string;
  display: string;
}

interface AddTeacherFormProps {
  onSubmit: (teacher: Omit<Teacher, "id">, classAssignments: ClassAssignment[]) => void;
  initialValues?: Teacher;
  isEditing?: boolean;
  onCancel?: () => void;
}

export function AddTeacherForm({ onSubmit, initialValues, isEditing = false, onCancel }: AddTeacherFormProps) {
  const [name, setName] = useState(initialValues?.name || "");
  const [email, setEmail] = useState(initialValues?.email || "");
  const [phone, setPhone] = useState(initialValues?.phone || "");
  const [username, setUsername] = useState(initialValues?.username || "");
  const [password, setPassword] = useState(initialValues?.password || "");
  const [showPassword, setShowPassword] = useState(false);
  const [availableClasses, setAvailableClasses] = useState<AvailableClass[]>([]);
  const [selectedClassIds, setSelectedClassIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  // Load available classes on mount
  useEffect(() => {
    const loadClasses = async () => {
      try {
        console.log("DEBUG: Loading available classes for teacher assignment...");
        const { data, error } = await supabase
          .from("classes")
          .select("id, grade, section, subject")
          .order("grade", { ascending: true })
          .order("section", { ascending: true })
          .order("subject", { ascending: true });

        if (error) {
          console.error("Error loading classes:", error);
          toast({
            title: "Error",
            description: "Failed to load classes",
            variant: "destructive",
          });
          return;
        }

        const classes: AvailableClass[] = data.map((c) => ({
          id: c.id,
          grade: c.grade,
          section: c.section,
          subject: c.subject,
          display: `${c.grade} - Section ${c.section} (${c.subject})`,
        }));

        console.log("DEBUG: Loaded classes:", classes);
        setAvailableClasses(classes);

        // If editing, pre-select existing classes
        if (initialValues?.classes && initialValues.classes.length > 0) {
          const existingClassIds = initialValues.classes
            .map((className) => {
              const matching = classes.find((c) => c.display === className);
              return matching?.id;
            })
            .filter(Boolean) as string[];
          setSelectedClassIds(existingClassIds);
        }
      } catch (err) {
        console.error("Error:", err);
      } finally {
        setLoading(false);
      }
    };

    loadClasses();
  }, []);

  const toggleClassSelection = (classId: string) => {
    setSelectedClassIds((prev) =>
      prev.includes(classId) ? prev.filter((id) => id !== classId) : [...prev, classId]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("DEBUG AddTeacherForm: handleSubmit called", {
      name,
      email,
      phone,
      username,
      password,
      selectedClassIds,
    });

    if (!name || !email || !phone) {
      console.warn("DEBUG AddTeacherForm: Missing required fields");
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    if (!username || !password) {
      console.warn("DEBUG AddTeacherForm: Missing username or password");
      toast({
        title: "Error",
        description: "Please provide a username and password for teacher login",
        variant: "destructive",
      });
      return;
    }

    if (selectedClassIds.length === 0) {
      console.warn("DEBUG AddTeacherForm: No classes selected");
      toast({
        title: "Error",
        description: "Please select at least one class",
        variant: "destructive",
      });
      return;
    }

    // Build class assignments from selected classes
    const classAssignments = selectedClassIds
      .map((id) => availableClasses.find((c) => c.id === id))
      .filter(Boolean)
      .map((c) => ({
        grade: c!.grade,
        section: c!.section,
        subject: c!.subject,
      }));

    const formattedClasses = classAssignments.map((a) => `${a.grade} - Section ${a.section} (${a.subject})`);

    const newTeacher: Omit<Teacher, "id"> = {
      name,
      email,
      phone,
      username,
      password,
      subject: "",
      subjects: [],
      classes: formattedClasses,
      students: initialValues?.students || 0,
    };

    console.log("DEBUG AddTeacherForm: Calling onSubmit with:", { newTeacher, classAssignments });
    onSubmit(newTeacher, classAssignments);

    if (!isEditing) {
      setName("");
      setEmail("");
      setPhone("");
      setUsername("");
      setPassword("");
      setSelectedClassIds([]);
    }

    toast({
      title: isEditing ? "Updated" : "Success",
      description: isEditing ? "Teacher updated successfully" : "Teacher added successfully",
    });

    if (isEditing && onCancel) {
      onCancel();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Full Name</Label>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="John Doe"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="john.doe@school.edu"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">Phone Number</Label>
          <Input
            id="phone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+1 (555) 000-0000"
          />
        </div>
      </div>

      <div className="space-y-4 pt-4 border-t">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input id="username" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="jdoe" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-2 top-1/2 transform -translate-y-1/2"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-3 pt-4 border-t">
        <Label>Select Classes</Label>
        {loading ? (
          <p className="text-sm text-gray-500">Loading classes...</p>
        ) : availableClasses.length === 0 ? (
          <div className="p-3 bg-yellow-50 border border-yellow-200 rounded text-sm text-yellow-800">
            No classes available. Please create classes first before adding teachers.
          </div>
        ) : (
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {availableClasses.map((cls) => (
              <button
                key={cls.id}
                type="button"
                onClick={() => toggleClassSelection(cls.id)}
                className={`w-full p-3 text-left rounded border-2 transition-colors ${
                  selectedClassIds.includes(cls.id)
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200 bg-white hover:border-gray-300"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium text-sm">{cls.display}</span>
                  {selectedClassIds.includes(cls.id) && <Check className="h-4 w-4 text-blue-500" />}
                </div>
              </button>
            ))}
          </div>
        )}
        <p className="text-xs text-gray-500">
          Selected: {selectedClassIds.length} class{selectedClassIds.length !== 1 ? "es" : ""}
        </p>
      </div>

      <div className="flex gap-2 justify-end pt-4 border-t">
        {isEditing && onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button type="submit" variant="blue" className={isEditing ? "" : "w-full"}>
          <Save className="h-4 w-4 mr-2" /> {isEditing ? "Save Changes" : "Add Teacher"}
        </Button>
      </div>
    </form>
  );
}
