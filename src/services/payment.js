import api from "./api";

export const getPaymentAppointmentUrl = async (code) => {
  try {
    const response = await api.get(
      `/Payments/${code}?paymentType=Appointment&paymentMethod=VnPay&returnUrlType=App`
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching payment URL:", error);
    throw error;
  }
};

export const getPaymentAppointmentResult = async (params) => {
  console.log("Payment result params:", params);

  try {
    // params là object chứa các trường như ảnh swagger
    const response = await api.get(
      "/Payments/vnpay-result?paymentType=Appointment&vnp_SecureHashType=",
      { params }
    );

    return response.data;
  } catch (error) {
    console.error("Error fetching payment result:", error);
    throw error;
  }
};

export const getPaymentPrescriptionUrl = async (code) => {
  try {
    const response = await api.get(
      `/Payments/${code}?paymentType=Prescription&paymentMethod=VnPay&returnUrlType=App`
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching payment URL:", error);
    throw error;
  }
};

export const getPaymentPrescriptionResult = async (params) => {
  console.log("Payment result params:", params);

  try {
    // params là object chứa các trường như ảnh swagger
    const response = await api.get(
      "/Payments/vnpay-result?paymentType=Prescription&vnp_SecureHashType=",
      { params }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching payment result:", error);
    throw error;
  }
};
