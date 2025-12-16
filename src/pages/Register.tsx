import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Heart, Mail, Lock, Eye, EyeOff, User, Phone, ArrowRight, ArrowLeft, Check } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { api } from "@/lib/api";

const Register = () => {
  const navigate = useNavigate();
  const { register } = useAuth();

  useEffect(() => {
    fetchSpecialties();
  }, []);

  const fetchSpecialties = async () => {
    try {
      const response = await api.get('/specialties');
      setSpecialties(response.data.specialties || []);
    } catch (error) {
      console.error('Failed to fetch specialties:', error);
    }
  };
  const [step, setStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [termsContent, setTermsContent] = useState("");
  const [specialties, setSpecialties] = useState([]);
  const [formData, setFormData] = useState({
    userType: "patient",
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    agreeTerms: false,
    // Patient fields
    dateOfBirth: "",
    address: "",
    emergencyContact: "",
    // Caregiver fields
    licenseNumber: "",
    experience: "",
    qualifications: "",
    hourlyRate: "",
    supportingDocuments: null,
    specialties: [],
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (step < 3) {
      setStep(step + 1);
      return;
    }

    // Validate password confirmation
    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (!formData.agreeTerms) {
      toast.error("Please agree to the terms and conditions");
      return;
    }

    setIsLoading(true);

    try {
      const formDataToSend = new FormData();
      
      // Add basic fields
      formDataToSend.append('email', formData.email);
      formDataToSend.append('password', formData.password);
      formDataToSend.append('firstName', formData.firstName);
      formDataToSend.append('lastName', formData.lastName);
      formDataToSend.append('phone', formData.phone);
      formDataToSend.append('role', formData.userType);

      // Add role-specific fields
      if (formData.userType === 'patient') {
        formDataToSend.append('dateOfBirth', formData.dateOfBirth);
        formDataToSend.append('address', formData.address);
        formDataToSend.append('emergencyContact', formData.emergencyContact);
      } else if (formData.userType === 'caregiver') {
        formDataToSend.append('licenseNumber', formData.licenseNumber);
        formDataToSend.append('experience', formData.experience || '0');
        formDataToSend.append('qualifications', formData.qualifications);
        formDataToSend.append('hourlyRate', formData.hourlyRate || '50');
        
        // Add specialties
        if (formData.specialties.length > 0) {
          formData.specialties.forEach(specialtyId => {
            formDataToSend.append('specialties[]', specialtyId);
          });
        }
        
        // Add supporting documents
        if (formData.supportingDocuments) {
          Array.from(formData.supportingDocuments).slice(0, 5).forEach((file: any) => {
            formDataToSend.append('supportingDocuments', file);
          });
        }
      }

      const result = await register(formDataToSend);
      
      if (result?.requiresApproval) {
        toast.success("Registration submitted successfully! Please check your email for confirmation and wait for admin approval.");
        navigate("/login");
      } else {
        toast.success("Account created successfully! Welcome to CareConnect.");
        navigate("/dashboard");
      }
    } catch (error: any) {
      console.error("Registration error:", error);
      // Error toast is already shown by API interceptor
    } finally {
      setIsLoading(false);
    }
  };

  const fetchTerms = async (role: string) => {
    try {
      const response = await api.get(`/terms/${role}`);
      setTermsContent(response.data.data.terms);
      setShowTerms(true);
    } catch (error) {
      toast.error("Failed to load terms and conditions");
    }
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
        <div className="container max-w-4xl">
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
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-4">
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
                      {formData.userType === 'caregiver' && (
                        <div className="space-y-2">
                          <Label htmlFor="supportingDocuments">Supporting Documents (Max 5 files)</Label>
                          <Input
                            id="supportingDocuments"
                            type="file"
                            multiple
                            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                            onChange={(e) => setFormData({ ...formData, supportingDocuments: e.target.files })}
                            className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/80"
                          />
                          <p className="text-xs text-muted-foreground">
                            Upload licenses, certificates, or other credentials (PDF, DOC, DOCX, JPG, PNG)
                          </p>
                        </div>
                      )}
                    </div>
                    <div className="space-y-4">
                      {/* Role-specific fields */}
                      {formData.userType === 'patient' && (
                        <>
                          <div className="space-y-2">
                            <Label htmlFor="dateOfBirth">Date of Birth</Label>
                            <Input
                              id="dateOfBirth"
                              type="date"
                              value={formData.dateOfBirth}
                              onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                              required
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="address">Address</Label>
                            <Input
                              id="address"
                              placeholder="Your home address"
                              value={formData.address}
                              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                              required
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="emergencyContact">Emergency Contact</Label>
                            <Input
                              id="emergencyContact"
                              placeholder="Emergency contact phone"
                              value={formData.emergencyContact}
                              onChange={(e) => setFormData({ ...formData, emergencyContact: e.target.value })}
                              required
                            />
                          </div>
                        </>
                      )}

                      {formData.userType === 'caregiver' && (
                        <>
                          <div className="space-y-2">
                            <Label htmlFor="licenseNumber">License Number</Label>
                            <Input
                              id="licenseNumber"
                              placeholder="Professional license number"
                              value={formData.licenseNumber}
                              onChange={(e) => setFormData({ ...formData, licenseNumber: e.target.value })}
                              required
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="experience">Years of Experience</Label>
                            <Input
                              id="experience"
                              type="number"
                              placeholder="5"
                              value={formData.experience}
                              onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                              required
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="hourlyRate">Hourly Rate ($)</Label>
                            <Input
                              id="hourlyRate"
                              type="number"
                              placeholder="50"
                              value={formData.hourlyRate}
                              onChange={(e) => setFormData({ ...formData, hourlyRate: e.target.value })}
                              required
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="qualifications">Qualifications</Label>
                            <Input
                              id="qualifications"
                              placeholder="RN, BSN, Certified Nursing Assistant"
                              value={formData.qualifications}
                              onChange={(e) => setFormData({ ...formData, qualifications: e.target.value })}
                              required
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Specialties</Label>
                            <div className="grid grid-cols-1 gap-2 max-h-32 overflow-y-auto border rounded-md p-2">
                              {specialties.map((specialty: any) => (
                                <div key={specialty.id} className="flex items-center space-x-2">
                                  <Checkbox
                                    id={`specialty-${specialty.id}`}
                                    checked={formData.specialties.includes(specialty.id.toString())}
                                    onCheckedChange={(checked) => {
                                      if (checked) {
                                        setFormData({
                                          ...formData,
                                          specialties: [...formData.specialties, specialty.id.toString()]
                                        });
                                      } else {
                                        setFormData({
                                          ...formData,
                                          specialties: formData.specialties.filter(id => id !== specialty.id.toString())
                                        });
                                      }
                                    }}
                                  />
                                  <Label htmlFor={`specialty-${specialty.id}`} className="text-sm">
                                    {specialty.name}
                                  </Label>
                                </div>
                              ))}
                            </div>
                          </div>

                        </>
                      )}
                    </div>
                    <div className="space-y-4">
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
                        <button
                          type="button"
                          onClick={() => fetchTerms(formData.userType)}
                          className="text-primary hover:underline"
                        >
                          Terms of Service
                        </button>{" "}
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
      
      {/* Terms Dialog */}
      <Dialog open={showTerms} onOpenChange={setShowTerms}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Terms and Conditions</DialogTitle>
          </DialogHeader>
          <div className="whitespace-pre-wrap text-sm">
            {termsContent}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Register;
