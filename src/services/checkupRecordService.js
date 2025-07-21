import api from "./api";

//lấy danh sách checkup records
export const getCheckupRecords = async () => {
  try {
    const response = await api.get("/CheckupRecords");
    return response.data;
  } catch (error) {
    console.error("Error fetching checkup records:", error);
    throw error;
  }
};

//lấy danh sách checkup records với filter theo ngày và status
export const getCheckupRecordsByDateAndStatus = async (
  dateBooking,
  status,
  pageSize = 50
) => {
  try {
    const params = new URLSearchParams({
      PageSize: pageSize.toString(),
      DateBooking: dateBooking,
      Status: status,
    });

    const response = await api.get(`/CheckupRecords?${params.toString()}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching checkup records by date and status:", error);
    throw error;
  }
};

//lấy chi tiết checkup record
export const getCheckupRecordDetail = async (code) => {
  try {
    const response = await api.get(`/CheckupRecords/${code}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching checkup record detail:", error);
    throw error;
  }
};

//lấy danh sách services trong checkup record
export const getCheckupRecordServices = async (code) => {
  try {
    const response = await api.get(`/CheckupRecords/${code}/services`);
    return response.data;
  } catch (error) {
    console.error("Error fetching checkup record services:", error);
    throw error;
  }
};

//lấy kết quả checkup record
export const getCheckupRecordResults = async (code) => {
  try {
    const response = await api.get(`/CheckupRecords/${code}/test-records`);
    return response.data;
  } catch (error) {
    console.error("Error fetching checkup record results:", error);
    throw error;
  }
};

//lấy kết quả từng service trong checkup record
export const getCheckupRecordServiceResults = async (serviceId) => {
  try {
    const response = await api.get(`/TestRecords/${serviceId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching checkup record service results:", error);
    throw error;
  }
};

//lấy kết quả đo sinh hiệu
export const getVitalSignsResults = async (serviceId) => {
  try {
    const response = await api.get(`/VitalSigns/${serviceId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching vital signs results:", error);
    throw error;
  }
};

//lấy thuốc
export const getMedicationsByCheckupRecord = async (code) => {
  try {
    const response = await api.get(`/CheckupRecords/${code}/prescriptions`);
    return response.data;
  } catch (error) {
    console.error("Error fetching medications by checkup record:", error);
    throw error;
  }
};

//lấy đo sinh hiệu
export const getVitalSignsByCheckupRecord = async (code) => {
  try {
    const response = await api.get(`/CheckupRecords/${code}/vital-signs`);
    return response.data;
  } catch (error) {
    console.error("Error fetching vital signs by checkup record:", error);
    throw error;
  }
};  