import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
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
import { CheckCircle2, ExternalLink, FileUp, Loader2, LogOut, ShieldCheck, Trash2 } from "lucide-react";

const toArray = (value: any): string[] => {
  if (!value) return [];
  if (Array.isArray(value)) return value.map(String);
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.map(String) : [String(parsed)];
  } catch {
    return [String(value)];
  }
};

const toDocuments = (value: any): any[] => {
  let items: any[] = [];
  if (Array.isArray(value)) {
    items = value;
  } else if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      items = Array.isArray(parsed) ? parsed : [parsed];
    } catch {
      items = [value];
    }
  } else if (value) {
    items = [value];
  }

  return items.map((item) => {
    if (typeof item === "string") {
      return { url: item, filename: item.split("/").pop() || "Document" };
    }
    return item;
  });
};

const CaregiverVerification = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { logout } = useAuth();
  const [form, setForm] = useState({
    idNumber: "",
    dateOfBirth: "",
    licensingInstitution: "",
    licenseNumber: "",
    experience: "",
    qualifications: "",
    region: "",
    district: "",
    traditionalAuthority: [] as string[],
    village: [] as string[],
    specialtyIds: [] as string[],
  });
  const [regions, setRegions] = useState<string[]>([]);
  const [districts, setDistricts] = useState<string[]>([]);
  const [wards, setWards] = useState<string[]>([]);
  const [villages, setVillages] = useState<string[]>([]);
  const [savingSection, setSavingSection] = useState<string | null>(null);
  const [uploadingField, setUploadingField] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{
    field: "profileImage" | "idDocuments" | "supportingDocuments";
    index?: number;
    label: string;
  } | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["caregiver-verification"],
    queryFn: async () => {
      const response = await api.get("/caregivers/verification");
      return response.data;
    },
  });

  const { data: specialtiesData } = useQuery({
    queryKey: ["specialties"],
    queryFn: async () => {
      const response = await api.get("/specialties");
      return response.data.specialties || [];
    },
  });

  useEffect(() => {
    api.get("/locations/regions").then((response) => {
      setRegions(response.data.data || []);
    }).catch(() => toast.error("Failed to load counties"));
  }, []);

  useEffect(() => {
    const caregiver = data?.caregiver;
    if (!caregiver) return;
    setForm({
      idNumber: caregiver.User?.idNumber || "",
      dateOfBirth: caregiver.dateOfBirth || "",
      licensingInstitution: caregiver.licensingInstitution || "",
      licenseNumber: caregiver.licenseNumber?.startsWith("TEMP-") ? "" : caregiver.licenseNumber || "",
      experience: caregiver.experience ? String(caregiver.experience) : "",
      qualifications: caregiver.qualifications === "To be updated" ? "" : caregiver.qualifications || "",
      region: caregiver.region || "",
      district: caregiver.district || "",
      traditionalAuthority: toArray(caregiver.traditionalAuthority),
      village: toArray(caregiver.village),
      specialtyIds: (caregiver.Specialties || []).map((specialty: any) => String(specialty.id)),
    });
  }, [data]);

  useEffect(() => {
    if (!form.region) return;
    api.get(`/locations/districts/${encodeURIComponent(form.region)}`).then((response) => {
      setDistricts(response.data.data || []);
    }).catch(() => toast.error("Failed to load constituencies"));
  }, [form.region]);

  useEffect(() => {
    if (!form.region || !form.district) return;
    api.get(`/locations/traditional-authorities/${encodeURIComponent(form.region)}/${encodeURIComponent(form.district)}`).then((response) => {
      setWards(response.data.data || []);
    }).catch(() => toast.error("Failed to load wards"));
  }, [form.region, form.district]);

  useEffect(() => {
    if (!form.region || !form.district || form.traditionalAuthority.length === 0) {
      setVillages([]);
      return;
    }
    Promise.all(
      form.traditionalAuthority.map((ward) =>
        api.get(`/locations/villages/${encodeURIComponent(form.region)}/${encodeURIComponent(form.district)}/${encodeURIComponent(ward)}`)
      )
    ).then((responses) => {
      setVillages(Array.from(new Set(responses.flatMap((response) => response.data.data || []))));
    }).catch(() => toast.error("Failed to load sub-locations"));
  }, [form.region, form.district, form.traditionalAuthority]);

  const saveMutation = useMutation({
    mutationFn: async (payload: any) => {
      const response = await api.put("/caregivers/verification", payload);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["caregiver-verification"] });
      toast.success("Saved");
    },
  });

  const saveSection = async (section: string, payload: any) => {
    setSavingSection(section);
    try {
      await saveMutation.mutateAsync(payload);
    } finally {
      setSavingSection(null);
    }
  };

  const uploadMutation = useMutation({
    mutationFn: async ({ field, file }: { field: string; file: File }) => {
      const payload = new FormData();
      payload.append(field, file);
      const response = await api.post("/caregivers/verification/files", payload, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["caregiver-verification"] });
      toast.success("File uploaded");
    },
    onSettled: () => {
      setUploadingField(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (payload: { field: string; index?: number }) => {
      const response = await api.delete("/caregivers/verification/files", { data: payload });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["caregiver-verification"] });
      toast.success("Document deleted");
      setDeleteTarget(null);
    },
  });

  const checklist = data?.checklist || {};
  const completedCount = useMemo(
    () => ["personal", "professional", "location", "files"].filter((key) => checklist[key]).length,
    [checklist]
  );
  const caregiver = data?.caregiver;
  const profileImage = caregiver?.profileImage;
  const idDocuments = toDocuments(caregiver?.idDocuments);
  const supportingDocuments = toDocuments(caregiver?.supportingDocuments);
  const isSaving = saveMutation.isPending || Boolean(savingSection);
  const fileViewUrl = (field: "profileImage" | "idDocuments" | "supportingDocuments", index = 0) =>
    `${api.defaults.baseURL || ""}/caregivers/verification/files/view/${field}/${index}`;

  const toggleValue = (key: "traditionalAuthority" | "village" | "specialtyIds", value: string, checked: boolean) => {
    setForm((current) => ({
      ...current,
      [key]: checked ? [...current[key], value] : current[key].filter((item) => item !== value),
      ...(key === "traditionalAuthority" ? { village: [] } : {}),
    }));
  };

  if (isLoading) {
    return <div className="min-h-screen grid place-items-center"><Loader2 className="h-6 w-6 animate-spin" /></div>;
  }

  if (caregiver?.verificationStatus === "verified" || caregiver?.verificationStatus === "APPROVED") {
    navigate("/dashboard");
    return null;
  }

  return (
    <main className="min-h-screen bg-muted/30 p-4 sm:p-6">
      <div className="mx-auto max-w-5xl space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold">Caregiver verification</h1>
            <p className="text-sm text-muted-foreground">Complete these sections while your account is awaiting admin review.</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary">{completedCount}/4 complete</Badge>
            <Button variant="outline" onClick={async () => { await logout(); navigate("/login"); }}>
              <LogOut className="mr-2 h-4 w-4" />
              Sign out
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <ShieldCheck className="h-4 w-4" />
              Review status: {caregiver?.verificationStatus || "pending"}
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-2 sm:grid-cols-4">
            {[
              ["personal", "Personal ID"],
              ["professional", "Professional details"],
              ["location", "Service location"],
              ["files", "Documents"],
            ].map(([key, label]) => (
              <div key={key} className="flex items-center gap-2 rounded-md border p-3 text-sm">
                <CheckCircle2 className={`h-4 w-4 ${checklist[key] ? "text-green-600" : "text-muted-foreground"}`} />
                {label}
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Personal ID</CardTitle></CardHeader>
          <CardContent className="grid gap-3 md:grid-cols-2">
            <div className="space-y-2">
              <Label>National ID number</Label>
              <Input disabled={savingSection === "personal"} value={form.idNumber} onChange={(event) => setForm({ ...form, idNumber: event.target.value })} onBlur={() => saveSection("personal", { idNumber: form.idNumber })} />
            </div>
            <div className="space-y-2">
              <Label>Date of birth</Label>
              <Input disabled={savingSection === "personal"} type="date" value={form.dateOfBirth} onChange={(event) => setForm({ ...form, dateOfBirth: event.target.value })} onBlur={() => saveSection("personal", { dateOfBirth: form.dateOfBirth })} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Professional Details</CardTitle></CardHeader>
          <CardContent className="grid gap-3 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Licensing institution</Label>
              <Input disabled={savingSection === "professional"} value={form.licensingInstitution} onChange={(event) => setForm({ ...form, licensingInstitution: event.target.value })} onBlur={() => saveSection("professional", { licensingInstitution: form.licensingInstitution })} />
            </div>
            <div className="space-y-2">
              <Label>License number</Label>
              <Input disabled={savingSection === "professional"} value={form.licenseNumber} onChange={(event) => setForm({ ...form, licenseNumber: event.target.value })} onBlur={() => saveSection("professional", { licenseNumber: form.licenseNumber })} />
            </div>
            <div className="space-y-2">
              <Label>Years of experience</Label>
              <Input disabled={savingSection === "professional"} type="number" min="0" value={form.experience} onChange={(event) => setForm({ ...form, experience: event.target.value })} onBlur={() => saveSection("professional", { experience: form.experience })} />
            </div>
            <div className="space-y-2">
              <Label>Qualifications</Label>
              <Input disabled={savingSection === "professional"} value={form.qualifications} onChange={(event) => setForm({ ...form, qualifications: event.target.value })} onBlur={() => saveSection("professional", { qualifications: form.qualifications })} />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label>Specialties</Label>
              <div className="grid max-h-48 gap-2 overflow-y-auto rounded-md border p-3 sm:grid-cols-2">
                {(specialtiesData || []).map((specialty: any) => (
                  <label key={specialty.id} className="flex items-center gap-2 text-sm">
                    <Checkbox disabled={savingSection === "professional"} checked={form.specialtyIds.includes(String(specialty.id))} onCheckedChange={(checked) => toggleValue("specialtyIds", String(specialty.id), Boolean(checked))} />
                    {specialty.name}
                  </label>
                ))}
              </div>
              <Button size="sm" disabled={savingSection === "professional"} onClick={() => saveSection("professional", { specialtyIds: form.specialtyIds })}>
                {savingSection === "professional" ? "Saving..." : "Save specialties"}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Service Location</CardTitle></CardHeader>
          <CardContent className="grid gap-3 md:grid-cols-2">
            <div className="space-y-2">
              <Label>County</Label>
              <Select disabled={savingSection === "location"} value={form.region} onValueChange={(value) => setForm({ ...form, region: value, district: "", traditionalAuthority: [], village: [] })}>
                <SelectTrigger><SelectValue placeholder="Select county" /></SelectTrigger>
                <SelectContent>{regions.map((region) => <SelectItem key={region} value={region}>{region}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Constituency</Label>
              <Select disabled={savingSection === "location"} value={form.district} onValueChange={(value) => setForm({ ...form, district: value, traditionalAuthority: [], village: [] })}>
                <SelectTrigger><SelectValue placeholder="Select constituency" /></SelectTrigger>
                <SelectContent>{districts.map((district) => <SelectItem key={district} value={district}>{district}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Wards</Label>
              <div className="max-h-44 overflow-y-auto rounded-md border p-3 space-y-2">
                {wards.map((ward) => (
                  <label key={ward} className="flex items-center gap-2 text-sm">
                    <Checkbox disabled={savingSection === "location"} checked={form.traditionalAuthority.includes(ward)} onCheckedChange={(checked) => toggleValue("traditionalAuthority", ward, Boolean(checked))} />
                    {ward}
                  </label>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <Label>Sub-locations</Label>
              <div className="max-h-44 overflow-y-auto rounded-md border p-3 space-y-2">
                {villages.map((village) => (
                  <label key={village} className="flex items-center gap-2 text-sm">
                    <Checkbox disabled={savingSection === "location"} checked={form.village.includes(village)} onCheckedChange={(checked) => toggleValue("village", village, Boolean(checked))} />
                    {village}
                  </label>
                ))}
              </div>
            </div>
            <div className="md:col-span-2">
              <Button disabled={savingSection === "location"} onClick={() => saveSection("location", {
                region: form.region,
                district: form.district,
                traditionalAuthority: form.traditionalAuthority,
                village: form.village,
              })}>{savingSection === "location" ? "Saving..." : "Save location"}</Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Documents</CardTitle></CardHeader>
          <CardContent className="grid gap-3 md:grid-cols-3">
            {[
              ["profilePicture", "Profile picture", ".jpg,.jpeg,.png", profileImage ? 1 : 0, 1],
              ["idDocuments", "ID document", ".pdf,.jpg,.jpeg,.png", idDocuments.length, 2],
              ["supportingDocuments", "Supporting document", ".pdf,.doc,.docx,.jpg,.jpeg,.png", supportingDocuments.length, 5],
            ].map(([field, label, accept, count, max]) => (
              <div key={field} className="space-y-2 rounded-md border p-3">
                <div className="flex items-center justify-between gap-2">
                  <Label>{label}</Label>
                  <Badge variant="outline">{count}/{max}</Badge>
                </div>
                <Input disabled={uploadingField === field || Number(count) >= Number(max)} type="file" accept={accept as string} onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (file) {
                    setUploadingField(field as string);
                    uploadMutation.mutate({ field: field as string, file });
                    event.target.value = "";
                  }
                }} />
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  {uploadingField === field ? <Loader2 className="h-3 w-3 animate-spin" /> : <FileUp className="h-3 w-3" />}
                  {uploadingField === field ? "Uploading..." : Number(count) >= Number(max) ? "Delete an existing file to replace it" : "Saves immediately after selection"}
                </p>
              </div>
            ))}
            <div className="space-y-2 rounded-md border p-3 md:col-span-3">
              <Label>Uploaded documents</Label>
              <div className="grid gap-2 md:grid-cols-3">
                <div className="space-y-2">
                  <p className="text-sm font-medium">Profile picture</p>
                  {profileImage ? (
                    <div className="flex items-center justify-between gap-2 rounded-md border p-2 text-sm">
                      <a href={fileViewUrl("profileImage")} target="_blank" rel="noreferrer" className="inline-flex min-w-0 items-center gap-1 text-primary hover:underline">
                        <ExternalLink className="h-3 w-3 shrink-0" />
                        <span className="truncate">View profile picture</span>
                      </a>
                      <Button variant="ghost" size="icon" disabled={deleteMutation.isPending} onClick={() => setDeleteTarget({ field: "profileImage", label: "profile picture" })}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : <p className="text-xs text-muted-foreground">No profile picture uploaded.</p>}
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium">ID documents</p>
                  {idDocuments.length > 0 ? idDocuments.map((document, index) => (
                    <div key={`${document.url}-${index}`} className="flex items-center justify-between gap-2 rounded-md border p-2 text-sm">
                      <a href={fileViewUrl("idDocuments", index)} target="_blank" rel="noreferrer" className="inline-flex min-w-0 items-center gap-1 text-primary hover:underline">
                        <ExternalLink className="h-3 w-3 shrink-0" />
                        <span className="truncate">{document.filename || `ID document ${index + 1}`}</span>
                      </a>
                      <Button variant="ghost" size="icon" disabled={deleteMutation.isPending} onClick={() => setDeleteTarget({ field: "idDocuments", index, label: document.filename || `ID document ${index + 1}` })}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  )) : <p className="text-xs text-muted-foreground">No ID documents uploaded.</p>}
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium">Supporting documents</p>
                  {supportingDocuments.length > 0 ? supportingDocuments.map((document, index) => (
                    <div key={`${document.url}-${index}`} className="flex items-center justify-between gap-2 rounded-md border p-2 text-sm">
                      <a href={fileViewUrl("supportingDocuments", index)} target="_blank" rel="noreferrer" className="inline-flex min-w-0 items-center gap-1 text-primary hover:underline">
                        <ExternalLink className="h-3 w-3 shrink-0" />
                        <span className="truncate">{document.filename || `Supporting document ${index + 1}`}</span>
                      </a>
                      <Button variant="ghost" size="icon" disabled={deleteMutation.isPending} onClick={() => setDeleteTarget({ field: "supportingDocuments", index, label: document.filename || `Supporting document ${index + 1}` })}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  )) : <p className="text-xs text-muted-foreground">No supporting documents uploaded.</p>}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      <AlertDialog open={Boolean(deleteTarget)} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete document?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove {deleteTarget?.label}. You can upload a replacement after deleting it.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteMutation.isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              disabled={deleteMutation.isPending}
              onClick={() => deleteTarget && deleteMutation.mutate(deleteTarget)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteMutation.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </main>
  );
};

export default CaregiverVerification;
