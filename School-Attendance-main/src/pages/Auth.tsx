import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Eye, EyeOff, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

export default function Auth() {
  const { signIn, signUp } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Sign in state
  const [signInEmail, setSignInEmail] = useState("");
  const [signInPassword, setSignInPassword] = useState("");

  // Sign up state
  const [signUpEmail, setSignUpEmail] = useState("");
  const [signUpPassword, setSignUpPassword] = useState("");
  const [signUpFullName, setSignUpFullName] = useState("");
  const [signUpConfirmPassword, setSignUpConfirmPassword] = useState("");

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!signInEmail || !signInPassword) {
      toast.error("Please fill in all fields");
      return;
    }

    setIsLoading(true);

    const { error } = await signIn(signInEmail, signInPassword);

    if (error) {
      if (error.message.includes("Invalid login credentials")) {
        toast.error("Invalid email or password");
      } else {
        toast.error(error.message || "Failed to sign in");
      }
    } else {
      toast.success("Signed in successfully!");
    }

    setIsLoading(false);
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();

    console.log("Sign up form submitted", { signUpEmail, signUpFullName });

    if (!signUpEmail || !signUpPassword || !signUpFullName || !signUpConfirmPassword) {
      toast.error("Please fill in all fields");
      console.log("Validation failed: missing fields");
      return;
    }

    if (signUpPassword !== signUpConfirmPassword) {
      toast.error("Passwords do not match");
      console.log("Validation failed: passwords don't match");
      return;
    }

    if (signUpPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      console.log("Validation failed: password too short");
      return;
    }

    setIsLoading(true);
    console.log("Calling signUp function...");

    try {
      const { error } = await signUp(signUpEmail, signUpPassword, signUpFullName);

      if (error) {
        console.error("Sign up error:", error);
        if (error.message.includes("already registered")) {
          toast.error("This email is already registered");
        } else {
          toast.error(error.message || "Failed to sign up");
        }
      } else {
        console.log("Sign up successful!");
        toast.success("Account created successfully!");
      }
    } catch (err) {
      console.error("Unexpected error during sign up:", err);
      toast.error("An unexpected error occurred");
    }

    setIsLoading(false);
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

      {/* Auth Card */}
      <div className="w-full max-w-md animate-fade-in-up">
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg shadow-blue-500/25 mb-6">
            <span className="text-white font-bold text-2xl">A</span>
          </div>
          <h1 className="text-2xl font-semibold text-apple-gray-800">
            Admin Portal
          </h1>
          <p className="mt-2 text-apple-gray-500">
            Sign in to manage your school
          </p>
        </div>

        {/* Auth Form Card */}
        <div className="bg-white rounded-apple-xl shadow-apple-card p-8">
          <Tabs defaultValue="signin" className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-apple-gray-100 p-1 rounded-xl mb-6">
              <TabsTrigger
                value="signin"
                className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm text-sm font-medium"
              >
                Sign In
              </TabsTrigger>
              <TabsTrigger
                value="signup"
                className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm text-sm font-medium"
              >
                Sign Up
              </TabsTrigger>
            </TabsList>

            <TabsContent value="signin" className="mt-0">
              <form onSubmit={handleSignIn} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="signin-email" className="text-apple-gray-700 font-medium text-sm">
                    Email
                  </Label>
                  <Input
                    id="signin-email"
                    type="email"
                    placeholder="admin@school.edu"
                    value={signInEmail}
                    onChange={(e) => setSignInEmail(e.target.value)}
                    required
                    className="h-12 rounded-xl border-apple-gray-200 focus:border-apple-blue focus:ring-apple-blue/20"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signin-password" className="text-apple-gray-700 font-medium text-sm">
                    Password
                  </Label>
                  <div className="relative">
                    <Input
                      id="signin-password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      value={signInPassword}
                      onChange={(e) => setSignInPassword(e.target.value)}
                      required
                      className="h-12 rounded-xl border-apple-gray-200 focus:border-apple-blue focus:ring-apple-blue/20 pr-12"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-apple-gray-400 hover:text-apple-gray-600 transition-colors"
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                </div>
                <Button
                  type="submit"
                  className="w-full h-12 bg-apple-blue hover:bg-blue-600 text-white rounded-xl font-medium text-base transition-all hover:shadow-lg hover:shadow-blue-500/25"
                  disabled={isLoading}
                >
                  {isLoading ? "Signing in..." : "Sign In"}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="signup" className="mt-0">
              <form onSubmit={handleSignUp} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="signup-name" className="text-apple-gray-700 font-medium text-sm">
                    Full Name
                  </Label>
                  <Input
                    id="signup-name"
                    type="text"
                    placeholder="John Doe"
                    value={signUpFullName}
                    onChange={(e) => setSignUpFullName(e.target.value)}
                    required
                    className="h-12 rounded-xl border-apple-gray-200 focus:border-apple-blue focus:ring-apple-blue/20"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-email" className="text-apple-gray-700 font-medium text-sm">
                    Email
                  </Label>
                  <Input
                    id="signup-email"
                    type="email"
                    placeholder="admin@school.edu"
                    value={signUpEmail}
                    onChange={(e) => setSignUpEmail(e.target.value)}
                    required
                    className="h-12 rounded-xl border-apple-gray-200 focus:border-apple-blue focus:ring-apple-blue/20"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-password" className="text-apple-gray-700 font-medium text-sm">
                    Password
                  </Label>
                  <Input
                    id="signup-password"
                    type="password"
                    placeholder="Min. 6 characters"
                    value={signUpPassword}
                    onChange={(e) => setSignUpPassword(e.target.value)}
                    required
                    className="h-12 rounded-xl border-apple-gray-200 focus:border-apple-blue focus:ring-apple-blue/20"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-confirm-password" className="text-apple-gray-700 font-medium text-sm">
                    Confirm Password
                  </Label>
                  <Input
                    id="signup-confirm-password"
                    type="password"
                    placeholder="Confirm your password"
                    value={signUpConfirmPassword}
                    onChange={(e) => setSignUpConfirmPassword(e.target.value)}
                    required
                    className="h-12 rounded-xl border-apple-gray-200 focus:border-apple-blue focus:ring-apple-blue/20"
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full h-12 bg-apple-blue hover:bg-blue-600 text-white rounded-xl font-medium text-base transition-all hover:shadow-lg hover:shadow-blue-500/25"
                  disabled={isLoading}
                >
                  {isLoading ? "Creating account..." : "Create Account"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-apple-gray-400 mt-6">
          Protected by enterprise-grade security
        </p>
      </div>
    </div>
  );
}
