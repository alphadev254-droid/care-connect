import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Heart, Mail, Lock, Eye, EyeOff, User, Phone, ArrowRight, ArrowLeft, Check } from "lucide-react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

const Register = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    userType: "patient",
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    agreeTerms: false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (step < 3) {
      setStep(step + 1);
      return;
    }
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      navigate("/dashboard");
    }, 1500);
  };

  const userTypes = [
    {
      id: "patient",
      title: "Patient",
      description: "I need home healthcare services",
    },
    {
      id: "caregiver",
      title: "Caregiver",
      description: "I want to provide healthcare services",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="flex items-center justify-center py-16 lg:py-24">
        <div className="container max-w-lg">
          <Card className="border-0 shadow-xl">
            <CardHeader className="text-center pb-2">
              <div className="flex justify-center mb-4">
                <div className="h-14 w-14 rounded-2xl bg-gradient-primary flex items-center justify-center">
                  <Heart className="h-7 w-7 text-primary-foreground" />
                </div>
              </div>
              <CardTitle className="font-display text-2xl">Create Account</CardTitle>
              <CardDescription>
                Join CareConnect in just a few steps
              </CardDescription>

              {/* Progress Steps */}
              <div className="flex items-center justify-center gap-2 mt-6">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center gap-2">
                    <div
                      className={`h-8 w-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                        step > i
                          ? "bg-success text-success-foreground"
                          : step === i
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {step > i ? <Check className="h-4 w-4" /> : i}
                    </div>
                    {i < 3 && (
                      <div
                        className={`w-12 h-1 rounded ${
                          step > i ? "bg-success" : "bg-muted"
                        }`}
                      />
                    )}
                  </div>
                ))}
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Step 1: User Type */}
                {step === 1 && (
                  <div className="space-y-4">
                    <Label>I am a...</Label>
                    <RadioGroup
                      value={formData.userType}
                      onValueChange={(value) => setFormData({ ...formData, userType: value })}
                      className="grid gap-4"
                    >
                      {userTypes.map((type) => (
                        <div key={type.id}>
                          <RadioGroupItem
                            value={type.id}
                            id={type.id}
                            className="peer sr-only"
                          />
                          <Label
                            htmlFor={type.id}
                            className="flex items-center gap-4 rounded-xl border-2 border-muted bg-card p-4 hover:bg-muted/50 cursor-pointer peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 transition-all"
                          >
                            <div className={`h-12 w-12 rounded-xl flex items-center justify-center ${
                              type.id === "patient" ? "bg-primary/10" : "bg-secondary/10"
                            }`}>
                              {type.id === "patient" ? (
                                <User className="h-6 w-6 text-primary" />
                              ) : (
                                <Heart className="h-6 w-6 text-secondary" />
                              )}
                            </div>
                            <div>
                              <p className="font-semibold">{type.title}</p>
                              <p className="text-sm text-muted-foreground">
                                {type.description}
                              </p>
                            </div>
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>
                  </div>
                )}

                {/* Step 2: Personal Info */}
                {step === 2 && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="firstName">First Name</Label>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="firstName"
                            placeholder="John"
                            className="pl-10"
                            value={formData.firstName}
                            onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                            required
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastName">Last Name</Label>
                        <Input
                          id="lastName"
                          placeholder="Doe"
                          value={formData.lastName}
                          onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="email"
                          type="email"
                          placeholder="name@example.com"
                          className="pl-10"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="phone"
                          type="tel"
                          placeholder="+1 (555) 000-0000"
                          className="pl-10"
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          required
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 3: Password */}
                {step === 3 && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="password">Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="password"
                          type={showPassword ? "text" : "password"}
                          placeholder="Create a strong password"
                          className="pl-10 pr-10"
                          value={formData.password}
                          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">Confirm Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="confirmPassword"
                          type={showPassword ? "text" : "password"}
                          placeholder="Confirm your password"
                          className="pl-10"
                          value={formData.confirmPassword}
                          onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                          required
                        />
                      </div>
                    </div>

                    <div className="flex items-start space-x-2">
                      <Checkbox
                        id="terms"
                        checked={formData.agreeTerms}
                        onCheckedChange={(checked) =>
                          setFormData({ ...formData, agreeTerms: checked as boolean })
                        }
                        required
                      />
                      <label
                        htmlFor="terms"
                        className="text-sm text-muted-foreground cursor-pointer leading-tight"
                      >
                        I agree to the{" "}
                        <Link to="/terms" className="text-primary hover:underline">
                          Terms of Service
                        </Link>{" "}
                        and{" "}
                        <Link to="/privacy" className="text-primary hover:underline">
                          Privacy Policy
                        </Link>
                      </label>
                    </div>
                  </div>
                )}

                {/* Navigation Buttons */}
                <div className="flex gap-4">
                  {step > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      className="flex-1 gap-2"
                      onClick={() => setStep(step - 1)}
                    >
                      <ArrowLeft className="h-4 w-4" />
                      Back
                    </Button>
                  )}
                  <Button
                    type="submit"
                    className="flex-1 bg-gradient-primary hover:opacity-90 gap-2"
                    disabled={isLoading}
                  >
                    {step < 3 ? (
                      <>
                        Continue
                        <ArrowRight className="h-4 w-4" />
                      </>
                    ) : isLoading ? (
                      "Creating account..."
                    ) : (
                      <>
                        Create Account
                        <ArrowRight className="h-4 w-4" />
                      </>
                    )}
                  </Button>
                </div>
              </form>

              <p className="text-center text-sm text-muted-foreground mt-6">
                Already have an account?{" "}
                <Link to="/login" className="text-primary font-medium hover:underline">
                  Sign in
                </Link>
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Register;
