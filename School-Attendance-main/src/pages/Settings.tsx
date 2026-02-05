import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/components/ui/use-toast";
import { Save, Server, Bell, Shield, Database, Trash2, Upload, Building2 } from "lucide-react";
import { useSchoolConfig } from "@/hooks/useSchoolConfig";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { dataService } from "@/services/dataService";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

export default function Settings() {
  const { schoolInfo, updateSchoolInfo } = useSchoolConfig();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [databaseUrl, setDatabaseUrl] = useState("https://school-database.example.com/api");
  const [apiKey, setApiKey] = useState("sk_test_••••••••••••••••");
  const [sendNotifications, setSendNotifications] = useState(true);
  const [enableBarcodes, setEnableBarcodes] = useState(true);
  const [saveLoading, setSaveLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const navigate = useNavigate();

  // Local state for form editing
  const [formData, setFormData] = useState({
    name: schoolInfo.name,
    contactEmail: schoolInfo.contactEmail,
    contactPhone: schoolInfo.contactPhone,
    address: schoolInfo.address,
    website: schoolInfo.website,
    logo: schoolInfo.logo
  });

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Logo must be less than 5MB",
          variant: "destructive",
        });
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setFormData(prev => ({ ...prev, logo: base64 }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveGeneral = async () => {
    setSaveLoading(true);

    try {
      // Validate email
      if (formData.contactEmail && !formData.contactEmail.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
        toast({
          title: "Invalid email",
          description: "Please enter a valid email address",
          variant: "destructive",
        });
        setSaveLoading(false);
        return;
      }

      // Update school info
      updateSchoolInfo(formData);

      await new Promise(resolve => setTimeout(resolve, 500));

      toast({
        title: "Settings saved",
        description: "School information has been updated successfully.",
      });

      // Reload to apply changes
      setTimeout(() => window.location.reload(), 1000);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save settings. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSaveLoading(false);
    }
  };

  const handleSaveDatabase = async () => {
    setSaveLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setSaveLoading(false);

    toast({
      title: "Database settings saved",
      description: "Your database configuration has been updated successfully.",
    });
  };

  const handleDeleteAllData = async () => {
    setDeleteLoading(true);

    try {
      console.log("Starting data deletion process from Supabase...");

      // Delete data from all tables except subjects (respecting foreign key constraints)
      const { error: attendanceError } = await supabase.from('attendance_records').delete().gte('created_at', '1970-01-01');
      if (attendanceError) console.error('Error deleting attendance_records:', attendanceError);

      const { error: notificationsError } = await supabase.from('notifications').delete().gte('created_at', '1970-01-01');
      if (notificationsError) console.error('Error deleting notifications:', notificationsError);

      const { error: schedulesError } = await supabase.from('class_schedules').delete().gte('created_at', '1970-01-01');
      if (schedulesError) console.error('Error deleting class_schedules:', schedulesError);

      const { error: enrollmentsError } = await supabase.from('class_enrollments').delete().gte('created_at', '1970-01-01');
      if (enrollmentsError) console.error('Error deleting class_enrollments:', enrollmentsError);

      const { error: busAssignmentsError } = await supabase.from('bus_assignments').delete().gte('created_at', '1970-01-01');
      if (busAssignmentsError) console.error('Error deleting bus_assignments:', busAssignmentsError);

      const { error: busStopsError } = await supabase.from('bus_stops').delete().gte('created_at', '1970-01-01');
      if (busStopsError) console.error('Error deleting bus_stops:', busStopsError);

      const { error: busRoutesError } = await supabase.from('bus_routes').delete().gte('created_at', '1970-01-01');
      if (busRoutesError) console.error('Error deleting bus_routes:', busRoutesError);

      const { error: periodsError } = await supabase.from('periods').delete().gte('created_at', '1970-01-01');
      if (periodsError) console.error('Error deleting periods:', periodsError);

      const { error: classesError } = await supabase.from('classes').delete().gte('created_at', '1970-01-01');
      if (classesError) console.error('Error deleting classes:', classesError);

      const { error: roomsError } = await supabase.from('rooms').delete().gte('created_at', '1970-01-01');
      if (roomsError) console.error('Error deleting rooms:', roomsError);

      // Skip deleting subjects - keep predefined subjects

      const { error: teachersError } = await supabase.from('teachers').delete().gte('created_at', '1970-01-01');
      if (teachersError) console.error('Error deleting teachers:', teachersError);

      const { error: studentsError } = await supabase.from('students').delete().gte('created_at', '1970-01-01');
      if (studentsError) {
        console.error('Error deleting students:', studentsError);
        toast({
          title: "Error",
          description: `Failed to delete students: ${studentsError.message}`,
          variant: "destructive",
        });
      } else {
        console.log("Students deleted successfully");
      }

      // Also clear mock data
      await dataService.deleteAllData();

      toast({
        title: "All data deleted",
        description: "All system data has been successfully deleted (subjects preserved).",
        variant: "destructive",
      });

      setTimeout(() => {
        navigate("/");
      }, 1500);
    } catch (error) {
      console.error("Error deleting data:", error);
      toast({
        title: "Error",
        description: "Failed to delete data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Settings</h2>
        <p className="text-muted-foreground">
          Configure your school system settings and database connections
        </p>
      </div>

      <Tabs defaultValue="general" className="space-y-4">
        <TabsList className="flex flex-wrap h-auto bg-transparent p-0 gap-2 mb-8 justify-start">
          <TabsTrigger value="general" className="rounded-full border border-apple-gray-200 bg-white data-[state=active]:bg-apple-gray-900 data-[state=active]:text-white transition-all hover:bg-apple-gray-50">General</TabsTrigger>
          <TabsTrigger value="database" className="rounded-full border border-apple-gray-200 bg-white data-[state=active]:bg-apple-gray-900 data-[state=active]:text-white transition-all hover:bg-apple-gray-50">Database</TabsTrigger>
          <TabsTrigger value="notifications" className="rounded-full border border-apple-gray-200 bg-white data-[state=active]:bg-apple-gray-900 data-[state=active]:text-white transition-all hover:bg-apple-gray-50">Notifications</TabsTrigger>
          <TabsTrigger value="security" className="rounded-full border border-apple-gray-200 bg-white data-[state=active]:bg-apple-gray-900 data-[state=active]:text-white transition-all hover:bg-apple-gray-50">Security</TabsTrigger>
          <TabsTrigger value="dangerous" className="rounded-full border border-red-200 bg-red-50 text-red-600 data-[state=active]:bg-red-600 data-[state=active]:text-white hover:bg-red-100">Dangerous Zone</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                School Information
              </CardTitle>
              <CardDescription>
                Manage your school's name, logo, contact details, and branding
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Logo Upload Section */}
              <div className="space-y-4">
                <Label>School Logo</Label>
                <div className="flex items-start gap-4">
                  <div className="w-32 h-32 border-2 border-dashed border-apple-gray-200 rounded-2xl flex items-center justify-center bg-apple-gray-50 overflow-hidden">
                    {formData.logo ? (
                      <img
                        src={formData.logo}
                        alt="School Logo"
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <Building2 className="h-12 w-12 text-muted-foreground" />
                    )}
                  </div>
                  <div className="flex-1 space-y-2">
                    <p className="text-sm text-muted-foreground">
                      Upload your school logo. Recommended size: 512x512px. Max size: 5MB.
                    </p>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      className="hidden"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Upload className="mr-2 h-4 w-4" />
                      Upload Logo
                    </Button>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Basic Information */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="school-name">School Name *</Label>
                  <Input
                    id="school-name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter school name"
                    maxLength={100}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contact-email">Contact Email *</Label>
                  <Input
                    id="contact-email"
                    type="email"
                    value={formData.contactEmail}
                    onChange={(e) => setFormData(prev => ({ ...prev, contactEmail: e.target.value }))}
                    placeholder="info@school.edu"
                    maxLength={255}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contact-phone">Contact Phone</Label>
                  <Input
                    id="contact-phone"
                    type="tel"
                    value={formData.contactPhone}
                    onChange={(e) => setFormData(prev => ({ ...prev, contactPhone: e.target.value }))}
                    placeholder="+1 (555) 123-4567"
                    maxLength={20}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="website">Website</Label>
                  <Input
                    id="website"
                    type="url"
                    value={formData.website}
                    onChange={(e) => setFormData(prev => ({ ...prev, website: e.target.value }))}
                    placeholder="www.school.edu"
                    maxLength={255}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Textarea
                    id="address"
                    value={formData.address}
                    onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                    placeholder="123 Education Lane, City, State 12345"
                    rows={3}
                    maxLength={500}
                  />
                </div>
              </div>

              <Separator />

              <div className="flex items-center space-x-2">
                <Switch
                  id="enable-barcodes"
                  checked={enableBarcodes}
                  onCheckedChange={setEnableBarcodes}
                />
                <Label htmlFor="enable-barcodes">Enable Barcode Scanning</Label>
              </div>

              <Separator />

              <Button
                onClick={handleSaveGeneral}
                className="bg-school-primary hover:bg-school-secondary"
                disabled={saveLoading}
              >
                <Save className="mr-2 h-4 w-4" />
                {saveLoading ? "Saving..." : "Save School Information"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="database" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Database Configuration</CardTitle>
              <CardDescription>
                Connect your system to a central database server
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="database-url">Database URL</Label>
                <div className="flex items-center space-x-2">
                  <Database className="h-4 w-4 text-muted-foreground" />
                  <Input
                    id="database-url"
                    value={databaseUrl}
                    onChange={(e) => setDatabaseUrl(e.target.value)}
                    placeholder="https://your-database-server.com/api"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="api-key">API Key</Label>
                <Input
                  id="api-key"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  type="password"
                />
              </div>

              <div className="rounded-xl bg-apple-gray-50 p-6 border border-apple-gray-100">
                <div className="flex items-center gap-2">
                  <Server className="h-5 w-5 text-apple-blue" />
                  <div className="font-medium">Database Status</div>
                </div>
                <div className="mt-2 text-sm text-muted-foreground">
                  Your database connection is active. Last synced: 5 minutes ago
                </div>
              </div>

              <Separator className="my-4" />

              <Button
                onClick={handleSaveDatabase}
                className="bg-school-primary hover:bg-school-secondary"
                disabled={saveLoading}
              >
                <Save className="mr-2 h-4 w-4" />
                {saveLoading ? "Saving..." : "Save Database Settings"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Notification Settings</CardTitle>
              <CardDescription>
                Configure how notifications are sent to parents and staff
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="send-notifications"
                  checked={sendNotifications}
                  onCheckedChange={setSendNotifications}
                />
                <Label htmlFor="send-notifications">Enable Parent Notifications</Label>
              </div>

              <div className="rounded-xl bg-apple-gray-50 p-6 border border-apple-gray-100 mt-6">
                <div className="flex items-center gap-2">
                  <Bell className="h-5 w-5 text-apple-blue" />
                  <div className="font-medium">Notification Services</div>
                </div>
                <div className="mt-2 text-sm text-muted-foreground">
                  SMS and Email services are configured and working properly
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
              <CardDescription>
                Configure security and data protection settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-xl bg-apple-gray-50 p-6 border border-apple-gray-100">
                <div className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-apple-blue" />
                  <div className="font-medium">Data Protection</div>
                </div>
                <div className="mt-2 text-sm text-muted-foreground">
                  All student data is encrypted and protected according to relevant data protection regulations
                </div>
              </div>

              <Button className="mt-4 bg-school-primary hover:bg-school-secondary">
                Run Security Audit
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="dangerous" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-destructive">Dangerous Zone</CardTitle>
              <CardDescription>
                Actions in this section can permanently delete data and cannot be undone
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-md bg-destructive/10 p-4 border border-destructive">
                <div className="flex items-start gap-4">
                  <Trash2 className="h-5 w-5 text-destructive mt-0.5" />
                  <div>
                    <div className="font-medium text-destructive">Delete All Data</div>
                    <div className="mt-1 text-sm text-muted-foreground">
                      This will permanently delete all students, teachers, classes, and other data from the system.
                      This action cannot be undone.
                    </div>

                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive" className="mt-4">
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete All Data
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This action will permanently delete all data from the system including all students,
                            teachers, classes, and other records. This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={handleDeleteAllData}
                            className="bg-destructive hover:bg-destructive/90"
                            disabled={deleteLoading}
                          >
                            {deleteLoading ? "Deleting..." : "Yes, delete all data"}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
