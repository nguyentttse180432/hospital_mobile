import api from "./api";
import {
  getFakePatientAppointments,
  getFakeAppointmentById,
  submitFakeFeedback,
} from "../data/fakeData";

// Cờ để kiểm tra có sử dụng fake data hay không
const USE_FAKE_DATA = true;

export const createAppointment = async (appointmentData) => {
  try {                                                                                             
    // Sử dụng API thực
    const response = await api.post("/Appointments", appointmentData);
    console.log("Creating appointment with data:", response.data);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Lấy tất cả lịch hẹn của một người khám
export const getPatientAppointments = async (patientId) => {
  try {
    if (!patientId) {
      console.warn("getPatientAppointments: Missing patientId");
      return [];
    }

    if (USE_FAKE_DATA) {
      // Sử dụng fake data
      console.log("Using fake appointment data for patient ID:", patientId);
      const appointments = await getFakePatientAppointments(patientId);
      console.log(`Retrieved ${appointments.length} fake appointments`);
      return appointments;
    }

    // Sử dụng API thực
    const response = await api.get(`/Appointments/patient/${patientId}`);
    return response.data.value || [];
  } catch (error) {
    console.error("Error in getPatientAppointments:", error);
    return []; // Trả về mảng rỗng thay vì ném lỗi
  }
};

// Lấy chi tiết một lịch hẹn
export const getAppointmentById = async (appointmentId) => {
  try {
    if (USE_FAKE_DATA) {
      // Sử dụng fake data
      const appointment = await getFakeAppointmentById(appointmentId);
      return appointment;
    }

    // Sử dụng API thực
    const response = await api.get(`/Appointments/${appointmentId}`);
    return response.data.value;
  } catch (error) {
    throw error;
  }
};

// Gửi đánh giá cho một lịch hẹn
export const submitFeedback = async (appointmentId, feedbackData) => {
  try {
    if (USE_FAKE_DATA) {
      // Sử dụng fake data
      const result = await submitFakeFeedback(appointmentId, feedbackData);
      return result;
    }

    // Sử dụng API thực
    const response = await api.post(
      `/Appointments/${appointmentId}/feedback`,
      feedbackData
    );
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
