import api from "./api";

export const getPaymentUrl = async (code) => {
  try {
    const response = await api.get(
      `/Payments/${code}?vnpayType=Appointment&paymentMethod=VnPay&returnUrlType=App`
    );
    // "value": "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html?vnp_Amount=159000000&vnp_Command=pay&vnp_CreateDate=20250710114717&vnp_CurrCode=VND&vnp_IpAddr=127.0.0.1&vnp_Locale=vn&vmp_OrderInf
    // o=Thanh+toan+cho+don+hang%3A+0463597&vnp_OrderType=250000&vnp_ReturnUrl=com.hospital.app%3A%2F%2Fpayment%2Fcallback&vnp_TmnCode=1AUU6II0&vnp_TxnRef=0463597&vnp_Version=2.1.0&vnp_SecureHash=630b3
    // 415df26e30040906c93230bfadb6fc9769f5c1e5007d5e402e8f49144cbc94728c73f64c6e3510575af504709a2d321b2b69a6fa9057f9f278b2308eb22"
    // "error": {
    // 'code": "".
    // "message": ""
    // },
    // "isSuccess": true
    return response.data;
  } catch (error) {
    console.error("Error fetching payment URL:", error);
    throw error;
  }
};

export const getPaymentResult = async (params) => {
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
