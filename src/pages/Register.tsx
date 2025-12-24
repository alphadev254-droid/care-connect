import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
    fetchRegions();
  }, []);

  const fetchSpecialties = async () => {
    try {
      const response = await api.get('/specialties');
      setSpecialties(response.data.specialties || []);
    } catch (error) {
      console.error('Failed to fetch specialties:', error);
    }
  };

  const fetchRegions = async () => {
    try {
      const response = await api.get('/locations/regions');
      setRegions(response.data.data || []);
    } catch (error) {
      console.error('Failed to fetch regions:', error);
    }
  };

  const fetchDistricts = async (region: string) => {
    try {
      const response = await api.get(`/locations/districts/${encodeURIComponent(region)}`);
      setDistricts(response.data.data || []);
      setTraditionalAuthorities([]);
      setVillages([]);
    } catch (error) {
      console.error('Failed to fetch districts:', error);
    }
  };

  const fetchTraditionalAuthorities = async (region: string, district: string) => {
    try {
      const response = await api.get(`/locations/traditional-authorities/${encodeURIComponent(region)}/${encodeURIComponent(district)}`);
      setTraditionalAuthorities(response.data.data || []);
      setVillages([]);
    } catch (error) {
      console.error('Failed to fetch traditional authorities:', error);
    }
  };

  const fetchVillages = async (region: string, district: string, ta: string) => {
    try {
      const response = await api.get(`/locations/villages/${encodeURIComponent(region)}/${encodeURIComponent(district)}/${encodeURIComponent(ta)}`);
      setVillages(response.data.data || []);
    } catch (error) {
      console.error('Failed to fetch villages:', error);
    }
  };

  const [step, setStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [termsContent, setTermsContent] = useState("");
  const [specialties, setSpecialties] = useState([]);
  const [regions, setRegions] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [traditionalAuthorities, setTraditionalAuthorities] = useState([]);
  const [villages, setVillages] = useState([]);
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
    idNumber: "",
    dateOfBirth: "",
    address: "",
    emergencyContact: "",
    // Guardian fields for child/elderly patients
    guardianFirstName: "",
    guardianLastName: "",
    guardianPhone: "",
    guardianEmail: "",
    guardianRelationship: "",
    guardianIdNumber: "",
    // Caregiver fields
    licensingInstitution: "",
    licenseNumber: "",
    experience: "",
    qualifications: "",
    supportingDocuments: null,
    profilePicture: null,
    idDocuments: null,
    specialties: [],
    // Location fields
    region: "",
    district: "",
    traditionalAuthority: "",
    village: "",
  });
  const [showCustomRelationship, setShowCustomRelationship] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (step < 3) {
      setStep(step + 1);
      return;
    }

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
      
      formDataToSend.append('email', formData.email);
      formDataToSend.append('password', formData.password);
      formDataToSend.append('firstName', formData.firstName);
      formDataToSend.append('lastName', formData.lastName);
      formDataToSend.append('phone', formData.phone);
      formDataToSend.append('role', formData.userType);

      if (formData.region) formDataToSend.append('region', formData.region);
      if (formData.district) formDataToSend.append('district', formData.district);
      if (formData.traditionalAuthority) formDataToSend.append('traditionalAuthority', formData.traditionalAuthority);
      if (formData.village) formDataToSend.append('village', formData.village);

      if (formData.userType === 'patient' || formData.userType === 'child_patient' || formData.userType === 'elderly_patient') {
        formDataToSend.append('idNumber', formData.idNumber);
        formDataToSend.append('dateOfBirth', formData.dateOfBirth);
        formDataToSend.append('address', formData.address);
        formDataToSend.append('emergencyContact', formData.emergencyContact);
        
        if (formData.userType === 'child_patient' || formData.userType === 'elderly_patient') {
          formDataToSend.append('guardianFirstName', formData.guardianFirstName);
          formDataToSend.append('guardianLastName', formData.guardianLastName);
          formDataToSend.append('guardianPhone', formData.guardianPhone);
          formDataToSend.append('guardianEmail', formData.guardianEmail);
          formDataToSend.append('guardianRelationship', formData.guardianRelationship);
          formDataToSend.append('guardianIdNumber', formData.guardianIdNumber);
          formDataToSend.append('patientType', formData.userType);
        }
        
        formDataToSend.set('role', 'patient');
      } else if (formData.userType === 'guardian') {
        formDataToSend.append('idNumber', formData.idNumber);
        formDataToSend.append('guardianAccountType', formData.guardianAccountType);
        formDataToSend.set('role', 'guardian');
      } else if (formData.userType === 'caregiver') {
        formDataToSend.append('idNumber', formData.idNumber);
        formDataToSend.append('licensingInstitution', formData.licensingInstitution);
        formDataToSend.append('licenseNumber', formData.licenseNumber);
        formDataToSend.append('experience', formData.experience || '0');
        formDataToSend.append('qualifications', formData.qualifications);

        if (formData.specialties.length > 0) {
          formData.specialties.forEach(specialtyId => {
            formDataToSend.append('specialties[]', specialtyId);
          });
        }
        
        if (formData.supportingDocuments) {
          Array.from(formData.supportingDocuments).slice(0, 5).forEach((file: any) => {
            formDataToSend.append('supportingDocuments', file);
          });
        }
        
        if (formData.profilePicture) {
          formDataToSend.append('profilePicture', formData.profilePicture);
        }
        
        if (formData.idDocuments) {
          Array.from(formData.idDocuments).slice(0, 3).forEach((file: any) => {
            formDataToSend.append('idDocuments', file);
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
      title: "Patient (Adult)",
      description: "I need home healthcare services for myself",
    },
    {
      id: "child_patient",
      title: "Child Patient",
      description: "I'm registering for a child who needs healthcare",
    },
    {
      id: "elderly_patient",
      title: "Elderly Patient",
      description: "I'm registering for an elderly person who needs care",
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

                {step === 2 && (
                  <div className="grid md:grid-cols-2 gap-6">
                    {/* Left Column - Always 6 fields */}
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="firstName">{(formData.userType === 'child_patient' || formData.userType === 'elderly_patient') ? 'Patient First Name' : 'First Name'}</Label>
                        <Input
                          id="firstName"
                          placeholder="John"
                          value={formData.firstName}
                          onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastName">{(formData.userType === 'child_patient' || formData.userType === 'elderly_patient') ? 'Patient Last Name' : 'Last Name'}</Label>
                        <Input
                          id="lastName"
                          placeholder="Doe"
                          value={formData.lastName}
                          onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">{(formData.userType === 'child_patient' || formData.userType === 'elderly_patient') ? 'Guardian Email' : 'Email Address'}</Label>
                        <Input
                          id="email"
                          type="email"
                          placeholder="name@example.com"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone">{(formData.userType === 'child_patient' || formData.userType === 'elderly_patient') ? 'Guardian Phone' : 'Phone Number'}</Label>
                        <Input
                          id="phone"
                          type="tel"
                          placeholder="+265 xxx xxx xxx"
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="idNumber">{(formData.userType === 'child_patient' || formData.userType === 'elderly_patient') ? 'Patient ID Number' : 'National ID Number'}</Label>
                        <Input
                          id="idNumber"
                          placeholder="National ID number"
                          value={formData.idNumber}
                          onChange={(e) => setFormData({ ...formData, idNumber: e.target.value })}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="dateOfBirth">{formData.userType === 'child_patient' ? "Child's Date of Birth" : formData.userType === 'elderly_patient' ? "Elderly Person's Date of Birth" : "Date of Birth"}</Label>
                        <Input
                          id="dateOfBirth"
                          type="date"
                          value={formData.dateOfBirth}
                          onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                          required
                        />
                      </div>
                      {formData.userType === 'caregiver' && (
                        <div className="space-y-2">
                          <Label htmlFor="profilePicture">Profile Picture</Label>
                          <Input
                            id="profilePicture"
                            type="file"
                            accept=".jpg,.jpeg,.png"
                            onChange={(e) => setFormData({ ...formData, profilePicture: e.target.files?.[0] || null })}
                          />
                          {formData.profilePicture && (
                            <p className="text-xs text-muted-foreground font-medium">Selected: {formData.profilePicture.name}</p>
                          )}
                          <p className="text-xs text-muted-foreground">Upload a professional photo (JPG, PNG)</p>
                        </div>
                      )}
                    </div>

                    {/* Right Column - Always 6 fields */}
                    <div className="space-y-4">
                      {/* Patient Types */}
                      {(formData.userType === 'patient' || formData.userType === 'child_patient' || formData.userType === 'elderly_patient') && (
                        <>
                          <div className="space-y-2">
                            <Label htmlFor="address">Address</Label>
                            <Input
                              id="address"
                              placeholder="Home address"
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
                          {(formData.userType === 'child_patient' || formData.userType === 'elderly_patient') ? (
                            <>
                              <div className="space-y-2">
                                <Label htmlFor="guardianFirstName">Guardian First Name</Label>
                                <Input
                                  id="guardianFirstName"
                                  placeholder="Guardian's first name"
                                  value={formData.guardianFirstName}
                                  onChange={(e) => setFormData({ ...formData, guardianFirstName: e.target.value })}
                                  required
                                />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="guardianLastName">Guardian Last Name</Label>
                                <Input
                                  id="guardianLastName"
                                  placeholder="Guardian's last name"
                                  value={formData.guardianLastName}
                                  onChange={(e) => setFormData({ ...formData, guardianLastName: e.target.value })}
                                  required
                                />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="guardianRelationship">Relationship</Label>
                                {showCustomRelationship ? (
                                  <div className="space-y-2">
                                    <Input
                                      id="guardianRelationship"
                                      placeholder="Enter relationship"
                                      value={formData.guardianRelationship}
                                      onChange={(e) => setFormData({ ...formData, guardianRelationship: e.target.value })}
                                      required
                                    />
                                    <Button
                                      type="button"
                                      variant="outline"
                                      size="sm"
                                      onClick={() => {
                                        setShowCustomRelationship(false);
                                        setFormData({ ...formData, guardianRelationship: "" });
                                      }}
                                    >
                                      Back to options
                                    </Button>
                                  </div>
                                ) : (
                                  <Select
                                    value={formData.guardianRelationship}
                                    onValueChange={(value) => {
                                      if (value === "other") {
                                        setShowCustomRelationship(true);
                                        setFormData({ ...formData, guardianRelationship: "" });
                                      } else {
                                        setFormData({ ...formData, guardianRelationship: value });
                                      }
                                    }}
                                  >
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select relationship" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {formData.userType === 'child_patient' ? (
                                        <>
                                          <SelectItem value="parent">Parent</SelectItem>
                                          <SelectItem value="guardian">Legal Guardian</SelectItem>
                                          <SelectItem value="grandparent">Grandparent</SelectItem>
                                          <SelectItem value="aunt_uncle">Aunt/Uncle</SelectItem>
                                          <SelectItem value="other">Other (specify)</SelectItem>
                                        </>
                                      ) : (
                                        <>
                                          <SelectItem value="child">Adult Child</SelectItem>
                                          <SelectItem value="spouse">Spouse</SelectItem>
                                          <SelectItem value="sibling">Sibling</SelectItem>
                                          <SelectItem value="caregiver">Professional Caregiver</SelectItem>
                                          <SelectItem value="other">Other (specify)</SelectItem>
                                        </>
                                      )}
                                    </SelectContent>
                                  </Select>
                                )}
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="guardianIdNumber">Guardian ID Number</Label>
                                <Input
                                  id="guardianIdNumber"
                                  placeholder="Guardian's national ID"
                                  value={formData.guardianIdNumber}
                                  onChange={(e) => setFormData({ ...formData, guardianIdNumber: e.target.value })}
                                  required
                                />
                              </div>
                            </>
                          ) : (
                            <>
                              <div className="h-[68px]"></div>
                              <div className="h-[68px]"></div>
                              <div className="h-[68px]"></div>
                              <div className="h-[68px]"></div>
                            </>
                          )}
                        </>
                      )}

                      {/* Caregiver Type */}
                      {formData.userType === 'caregiver' && (
                        <>
                          <div className="space-y-2">
                            <Label htmlFor="licensingInstitution">Licensing Institution</Label>
                            <Input
                              id="licensingInstitution"
                              placeholder="e.g., Nurses Council of Malawi"
                              value={formData.licensingInstitution}
                              onChange={(e) => setFormData({ ...formData, licensingInstitution: e.target.value })}
                              required
                            />
                          </div>
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
                            <div className="max-h-24 overflow-y-auto border rounded-md p-2">
                              {specialties.map((specialty: any) => (
                                <div key={specialty.id} className="flex items-center space-x-2 py-1">
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
                          <div className="space-y-2">
                            <Label htmlFor="idDocuments">ID Documents</Label>
                            <Input
                              id="idDocuments"
                              type="file"
                              multiple
                              accept=".pdf,.jpg,.jpeg,.png"
                              onChange={(e) => setFormData({ ...formData, idDocuments: e.target.files })}
                            />
                            {formData.idDocuments && formData.idDocuments.length > 0 && (
                              <div className="text-xs text-muted-foreground">
                                <p className="font-medium">Selected files ({formData.idDocuments.length}/3):</p>
                                {Array.from(formData.idDocuments).slice(0, 3).map((file, index) => (
                                  <p key={index} className="truncate">• {file.name}</p>
                                ))}
                              </div>
                            )}
                            <p className="text-xs text-muted-foreground">Upload ID documents (max 3 files: PDF, JPG, PNG)</p>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="supportingDocuments">Supporting Documents</Label>
                            <Input
                              id="supportingDocuments"
                              type="file"
                              multiple
                              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                              onChange={(e) => setFormData({ ...formData, supportingDocuments: e.target.files })}
                            />
                            {formData.supportingDocuments && formData.supportingDocuments.length > 0 && (
                              <div className="text-xs text-muted-foreground">
                                <p className="font-medium">Selected files ({formData.supportingDocuments.length}/5):</p>
                                {Array.from(formData.supportingDocuments).slice(0, 5).map((file, index) => (
                                  <p key={index} className="truncate">• {file.name}</p>
                                ))}
                              </div>
                            )}
                            <p className="text-xs text-muted-foreground">Upload certificates, licenses (max 5 files)</p>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                )}

                {step === 3 && (
                  <div className="space-y-4">
                    {/* Location Fields */}
                    <div className="grid md:grid-cols-2 gap-4 pb-4 border-b">
                      <div className="space-y-2">
                        <Label htmlFor="region">Region</Label>
                        <Select
                          value={formData.region}
                          onValueChange={(value) => {
                            setFormData({ ...formData, region: value, district: "", traditionalAuthority: "", village: "" });
                            fetchDistricts(value);
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select region" />
                          </SelectTrigger>
                          <SelectContent>
                            {regions.map((region: string) => (
                              <SelectItem key={region} value={region}>{region}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="district">District</Label>
                        <Select
                          value={formData.district}
                          onValueChange={(value) => {
                            setFormData({ ...formData, district: value, traditionalAuthority: "", village: "" });
                            fetchTraditionalAuthorities(formData.region, value);
                          }}
                          disabled={!formData.region}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select district" />
                          </SelectTrigger>
                          <SelectContent>
                            {districts.map((district: string) => (
                              <SelectItem key={district} value={district}>{district}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="traditionalAuthority">Traditional Authority</Label>
                        <Select
                          value={formData.traditionalAuthority}
                          onValueChange={(value) => {
                            setFormData({ ...formData, traditionalAuthority: value, village: "" });
                            fetchVillages(formData.region, formData.district, value);
                          }}
                          disabled={!formData.district}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select TA" />
                          </SelectTrigger>
                          <SelectContent>
                            {traditionalAuthorities.map((ta: string) => (
                              <SelectItem key={ta} value={ta}>{ta}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="village">Village</Label>
                        <Select
                          value={formData.village}
                          onValueChange={(value) => setFormData({ ...formData, village: value })}
                          disabled={!formData.traditionalAuthority}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select village" />
                          </SelectTrigger>
                          <SelectContent>
                            {villages.map((village: string) => (
                              <SelectItem key={village} value={village}>{village}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

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