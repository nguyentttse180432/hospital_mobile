import api from "./api";

export const getPatients = async () => {
  try {
    const response = await api.get(
      "/Accounts/patients?pageSize=10&pageNumber=1"
    );
    console.log("API response:", response.data);

    // Check if response has expected structure with items array
    if (response.data && response.data.items) {
      // Map the patient data to a more consistent format
      return response.data.items.map((patient) => ({
        id: patient.id,
        fullName: `${patient.firstName} ${patient.lastName}`.trim(),
        gender: patient.gender,
        phone: patient.phoneNumber,
        email: patient.email,
        dob: patient.dateOfBirth,
        address: patient.address
          ? typeof patient.address === "string"
            ? patient.address
            : `${patient.address.street || ""}, ${
                patient.address.city || ""
              }`.trim()
          : "",
        bhyt: patient.healthInsuranceCode,
        idNumber: patient.identityNumber,
      }));
    }
    return [];
  } catch (error) {
    console.error("Error fetching patients:", error);
    throw error;
  }
};
