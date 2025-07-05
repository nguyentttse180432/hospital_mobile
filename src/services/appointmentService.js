import api from "./api";

export const createAppointment = async (appointmentData) => {
  try {
    const response = await api.post("/Appointments", appointmentData);
    return response.data;
  } catch (error) {
    console.error("API Error in createAppointment:", error.message);

    // Log detailed error information if available
    if (error.response) {
      console.error("Error response data:", error.response.data);
      console.error("Error response status:", error.response.status);

      // Log the specific error message for debugging
      if (error.response.data?.detail) {
        console.error("API error detail:", error.response.data.detail);
      }
    }

    // Re-throw the error to be handled by the UI layer
    throw error;
  }
};

export const formatAppointmentData = (
  patientId,
  bookingDate,
  packageData,
  servicesList
) => {
  // Format ISO date string
  const isoDate = new Date(bookingDate).toISOString();

  // Basic appointment structure
  const appointmentData = {
    patientId: patientId,
    bookType: "App", // Mobile application booking
    bookingDate: isoDate,
    services: {
      services: [],
    },
  };

  // Add package if selected
  if (packageData && packageData.id) {
    appointmentData.services.packages = {
      packageId: packageData.id,
    };
  }

  // Add individual services if any
  if (servicesList && servicesList.length > 0) {
    appointmentData.services.services = servicesList.map((service) => ({
      serviceId: service.id,
    }));
  }

  return appointmentData;
};

// Lấy tất cả lịch hẹn của một người khám
export const getPatientAppointments = async (
  status = null,
  bookingDate = null
) => {
  try {
    let url = "/Accounts/appointments";
    const params = new URLSearchParams();

    if (status) {
      params.append("checkupRecordStatus", status);
    }

    if (bookingDate) {
      params.append("bookingDate", bookingDate);

      // Validate that the date format is correct (YYYY-MM-DD)
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(bookingDate)) {
        console.warn(
          `Warning: bookingDate format may be incorrect: ${bookingDate}`
        );
      }
    }

    // Nếu có tham số, thêm vào URL
    const queryString = params.toString();
    if (queryString) {
      url += `?${queryString}`;
    }
    const response = await api.get(url);
    return response.data;
  } catch (error) {
    console.error("Error fetching appointments:", error);
    throw error;
  }
};

// Lấy chi tiết một lịch hẹn
export const getAppointmentByCode = async (code) => {
  try {
    const response = await api.get(`/Appointments/${code}/package`);
    console.log("Get appointment with package:", response.data);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Gửi đánh giá cho bác sĩ
export const submitFeedbackDoctor = async (code, feedbackData) => {
  try {
    const response = await api.post(
      `/CheckupRecords/${code}/feedback/medicalstaff`,
      feedbackData
    );
    console.log("Feedback doctor with data:", response.data);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Lấy bác sĩ
export const getDoctorByCode = async (code) => {
  try {
    const response = await api.get(`/CheckupRecords/${code}/medical-staff`);
    console.log("Fetched doctor:", response.data);
    return response.data;
  } catch (error) {
    console.error(`Error fetching doctor with code ${code}:`, error);
    throw error;
  }
};

// Gửi đánh giá dịch vụ (cách chăm sóc, thái độ, v.v.)
export const submitServiceFeedback = async (code, feedbackData) => {
  try {
    const response = await api.post(
      `/CheckupRecords/${code}/feedback`,
      feedbackData
    );
    console.log("Service feedback submitted:", response.data);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Function to handle both types of feedback (doctor and service)
export const submitFeedback = async (
  code,
  feedbackData,
  feedbackType = "service"
) => {
  try {
    if (feedbackType === "doctor") {
      return await submitFeedbackDoctor(code, feedbackData);
    } else {
      return await submitServiceFeedback(code, feedbackData);
    }
  } catch (error) {
    console.error(`Error submitting ${feedbackType} feedback:`, error);
    throw error;
  }
};

//lấy feedback của bác sĩ
export const getDoctorFeedback = async (code) => {
  try {
    const response = await api.get(`/Appointments/${code}/feedback-doctor`);
    console.log("Fetched doctor feedback:", response.data);
    return response.data;
  } catch (error) {
    console.error(`Error fetching doctor feedback for code ${code}:`, error);
    throw error;
  }
};

// Lấy lịch feedback của dịch vụ
export const getServiceFeedback = async (code) => {
  try {
    const response = await api.get(`/Appointments/${code}/feedback`);
    console.log("Fetched service feedback:", response.data);
    return response.data;
  } catch (error) {
    console.error(`Error fetching service feedback for code ${code}:`, error);
    throw error;
  }
};

// Helper function to format today's date in different common formats
// This can help test which format the backend is expecting
export const getDateInMultipleFormats = () => {
  const today = new Date();
  return {
    isoDate: today.toISOString(), // Full ISO: 2025-07-04T14:30:00.000Z
    shortIsoDate: today.toISOString().split("T")[0], // YYYY-MM-DD: 2025-07-04
    localDate: today.toLocaleDateString(), // Local format: 7/4/2025 (US) or 04/07/2025 (EU)
    formattedDate: `${today.getFullYear()}-${String(
      today.getMonth() + 1
    ).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`, // Manual YYYY-MM-DD
    alternateFormat: `${String(today.getDate()).padStart(2, "0")}-${String(
      today.getMonth() + 1
    ).padStart(2, "0")}-${today.getFullYear()}`, // DD-MM-YYYY
    noHyphenFormat: `${today.getFullYear()}${String(
      today.getMonth() + 1
    ).padStart(2, "0")}${String(today.getDate()).padStart(2, "0")}`, // YYYYMMDD
    timezoneInfo: {
      offset: today.getTimezoneOffset(),
      offsetHours: Math.abs(today.getTimezoneOffset()) / 60,
      offsetSign: today.getTimezoneOffset() <= 0 ? "+" : "-",
    },
  };
};

// Lấy thời gian hệ thống từ server
export const getSystemTime = async () => {
  try {
    const response = await api.get("/WorkingDates/datetime-server");
    // {
    //   "value": "2025-07-05T03:10:04.2392176",
    //   "error": {
    //     "code": "",
    //     "message": ""
    //   },
    //   "isSuccess": true
    // }
    return response.data;
  } catch (error) {
    console.error(`Error fetching system time:`, error);
    throw error;
  }
};
