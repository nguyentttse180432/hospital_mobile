import api from "./api";

export const getPatients = async () => {
  try {
    const response = await api.get(
      "/Accounts/patients?pageSize=10&pageNumber=1"
    );

    // Return a standardized response format
    return {
      isSuccess: response.data?.isSuccess || false,
      value: formatPatientsResponse(response.data),
      error: response.data?.error,
    };
  } catch (error) {
    console.error("Error fetching patients:", error);
    return {
      isSuccess: false,
      error: { message: "Không thể lấy danh sách bệnh nhân" },
    };
  }
};

// Format patients response to a consistent structure
function formatPatientsResponse(data) {
  if (data && data.isSuccess) {
    const patientsData = data.value?.items || [];
    return patientsData.map(formatPatient);
  }
  return [];
}

// Format a single patient object
function formatPatient(patient) {
  return {
    id: patient.id,
    fullName: `${patient.firstName || ""} ${patient.lastName || ""}`.trim(),
    firstName: patient.firstName,
    lastName: patient.lastName,
    gender: patient.gender,
    phone: patient.phoneNumber,
    email: patient.email,
    dob: patient.dateOfBirth,
    address: formatAddress(patient.address),
    bhyt: patient.healthInsuranceCode,
    idNumber: patient.identityNumber,
    isPrimary: patient.isPrimary,
  };
}

// Format address consistently
function formatAddress(address) {
  if (!address) return "";

  if (typeof address === "string") {
    return address;
  }

  return `${address.street || ""}, ${address.ward || ""}, ${
    address.district || ""
  }, ${address.province || ""}`.trim();
}

// Lấy bệnh nhân theo CCCD
export const getPatientByIdNumber = async (idNumber) => {
  try {
    const response = await api.get(`/Patients/${idNumber}`);

    return {
      isSuccess: response.data?.isSuccess || true,
      value: formatPatient(response.data.value || response.data),
      error: response.data?.error,
    };
  } catch (error) {
    // Check if error is 404 (Not Found) - ID card doesn't exist
    if (error.response && error.response.status === 404) {
      return {
        isSuccess: true,
        value: null,
        exists: false,
        error: null,
      };
    }

    console.error("Error fetching patient by ID number:", error);
    return {
      isSuccess: false,
      error: {
        message:
          error.response?.data?.detail ||
          "Không thể tìm thấy thông tin bệnh nhân",
      },
    };
  }
};

// Check if ID card exists by using getPatientByIdNumber
export const checkIdCard = async (idCard) => {
  try {
    const response = await getPatientByIdNumber(idCard);

    // If we got a patient, the ID card exists
    if (response.isSuccess && response.value) {
      return {
        isSuccess: true,
        value: {
          exists: true,
          patient: response.value,
        },
        error: null,
      };
    }
    // If we didn't get a patient but request was successful, ID card doesn't exist
    else if (response.isSuccess) {
      return {
        isSuccess: true,
        value: {
          exists: false,
          patient: null,
        },
        error: null,
      };
    }
    // If there was an error in the request
    else {
      return {
        isSuccess: false,
        value: null,
        error: response.error,
      };
    }
  } catch (error) {
    console.error("Error checking ID card:", error);
    return {
      isSuccess: false,
      error: { message: "Không thể kiểm tra thông tin CCCD/CMND" },
    };
  }
};

// Thêm bệnh nhân mới
export const addPatient = async (patientData) => {
  try {
    const response = await api.post("/Patients", patientData);

    return {
      isSuccess: response.data?.isSuccess || false,
      value: response.data?.value || null,
      error: response.data?.error,
    };
  } catch (error) {
    console.error("Error adding patient:", error);
    return {
      isSuccess: false,
      error: { message: "Không thể tạo hồ sơ bệnh nhân" },
    };
  }
};

// Tạo hồ sơ bệnh nhân mới (Simplified version for auth flow)
export const createPatientProfile = async (profileData) => {
  try {
    // Extract first name and last name from the full name
    // For Vietnamese names, the family name is the first word, the given name is the last word
    // and any words in between are the middle name
    const nameParts = profileData.name?.trim().split(" ") || [];

    let firstName = "";
    let lastName = "";

    if (nameParts.length === 1) {
      // If there's only one word, treat it as firstName
      firstName = nameParts[0];
    } else if (nameParts.length >= 2) {
      // In Vietnamese names, the given name is usually the last part
      firstName = nameParts[nameParts.length - 1];
      // The family name and middle name together form the lastName
      lastName = nameParts.slice(0, nameParts.length - 1).join(" ");
    }

    // Convert the input format to match API requirements
    const formattedData = {
      firstName: firstName,
      lastName: lastName,
      gender: profileData.gender === "Nam" ? "Male" : "Female",
      dateOfBirth: profileData.dateOfBirth,
      identityNumber: profileData.idCard,
      phoneNumber: profileData.phoneNumber,
      email: profileData.email || "",
      address: {
        street: profileData.address,
        ward: "",
        district: "",
        province: "",
      },
      isPrimary: profileData.isPrimary,
    };

    const response = await api.post("/Patients", formattedData);

    return {
      isSuccess: response.data?.isSuccess || false,
      value: response.data?.value || null,
      error: response.data?.error,
    };
  } catch (error) {
    console.error("Error creating patient profile:", error);
    return {
      isSuccess: false,
      error: { message: "Không thể tạo hồ sơ bệnh nhân" },
    };
  }
};

// Link bệnh nhân với tài khoản
export const linkPatientToAccount = async (patientId, isPrimary = true) => {
  try {
    const response = await api.post("/Patients/link", {
      patientId,
      isPrimary,
    });

    return {
      isSuccess: response.data?.isSuccess || false,
      value: response.data?.value || null,
      error: response.data?.error,
    };
  } catch (error) {
    console.error("Error linking patient to account:", error);
    return {
      isSuccess: false,
      error: { message: "Không thể liên kết hồ sơ bệnh nhân với tài khoản" },
    };
  }
};

// Link patient profile with ID card and OTP verification
export const linkPatientProfile = async (linkData) => {
  try {
    const response = await api.post("/Patients/link", {
      patientId: linkData.patientId,
      isPrimary: linkData.isPrimary,
    });

    return {
      isSuccess: response.data?.isSuccess || false,
      value: response.data?.value || null,
      error: response.data?.error,
    };
  } catch (error) {
    console.error("Error linking patient profile:", error);
    return {
      isSuccess: false,
      error: { message: "Không thể liên kết hồ sơ bệnh nhân" },
    };
  }
};

// Get primary patient profile for current account
export const getPrimaryPatient = async () => {
  try {
    const response = await api.get("/Accounts/primary-patient");

    return {
      isSuccess: response.data?.isSuccess || false,
      value: response.data?.isSuccess
        ? formatPatient(response.data.value)
        : null,
      error: response.data?.error,
    };
  } catch (error) {
    console.error("Error getting primary patient:", error);
    return {
      isSuccess: false,
      error: { message: "Không thể lấy thông tin hồ sơ chính" },
    };
  }
};
