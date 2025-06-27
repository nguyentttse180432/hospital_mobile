import api from "./api";

export const createAppointment = async (appointmentData) => {
  try {
    const response = await api.post("/Appointments", appointmentData);
    console.log("Creating appointment with data:", response.data);
    return response.data;
  } catch (error) {
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
export const getPatientAppointments = async (status = null) => {
  try {
    let url = "/Appointments";
    if (status) {
      url += `?Status=${status}`;
    }
    const response = await api.get(url);
    return response.data;
  } catch (error) {
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
