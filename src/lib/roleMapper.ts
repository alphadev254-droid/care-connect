export const mapUserRole = (backendRole: string): "patient" | "caregiver" | "physician" | "admin" => {
  switch (backendRole) {
    case "primary_physician":
      return "physician";
    case "system_manager":
    case "regional_manager":
      return "admin";
    case "caregiver":
      return "caregiver";
    case "patient":
    default:
      return "patient";
  }
};