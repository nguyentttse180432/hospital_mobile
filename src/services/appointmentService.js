import api from "./api";

/**
 * Create a new appointment
 * @param {Object} appointmentData - Appointment data in the format:
 * {
 *   patientId: string (UUID),
 *   bookType: string (e.g., "App"),
 *   bookingDate: string (ISO date format),
 *   services: {
 *     packages: {
 *       packageId: string (UUID)
 *     },
 *     services: [
 *       {
 *         serviceId: string (UUID)
 *       }
 *     ]
 *   }
 * }
 * @returns {Promise} Promise with the API response
 */
export const createAppointment = async (appointmentData) => {
  try {
    const response = await api.post("/Appointments", appointmentData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Get all appointments for a patient
 * @param {string} patientId - Patient UUID
 * @returns {Promise} Promise with the API response containing patient's appointments
 */
export const getPatientAppointments = async (patientId) => {
  try {
    const response = await api.get(`/Appointments/patient/${patientId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Get details of a specific appointment
 * @param {string} appointmentId - Appointment UUID
 * @returns {Promise} Promise with the API response containing appointment details
 */
export const getAppointmentDetails = async (appointmentId) => {
  try {
    const response = await api.get(`/Appointments/${appointmentId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Update an existing appointment
 * @param {string} appointmentId - Appointment UUID
 * @param {Object} updateData - Data to update (same structure as createAppointment)
 * @returns {Promise} Promise with the API response
 */
export const updateAppointment = async (appointmentId, updateData) => {
  try {
    const response = await api.put(
      `/Appointments/${appointmentId}`,
      updateData
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Cancel an appointment
 * @param {string} appointmentId - Appointment UUID
 * @returns {Promise} Promise with the API response
 */
export const cancelAppointment = async (appointmentId) => {
  try {
    const response = await api.delete(`/Appointments/${appointmentId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Helper function to format appointment data for API request
 * @param {Object} data - Formatted data from app state
 * @returns {Object} Formatted data in API expected format
 */
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
