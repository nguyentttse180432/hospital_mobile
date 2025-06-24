import api from "./api";

export const getPatients = async () => {
  try {
    const response = await api.get(
      "/Accounts/patients?pageSize=10&pageNumber=1"
    );

    // Check if response has expected structure with items array
    // Response example: { value: { totalCount: 1, items: [...], ... }, isSuccess: true }
    if (response.data && response.data.isSuccess) {
      const patientsData = response.data.value?.items || [];
      // Map the patient data to a more consistent format
      return patientsData.map((patient) => ({
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
                patient.address.ward || ""
              }, ${patient.address.district || ""}, ${
                patient.address.province || ""
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
