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

//lấy block khám của bác sĩ
export const getDoctorSchedule = async (doctorId) => {
  try {
    const response = await api.get(`/MedicalStaffs/${doctorId}/schedules`, {});
    console.log("Fetched Doctor Schedule:", response.data);

    //     {
    //   "value": {
    //     "date": "0001-01-01T00:00:00",
    //     "timeSlots": [
    //       {
    //         "time": "0001-01-01T00:00:00Z",
    //         "isAvailable": false
    //       },
    //       {
    //         "time": "0001-01-01T00:15:00Z",
    //         "isAvailable": false
    //       },
    //       {
    //         "time": "0001-01-01T00:30:00Z",
    //         "isAvailable": false
    //       },
    //       {
    //         "time": "0001-01-01T00:45:00Z",
    //         "isAvailable": false
    //       },
    //       {
    //         "time": "0001-01-01T01:00:00Z",
    //         "isAvailable": false
    //       },
    //       {
    //         "time": "0001-01-01T01:15:00Z",
    //         "isAvailable": false
    //       },
    //       {
    //         "time": "0001-01-01T01:30:00Z",
    //         "isAvailable": false
    //       },
    //       {
    //         "time": "0001-01-01T01:45:00Z",
    //         "isAvailable": false
    //       },
    //       {
    //         "time": "0001-01-01T02:00:00Z",
    //         "isAvailable": false
    //       },
    //       {
    //         "time": "0001-01-01T02:15:00Z",
    //         "isAvailable": false
    //       },
    //       {
    //         "time": "0001-01-01T02:30:00Z",
    //         "isAvailable": false
    //       },
    //       {
    //         "time": "0001-01-01T02:45:00Z",
    //         "isAvailable": false
    //       },
    //       {
    //         "time": "0001-01-01T03:00:00Z",
    //         "isAvailable": false
    //       },
    //       {
    //         "time": "0001-01-01T03:15:00Z",
    //         "isAvailable": false
    //       },
    //       {
    //         "time": "0001-01-01T03:30:00Z",
    //         "isAvailable": false
    //       },
    //       {
    //         "time": "0001-01-01T03:45:00Z",
    //         "isAvailable": false
    //       },
    //       {
    //         "time": "0001-01-01T06:00:00Z",
    //         "isAvailable": false
    //       },
    //       {
    //         "time": "0001-01-01T06:15:00Z",
    //         "isAvailable": false
    //       },
    //       {
    //         "time": "0001-01-01T06:30:00Z",
    //         "isAvailable": false
    //       },
    //       {
    //         "time": "0001-01-01T06:45:00Z",
    //         "isAvailable": false
    //       },
    //       {
    //         "time": "0001-01-01T07:00:00Z",
    //         "isAvailable": false
    //       },
    //       {
    //         "time": "0001-01-01T07:15:00Z",
    //         "isAvailable": false
    //       },
    //       {
    //         "time": "0001-01-01T07:30:00Z",
    //         "isAvailable": false
    //       },
    //       {
    //         "time": "0001-01-01T07:45:00Z",
    //         "isAvailable": false
    //       },
    //       {
    //         "time": "0001-01-01T08:00:00Z",
    //         "isAvailable": false
    //       },
    //       {
    //         "time": "0001-01-01T08:15:00Z",
    //         "isAvailable": false
    //       },
    //       {
    //         "time": "0001-01-01T08:30:00Z",
    //         "isAvailable": false
    //       },
    //       {
    //         "time": "0001-01-01T08:45:00Z",
    //         "isAvailable": false
    //       },
    //       {
    //         "time": "0001-01-01T09:00:00Z",
    //         "isAvailable": false
    //       },
    //       {
    //         "time": "0001-01-01T09:15:00Z",
    //         "isAvailable": false
    //       },
    //       {
    //         "time": "0001-01-01T09:30:00Z",
    //         "isAvailable": false
    //       },
    //       {
    //         "time": "0001-01-01T09:45:00Z",
    //         "isAvailable": false
    //       }
    //     ]
    //   },
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

//láy ngày có lịch khám của bác sĩ
export const getDoctorAvailableDates = async (doctorId) => {
  try {
    const response = await api.get(`/MedicalStaffs/${doctorId}/available-date`);
    console.log("Fetched Doctor Available Dates:", response.data);

    //   {
    //   "value": [
    //     "2025-07-29T00:00:00",
    //     "2025-07-30T00:00:00",
    //     "2025-07-31T00:00:00"
    //   ],
    //   "error": {
    //     "code": "",
    //     "message": ""
    //   },
    //   "isSuccess": true
    // }
    return response.data;
  } catch (error) {
    console.error("Error fetching doctor available dates:", error);
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

//lấy block khám của bác sĩ theo ngày
export const getDoctorScheduleByDate = async (dateTime) => {
  try {
    const response = await api.get(`/WorkingDates/schedules`, {
      params: { dateTime },
    });
    ///WorkingDates/schedules?dateTime=2025-07-29
    //     {
    //   "value": {
    //     "workingDate": "2025-07-29T00:00:00",
    //     "blocks": [
    //       {
    //         "startBlock": "2025-07-29T00:00:00Z",
    //         "endBlock": "2025-07-29T00:15:00Z",
    //         "isAvailable": false
    //       },
    //       {
    //         "startBlock": "2025-07-29T00:15:00Z",
    //         "endBlock": "2025-07-29T00:30:00Z",
    //         "isAvailable": false
    //       },
    //       {
    //         "startBlock": "2025-07-29T00:30:00Z",
    //         "endBlock": "2025-07-29T00:45:00Z",
    //         "isAvailable": false
    //       },
    //       {
    //         "startBlock": "2025-07-29T00:45:00Z",
    //         "endBlock": "2025-07-29T01:00:00Z",
    //         "isAvailable": false
    //       },
    //       {
    //         "startBlock": "2025-07-29T01:00:00Z",
    //         "endBlock": "2025-07-29T01:15:00Z",
    //         "isAvailable": false
    //       },
    //       {
    //         "startBlock": "2025-07-29T01:15:00Z",
    //         "endBlock": "2025-07-29T01:30:00Z",
    //         "isAvailable": false
    //       },
    //       {
    //         "startBlock": "2025-07-29T01:30:00Z",
    //         "endBlock": "2025-07-29T01:45:00Z",
    //         "isAvailable": false
    //       },
    //       {
    //         "startBlock": "2025-07-29T01:45:00Z",
    //         "endBlock": "2025-07-29T02:00:00Z",
    //         "isAvailable": false
    //       },
    //       {
    //         "startBlock": "2025-07-29T02:00:00Z",
    //         "endBlock": "2025-07-29T02:15:00Z",
    //         "isAvailable": false
    //       },
    //       {
    //         "startBlock": "2025-07-29T02:15:00Z",
    //         "endBlock": "2025-07-29T02:30:00Z",
    //         "isAvailable": false
    //       },
    //       {
    //         "startBlock": "2025-07-29T02:30:00Z",
    //         "endBlock": "2025-07-29T02:45:00Z",
    //         "isAvailable": false
    //       },
    //       {
    //         "startBlock": "2025-07-29T02:45:00Z",
    //         "endBlock": "2025-07-29T03:00:00Z",
    //         "isAvailable": false
    //       },
    //       {
    //         "startBlock": "2025-07-29T03:00:00Z",
    //         "endBlock": "2025-07-29T03:15:00Z",
    //         "isAvailable": false
    //       },
    //       {
    //         "startBlock": "2025-07-29T03:15:00Z",
    //         "endBlock": "2025-07-29T03:30:00Z",
    //         "isAvailable": false
    //       },
    //       {
    //         "startBlock": "2025-07-29T03:30:00Z",
    //         "endBlock": "2025-07-29T03:45:00Z",
    //         "isAvailable": false
    //       },
    //       {
    //         "startBlock": "2025-07-29T03:45:00Z",
    //         "endBlock": "2025-07-29T04:00:00Z",
    //         "isAvailable": true
    //       },
    //       {
    //         "startBlock": "2025-07-29T06:00:00Z",
    //         "endBlock": "2025-07-29T06:15:00Z",
    //         "isAvailable": true
    //       },
    //       {
    //         "startBlock": "2025-07-29T06:15:00Z",
    //         "endBlock": "2025-07-29T06:30:00Z",
    //         "isAvailable": true
    //       },
    //       {
    //         "startBlock": "2025-07-29T06:30:00Z",
    //         "endBlock": "2025-07-29T06:45:00Z",
    //         "isAvailable": true
    //       },
    //       {
    //         "startBlock": "2025-07-29T06:45:00Z",
    //         "endBlock": "2025-07-29T07:00:00Z",
    //         "isAvailable": true
    //       },
    //       {
    //         "startBlock": "2025-07-29T07:00:00Z",
    //         "endBlock": "2025-07-29T07:15:00Z",
    //         "isAvailable": true
    //       },
    //       {
    //         "startBlock": "2025-07-29T07:15:00Z",
    //         "endBlock": "2025-07-29T07:30:00Z",
    //         "isAvailable": true
    //       },
    //       {
    //         "startBlock": "2025-07-29T07:30:00Z",
    //         "endBlock": "2025-07-29T07:45:00Z",
    //         "isAvailable": true
    //       },
    //       {
    //         "startBlock": "2025-07-29T07:45:00Z",
    //         "endBlock": "2025-07-29T08:00:00Z",
    //         "isAvailable": true
    //       },
    //       {
    //         "startBlock": "2025-07-29T08:00:00Z",
    //         "endBlock": "2025-07-29T08:15:00Z",
    //         "isAvailable": true
    //       },
    //       {
    //         "startBlock": "2025-07-29T08:15:00Z",
    //         "endBlock": "2025-07-29T08:30:00Z",
    //         "isAvailable": true
    //       },
    //       {
    //         "startBlock": "2025-07-29T08:30:00Z",
    //         "endBlock": "2025-07-29T08:45:00Z",
    //         "isAvailable": true
    //       },
    //       {
    //         "startBlock": "2025-07-29T08:45:00Z",
    //         "endBlock": "2025-07-29T09:00:00Z",
    //         "isAvailable": true
    //       },
    //       {
    //         "startBlock": "2025-07-29T09:00:00Z",
    //         "endBlock": "2025-07-29T09:15:00Z",
    //         "isAvailable": true
    //       },
    //       {
    //         "startBlock": "2025-07-29T09:15:00Z",
    //         "endBlock": "2025-07-29T09:30:00Z",
    //         "isAvailable": true
    //       },
    //       {
    //         "startBlock": "2025-07-29T09:30:00Z",
    //         "endBlock": "2025-07-29T09:45:00Z",
    //         "isAvailable": true
    //       },
    //       {
    //         "startBlock": "2025-07-29T09:45:00Z",
    //         "endBlock": "2025-07-29T10:00:00Z",
    //         "isAvailable": true
    //       }
    //     ]
    //   },
    //   "error": {
    //     "code": "",
    //     "message": ""
    //   },
    //   "isSuccess": true
    // }
    console.log("Fetched Doctor Working Days:", response.data);

    return response.data;
  } catch (error) {
    console.error("Error fetching doctor working days:", error);
    throw error;
  }
};

//lấy bác sĩ theo ngày
export const getDoctorsByDate = async (departmentId, dateTime) => {
  try {
    const response = await api.get(
      `/Departments/${departmentId}/doctor-schedules`,
      {
        params: { bookingDate: dateTime },
      }
    );
    //     {
    //   "value": [
    //     {
    //       "doctorId": "a620ea7a-85e3-4179-90eb-1e64f5f45448",
    //       "doctorName": "Hồ Đức Tùng",
    //       "roomNumber": "A101",
    //       "floor": "1",
    //       "earlyAvaliableTime": "2025-07-29T01:00:00"
    //     },
    //     {
    //       "doctorId": "f0fd3375-e23d-4f56-afe1-beb6a8937765",
    //       "doctorName": "Bác sĩ Số 11",
    //       "roomNumber": "B212",
    //       "floor": "2",
    //       "earlyAvaliableTime": "2025-07-29T01:00:00"
    //     },
    //     {
    //       "doctorId": "01b8dc87-760f-45cf-8a93-3247d26bc0a8",
    //       "doctorName": "Đỗ Lại Sơn",
    //       "roomNumber": "A106",
    //       "floor": "1",
    //       "earlyAvaliableTime": "2025-07-29T01:00:00"
    //     }
    //   ],
    //   "error": {
    //     "code": "",
    //     "message": ""
    //   },
    //   "isSuccess": true
    // }
    console.log("Fetched Doctors by Date:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error fetching doctors by date:", error);
    throw error;
  }
};
