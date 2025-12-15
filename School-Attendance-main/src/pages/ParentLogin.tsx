import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { User, Mail } from "lucide-react";

export default function ParentLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [useEmail, setUseEmail] = useState(true);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (useEmail && !email) {
      toast({
        title: "Error",
        description: "Please enter your email",
        variant: "destructive",
      });
      return;
    }

    if (!useEmail && !phone) {
      toast({
        title: "Error",
        description: "Please enter your phone number",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      let query = supabase
        .from('guardians')
        .select('email, phone, student_id')
        .limit(1);

      if (useEmail) {
        query = query.eq('email', email.toLowerCase());
      } else {
        query = query.eq('phone', phone);
      }

      const { data: guardians, error } = await query;

      if (error) throw error;

      if (!guardians || guardians.length === 0) {
        toast({
          title: "Parent Not Found",
          description: `No parent account found with this ${useEmail ? 'email' : 'phone number'}.`,
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      const guardian = guardians[0];
      const guardianEmail = guardian.email || phone;

      // Count children
      const { count: childCount } = await supabase
        .from('guardians')
        .select('*', { count: 'exact' })
        .eq(useEmail ? 'email' : 'phone', useEmail ? email.toLowerCase() : phone);

      // Store parent session
      sessionStorage.setItem('parentEmail', guardianEmail);
      sessionStorage.setItem('parentPhone', guardian.phone);

      toast({
        title: "Login Successful",
        description: `Welcome! You have ${childCount || 0} child${childCount !== 1 ? 'ren' : ''} in the system.`,
      });

      // Redirect to parent portal
      navigate('/parent-portal');
    } catch (error: any) {
      console.error('Login error:', error);
      toast({
        title: "Login Failed",
        description: error.message || "An error occurred during login",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-2 text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-primary/10 p-3 rounded-full">
              <User className="h-6 w-6 text-primary" />
            </div>
          </div>
          <CardTitle className="text-2xl">Parent Portal</CardTitle>
          <CardDescription>
            Sign in to view your child's information
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            {/* Toggle between email and phone */}
            <div className="flex gap-2 bg-muted p-1 rounded-lg">
              <button
                type="button"
                onClick={() => setUseEmail(true)}
                className={`flex-1 py-2 px-3 rounded text-sm font-medium transition-colors ${
                  useEmail
                    ? 'bg-background text-foreground'
                    : 'text-muted-foreground'
                }`}
              >
                <Mail className="h-4 w-4 inline mr-2" />
                Email
              </button>
              <button
                type="button"
                onClick={() => setUseEmail(false)}
                className={`flex-1 py-2 px-3 rounded text-sm font-medium transition-colors ${
                  !useEmail
                    ? 'bg-background text-foreground'
                    : 'text-muted-foreground'
                }`}
              >
                <User className="h-4 w-4 inline mr-2" />
                Phone
              </button>
            </div>

            {/* Email Input */}
            {useEmail && (
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="parent@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                  autoFocus
                />
                <p className="text-xs text-muted-foreground">
                  Use the email you provided during student registration
                </p>
              </div>
            )}

            {/* Phone Input */}
            {!useEmail && (
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+1 (555) 000-0000"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  disabled={loading}
                  autoFocus
                />
                <p className="text-xs text-muted-foreground">
                  Use the phone number you provided during student registration
                </p>
              </div>
            )}

            <Button 
              type="submit" 
              className="w-full" 
              disabled={loading}
            >
              {loading ? "Signing in..." : "Sign In"}
            </Button>

            <div className="text-center text-sm text-muted-foreground">
              <p>Don't have an account?</p>
              <p className="mt-1">
                Register your child to create a parent account
              </p>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
