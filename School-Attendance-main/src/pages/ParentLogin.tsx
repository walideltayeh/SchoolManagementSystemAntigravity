import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Mail, Phone, ArrowLeft } from "lucide-react";

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
    <div className="min-h-screen flex items-center justify-center bg-apple-gray-50 p-6">
      {/* Back Button */}
      <Link
        to="/"
        className="fixed top-6 left-6 flex items-center gap-2 text-apple-gray-500 hover:text-apple-gray-800 transition-colors"
      >
        <ArrowLeft className="w-5 h-5" />
        <span className="text-sm font-medium">Back</span>
      </Link>

      {/* Login Card */}
      <div className="w-full max-w-md animate-fade-in-up">
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-green-500 to-green-600 shadow-lg shadow-green-500/25 mb-6">
            <span className="text-white font-bold text-2xl">P</span>
          </div>
          <h1 className="text-2xl font-semibold text-apple-gray-800">
            Parent Portal
          </h1>
          <p className="mt-2 text-apple-gray-500">
            Sign in to view your child's information
          </p>
        </div>

        {/* Login Form Card */}
        <div className="bg-white rounded-apple-xl shadow-apple-card p-8">
          <form onSubmit={handleLogin} className="space-y-6">
            {/* Toggle between email and phone */}
            <div className="flex gap-2 bg-apple-gray-100 p-1 rounded-xl">
              <button
                type="button"
                onClick={() => setUseEmail(true)}
                className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-medium transition-all ${useEmail
                    ? 'bg-white text-apple-gray-800 shadow-sm'
                    : 'text-apple-gray-500 hover:text-apple-gray-700'
                  }`}
              >
                <Mail className="h-4 w-4 inline mr-2" />
                Email
              </button>
              <button
                type="button"
                onClick={() => setUseEmail(false)}
                className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-medium transition-all ${!useEmail
                    ? 'bg-white text-apple-gray-800 shadow-sm'
                    : 'text-apple-gray-500 hover:text-apple-gray-700'
                  }`}
              >
                <Phone className="h-4 w-4 inline mr-2" />
                Phone
              </button>
            </div>

            {/* Email Input */}
            {useEmail && (
              <div className="space-y-2">
                <Label htmlFor="email" className="text-apple-gray-700 font-medium text-sm">
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="parent@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                  autoFocus
                  className="h-12 rounded-xl border-apple-gray-200 focus:border-apple-blue focus:ring-apple-blue/20"
                />
                <p className="text-xs text-apple-gray-400">
                  Use the email you provided during student registration
                </p>
              </div>
            )}

            {/* Phone Input */}
            {!useEmail && (
              <div className="space-y-2">
                <Label htmlFor="phone" className="text-apple-gray-700 font-medium text-sm">
                  Phone Number
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+1 (555) 000-0000"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  disabled={loading}
                  autoFocus
                  className="h-12 rounded-xl border-apple-gray-200 focus:border-apple-blue focus:ring-apple-blue/20"
                />
                <p className="text-xs text-apple-gray-400">
                  Use the phone number you provided during student registration
                </p>
              </div>
            )}

            <Button
              type="submit"
              className="w-full h-12 bg-apple-green hover:bg-green-600 text-white rounded-xl font-medium text-base transition-all hover:shadow-lg hover:shadow-green-500/25"
              disabled={loading}
            >
              {loading ? "Signing in..." : "Sign In"}
            </Button>

            <div className="text-center text-sm text-apple-gray-500 pt-2">
              <p>Don't have an account?</p>
              <p className="mt-1">
                Register your child to create a parent account
              </p>
            </div>
          </form>
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-apple-gray-400 mt-6">
          Your child's attendance at your fingertips
        </p>
      </div>
    </div>
  );
}
