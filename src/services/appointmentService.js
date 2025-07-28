import api from "./api";

export const createAppointment = async (appointmentData) => {
  console.log("Creating appointment with data:", appointmentData.services);

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

//gửi feedback
export const sendAppointmentFeedback = async (code, feedback) => {
  try {
    const response = await api.post(`/Appointments/${code}/feedback`, feedback);
    return response.data;
  } catch (error) {
    console.error("Error sending appointment feedback:", error);
    throw error;
  }
};

//lấy feedback
export const getAppointmentFeedback = async (code) => {
  try {
    const response = await api.get(`/Appointments/${code}/feedback`);
    return response.data;
  } catch (error) {
    console.error("Error fetching appointment feedback:", error);
    throw error;
  }
};

//lấy danh sách khoa
export const getDepartments = async () => {
  try {
    const response = await api.get("/Departments");
    // {
    //   "value": {
    //     "totalCount": 5,
    //     "items": [
    //       {
    //         "id": "ac0edeac-81ce-472c-a3b6-070e2b57e5c2",
    //         "name": "Khoa Sản"
    //       },
    //       {
    //         "id": "ceb375e6-9be6-4cb7-b897-4feecfce9f6a",
    //         "name": "Khoa Tổng quát"
    //       },
    //       {
    //         "id": "f901e4de-8a63-4703-a4f3-87f2de0ea5de",
    //         "name": "Khoa Nhi"
    //       },
    //       {
    //         "id": "746ffe9a-b5c5-4b96-a0ae-a83fa3a94a73",
    //         "name": "Khoa Ngoại"
    //       },
    //       {
    //         "id": "36739aca-0657-44e7-9323-c26f59a65fe0",
    //         "name": "Khoa Nội"
    //       }
    //     ],
    //     "pageIndex": 1,
    //     "pageSize": 10,
    //     "hasPreviousPage": false,
    //     "hasNextPage": false
    //   },
    //   "error": {
    //     "code": "",
    //     "message": ""
    //   },
    //   "isSuccess": true
    // }
    return response.data;
  } catch (error) {
    console.error("Error fetching departments:", error);
    throw error;
  }
};

// Lấy danh sách bác sĩ theo khoa
export const getDoctorsByDepartment = async (departmentId) => {
  try {
    const response = await api.get(`/Departments/${departmentId}/doctors`);
    //{
    //   "value": [
    //     {
    //       "doctorId": "a620ea7a-85e3-4179-90eb-1e64f5f45448",
    //       "fullName": "Hồ Đức Tùng"
    //     },
    //     {
    //       "doctorId": "01b8dc87-760f-45cf-8a93-3247d26bc0a8",
    //       "fullName": "Đỗ Lại Sơn"
    //     }
    //   ],
    //   "error": {
    //     "code": "",
    //     "message": ""
    //   },
    //   "isSuccess": true
    // }
    return response.data;
  } catch (error) {
    console.error("Error fetching doctors by department:", error);
    throw error;
  }
};

//lấy lịch khám của bác sĩ
export const getDoctorSchedule = async (doctorId) => {
  try {
    const response = await api.get(`/MedicalStaffs/${doctorId}/schedules`, {
    });
    console.log("Fetched Doctor Schedule:", response.data);
    
    //    {
    //   "value": [
    //     {
    //       "date": "2025-07-29",
    //       "timeSlots": [
    //         {
    //           "time": "00:00:00",
    //           "isAvailable": false
    //         },
    //         {
    //           "time": "00:15:00",
    //           "isAvailable": false
    //         },
    //         {
    //           "time": "00:30:00",
    //           "isAvailable": false
    //         },
    //         {
    //           "time": "00:45:00",
    //           "isAvailable": false
    //         },
    //         {
    //           "time": "01:00:00",
    //           "isAvailable": true
    //         },
    //         {
    //           "time": "01:15:00",
    //           "isAvailable": true
    //         },
    //         {
    //           "time": "01:30:00",
    //           "isAvailable": true
    //         },
    //         {
    //           "time": "01:45:00",
    //           "isAvailable": true
    //         },
    //         {
    //           "time": "02:00:00",
    //           "isAvailable": true
    //         },
    //         {
    //           "time": "02:15:00",
    //           "isAvailable": true
    //         },
    //         {
    //           "time": "02:30:00",
    //           "isAvailable": true
    //         },
    //         {
    //           "time": "02:45:00",
    //           "isAvailable": true
    //         },
    //         {
    //           "time": "03:00:00",
    //           "isAvailable": true
    //         },
    //         {
    //           "time": "03:15:00",
    //           "isAvailable": true
    //         },
    //         {
    //           "time": "03:30:00",
    //           "isAvailable": true
    //         },
    //         {
    //           "time": "03:45:00",
    //           "isAvailable": true
    //         },
    //         {
    //           "time": "06:00:00",
    //           "isAvailable": true
    //         },
    //         {
    //           "time": "06:15:00",
    //           "isAvailable": true
    //         },
    //         {
    //           "time": "06:30:00",
    //           "isAvailable": true
    //         },
    //         {
    //           "time": "06:45:00",
    //           "isAvailable": true
    //         },
    //         {
    //           "time": "07:00:00",
    //           "isAvailable": true
    //         },
    //         {
    //           "time": "07:15:00",
    //           "isAvailable": true
    //         },
    //         {
    //           "time": "07:30:00",
    //           "isAvailable": true
    //         },
    //         {
    //           "time": "07:45:00",
    //           "isAvailable": true
    //         },
    //         {
    //           "time": "08:00:00",
    //           "isAvailable": true
    //         },
    //         {
    //           "time": "08:15:00",
    //           "isAvailable": true
    //         },
    //         {
    //           "time": "08:30:00",
    //           "isAvailable": true
    //         },
    //         {
    //           "time": "08:45:00",
    //           "isAvailable": true
    //         },
    //         {
    //           "time": "09:00:00",
    //           "isAvailable": true
    //         },
    //         {
    //           "time": "09:15:00",
    //           "isAvailable": true
    //         },
    //         {
    //           "time": "09:30:00",
    //           "isAvailable": true
    //         },
    //         {
    //           "time": "09:45:00",
    //           "isAvailable": true
    //         }
    //       ]
    //     },
    //     {
    //       "date": "2025-07-30",
    //       "timeSlots": [
    //         {
    //           "time": "00:00:00",
    //           "isAvailable": true
    //         },
    //         {
    //           "time": "00:15:00",
    //           "isAvailable": true
    //         },
    //         {
    //           "time": "00:30:00",
    //           "isAvailable": true
    //         },
    //         {
    //           "time": "00:45:00",
    //           "isAvailable": true
    //         },
    //         {
    //           "time": "01:00:00",
    //           "isAvailable": true
    //         },
    //         {
    //           "time": "01:15:00",
    //           "isAvailable": true
    //         },
    //         {
    //           "time": "01:30:00",
    //           "isAvailable": true
    //         },
    //         {
    //           "time": "01:45:00",
    //           "isAvailable": true
    //         },
    //         {
    //           "time": "02:00:00",
    //           "isAvailable": true
    //         },
    //         {
    //           "time": "02:15:00",
    //           "isAvailable": true
    //         },
    //         {
    //           "time": "02:30:00",
    //           "isAvailable": true
    //         },
    //         {
    //           "time": "02:45:00",
    //           "isAvailable": true
    //         },
    //         {
    //           "time": "03:00:00",
    //           "isAvailable": true
    //         },
    //         {
    //           "time": "03:15:00",
    //           "isAvailable": true
    //         },
    //         {
    //           "time": "03:30:00",
    //           "isAvailable": true
    //         },
    //         {
    //           "time": "03:45:00",
    //           "isAvailable": true
    //         },
    //         {
    //           "time": "06:00:00",
    //           "isAvailable": true
    //         },
    //         {
    //           "time": "06:15:00",
    //           "isAvailable": true
    //         },
    //         {
    //           "time": "06:30:00",
    //           "isAvailable": true
    //         },
    //         {
    //           "time": "06:45:00",
    //           "isAvailable": true
    //         },
    //         {
    //           "time": "07:00:00",
    //           "isAvailable": true
    //         },
    //         {
    //           "time": "07:15:00",
    //           "isAvailable": true
    //         },
    //         {
    //           "time": "07:30:00",
    //           "isAvailable": true
    //         },
    //         {
    //           "time": "07:45:00",
    //           "isAvailable": true
    //         },
    //         {
    //           "time": "08:00:00",
    //           "isAvailable": true
    //         },
    //         {
    //           "time": "08:15:00",
    //           "isAvailable": true
    //         },
    //         {
    //           "time": "08:30:00",
    //           "isAvailable": true
    //         },
    //         {
    //           "time": "08:45:00",
    //           "isAvailable": true
    //         },
    //         {
    //           "time": "09:00:00",
    //           "isAvailable": true
    //         },
    //         {
    //           "time": "09:15:00",
    //           "isAvailable": true
    //         },
    //         {
    //           "time": "09:30:00",
    //           "isAvailable": true
    //         },
    //         {
    //           "time": "09:45:00",
    //           "isAvailable": true
    //         }
    //       ]
    //     },
    //     {
    //       "date": "2025-07-31",
    //       "timeSlots": [
    //         {
    //           "time": "00:00:00",
    //           "isAvailable": true
    //         },
    //         {
    //           "time": "00:15:00",
    //           "isAvailable": true
    //         },
    //         {
    //           "time": "00:30:00",
    //           "isAvailable": true
    //         },
    //         {
    //           "time": "00:45:00",
    //           "isAvailable": true
    //         },
    //         {
    //           "time": "01:00:00",
    //           "isAvailable": true
    //         },
    //         {
    //           "time": "01:15:00",
    //           "isAvailable": true
    //         },
    //         {
    //           "time": "01:30:00",
    //           "isAvailable": true
    //         },
    //         {
    //           "time": "01:45:00",
    //           "isAvailable": true
    //         },
    //         {
    //           "time": "02:00:00",
    //           "isAvailable": true
    //         },
    //         {
    //           "time": "02:15:00",
    //           "isAvailable": true
    //         },
    //         {
    //           "time": "02:30:00",
    //           "isAvailable": true
    //         },
    //         {
    //           "time": "02:45:00",
    //           "isAvailable": true
    //         },
    //         {
    //           "time": "03:00:00",
    //           "isAvailable": true
    //         },
    //         {
    //           "time": "03:15:00",
    //           "isAvailable": true
    //         },
    //         {
    //           "time": "03:30:00",
    //           "isAvailable": true
    //         },
    //         {
    //           "time": "03:45:00",
    //           "isAvailable": true
    //         },
    //         {
    //           "time": "06:00:00",
    //           "isAvailable": true
    //         },
    //         {
    //           "time": "06:15:00",
    //           "isAvailable": true
    //         },
    //         {
    //           "time": "06:30:00",
    //           "isAvailable": true
    //         },
    //         {
    //           "time": "06:45:00",
    //           "isAvailable": true
    //         },
    //         {
    //           "time": "07:00:00",
    //           "isAvailable": true
    //         },
    //         {
    //           "time": "07:15:00",
    //           "isAvailable": true
    //         },
    //         {
    //           "time": "07:30:00",
    //           "isAvailable": true
    //         },
    //         {
    //           "time": "07:45:00",
    //           "isAvailable": true
    //         },
    //         {
    //           "time": "08:00:00",
    //           "isAvailable": true
    //         },
    //         {
    //           "time": "08:15:00",
    //           "isAvailable": true
    //         },
    //         {
    //           "time": "08:30:00",
    //           "isAvailable": true
    //         },
    //         {
    //           "time": "08:45:00",
    //           "isAvailable": true
    //         },
    //         {
    //           "time": "09:00:00",
    //           "isAvailable": true
    //         },
    //         {
    //           "time": "09:15:00",
    //           "isAvailable": true
    //         },
    //         {
    //           "time": "09:30:00",
    //           "isAvailable": true
    //         },
    //         {
    //           "time": "09:45:00",
    //           "isAvailable": true
    //         }
    //       ]
    //     }
    //   ],
    //   "error": {
    //     "code": "",
    //     "message": ""
    //   },
    //   "isSuccess": true
    // }
    return response.data;
  } catch (error) {
    console.error("Error fetching doctor schedule:", error);
    throw error;
  }
};

//đặt lịch khám
export const bookAppointment = async (appointmentData) => {
  try {
    const response = await api.post(`/Appointments/doctor`, appointmentData);
    //     {
    //   "patientId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    //   "bookType": "App",
    //   "bookingDate": "2025-07-27T13:00:40.861Z",
    //   "currentMedication": "string",
    //   "medicalHistory": "string",
    //   "allergyDetails": "string",
    //   "symptom": "string",
    //   "smokingStatus": "No",
    //   "patientInfomation": {
    //     "firstName": "string",
    //     "lastName": "string",
    //     "dateOfBirth": "2025-07-27T13:00:40.861Z",
    //     "gender": "Male",
    //     "phoneNumber": "string",
    //     "email": "string",
    //     "address": {
    //       "street": "string",
    //       "ward": "string",
    //       "district": "string",
    //       "province": "string",
    //       "street_2": "string",
    //       "ward_2": "string",
    //       "district_2": "string",
    //       "province_2": "string"
    //     },
    //     "identityNumber": "string",
    //     "healthInsuranceCode": "string"
    //   },
    //   "doctorId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    //   "serviceTypeId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    //   "serviceId": "3fa85f64-5717-4562-b3fc-2c963f66afa6"
    // }
    console.log("Appointment booked successfully:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error booking appointment by doctor:", error);
    throw error;
  }
};
