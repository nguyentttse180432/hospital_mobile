import api from "./api";

//lấy danh sách checkup records
export const getCheckupRecords = async () => {
  try {
    const response = await api.get("/checkupRecords");
    // {
    //     "value": {
    //       "totalCount": 2,
    //       "items": [
    //         {
    //           "id": "339b60c1-5a0a-43b4-10ae-08ddb48032e6",
    //           "code": "6320948",
    //           "status": "Paid",
    //           "bookType": "Web",
    //           "bookingDate": "2025-06-27T00:00:00Z",
    //           "fullname": "Phạm Nguyễn Như Quỳnh",
    //           "numericalOrder": 0
    //         },
    //         {
    //           "id": "ca031ebb-ee56-47d9-5c27-08ddb5565259",
    //           "code": "6030218",
    //           "status": "Paid",
    //           "bookType": "App",
    //           "bookingDate": "2025-06-27T08:36:07.523Z",
    //           "fullname": "Đoàn Mạnh Hùng",
    //           "numericalOrder": 0
    //         }
    //       ],
    //       "pageIndex": 1,
    //       "pageSize": 50,
    //       "hasPreviousPage": false,
    //       "hasNextPage": false
    //     },
    //     "error": {
    //       "code": "",
    //       "message": ""
    //     },
    //     "isSuccess": true
    //   }
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

    const response = await api.get(`/checkupRecords?${params.toString()}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching checkup records by date and status:", error);
    throw error;
  }
};

//lấy chi tiết checkup record
export const getCheckupRecordDetail = async (code) => {
  try {
    const response = await api.get(`/checkupRecords/${code}`);
    // {
    //     "value": {
    //       "id": "339b60c1-5a0a-43b4-10ae-08ddb48032e6",
    //       "code": "6320948",
    //       "bookingDate": "2025-06-27T00:00:00Z",
    //       "numericalOrder": 0,
    //       "estimatedStartTime": "0001-01-01T00:00:00",
    //       "estimatedDate": "00:00:00",
    //       "clinicalSymptom": null,
    //       "patientSympton": "",
    //       "diagnosis": null,
    //       "doctorAdvice": null,
    //       "checkinTime": "0001-01-01T00:00:00",
    //       "isReExam": false,
    //       "hasReExam": false,
    //       "reExamCode": false,
    //       "reExamNote": null,
    //       "status": "Paid",
    //       "bookType": "Web",
    //       "currentMedication": "",
    //       "medicalHistory": "",
    //       "allergyDetails": "",
    //       "smokingStatus": "No"
    //     },
    //     "error": {
    //       "code": "",
    //       "message": ""
    //     },
    //     "isSuccess": true
    //   }
    return response.data;
  } catch (error) {
    console.error("Error fetching checkup record detail:", error);
    throw error;
  }
};

//lấy danh sách services trong checkup record
export const getCheckupRecordServices = async (code) => {
  try {
    const response = await api.get(`/checkupRecords/${code}/services`);
    // {
    //     "value": [
    //       {
    //         "id": "d7041d8e-087e-471d-a511-b620e69f611a",
    //         "serviceCode": "MS021     ",
    //         "serviceNote": null,
    //         "serviceName": "Đo sinh hiệu",
    //         "packageName": null,
    //         "testRecordCode": null,
    //         "testRecordStatus": null,
    //         "vitalSignStatus": "Pending",
    //         "checkupRecordStatus": null,
    //         "roomNumber": "V001",
    //         "servicePrice": 0
    //       },
    //       {
    //         "id": "bf44b53b-e285-4fe4-ace5-08ddb4803336",
    //         "serviceCode": "MS001     ",
    //         "serviceNote": null,
    //         "serviceName": "Khám lâm sàng tổng quát",
    //         "packageName": "Khám tổng quát cơ bản - Nữ có gia đình",
    //         "testRecordCode": "9105291",
    //         "testRecordStatus": "Paid",
    //         "vitalSignStatus": null,
    //         "checkupRecordStatus": "Paid",
    //         "roomNumber": "A101",
    //         "servicePrice": 200000
    //       },
    //       {
    //         "id": "21dc352f-b97f-49a0-ace6-08ddb4803336",
    //         "serviceCode": "MS003     ",
    //         "serviceNote": "Áp dụng cho khám định kỳ",
    //         "serviceName": "Xét nghiệm máu thường quy",
    //         "packageName": "Khám tổng quát cơ bản - Nữ có gia đình",
    //         "testRecordCode": "0833943",
    //         "testRecordStatus": "Paid",
    //         "vitalSignStatus": null,
    //         "checkupRecordStatus": "Paid",
    //         "roomNumber": "A103",
    //         "servicePrice": 200000
    //       },
    //       {
    //         "id": "158c71dc-a607-4dc9-ace7-08ddb4803336",
    //         "serviceCode": "MS008     ",
    //         "serviceNote": "Kiểm tra cholesterol và triglyceride",
    //         "serviceName": "Xét nghiệm mỡ máu",
    //         "packageName": "Khám tổng quát cơ bản - Nữ có gia đình",
    //         "testRecordCode": "7729568",
    //         "testRecordStatus": "Paid",
    //         "vitalSignStatus": null,
    //         "checkupRecordStatus": "Paid",
    //         "roomNumber": "A103",
    //         "servicePrice": 200000
    //       },
    //       {
    //         "id": "97e51a35-f581-48be-ace8-08ddb4803336",
    //         "serviceCode": "MS005     ",
    //         "serviceNote": "Nên làm hàng năm nếu dùng thuốc lâu dài",
    //         "serviceName": "Xét nghiệm chức năng gan",
    //         "packageName": "Khám tổng quát cơ bản - Nữ có gia đình",
    //         "testRecordCode": "4143466",
    //         "testRecordStatus": "Paid",
    //         "vitalSignStatus": null,
    //         "checkupRecordStatus": "Paid",
    //         "roomNumber": "A103",
    //         "servicePrice": 200000
    //       },
    //       {
    //         "id": "8a1396ae-ec6f-4811-ace9-08ddb4803336",
    //         "serviceCode": "MS007     ",
    //         "serviceNote": "Phát hiện viêm tiết niệu, đạm niệu",
    //         "serviceName": "Xét nghiệm nước tiểu",
    //         "packageName": "Khám tổng quát cơ bản - Nữ có gia đình",
    //         "testRecordCode": "0996487",
    //         "testRecordStatus": "Paid",
    //         "vitalSignStatus": null,
    //         "checkupRecordStatus": "Paid",
    //         "roomNumber": "A103",
    //         "servicePrice": 200000
    //       },
    //       {
    //         "id": "0c3b250d-e0e8-4e15-acea-08ddb4803336",
    //         "serviceCode": "MS009     ",
    //         "serviceNote": "Kiểm tra viêm phổi, tràn dịch, lao phổi",
    //         "serviceName": "Chụp X-quang ngực",
    //         "packageName": "Khám tổng quát cơ bản - Nữ có gia đình",
    //         "testRecordCode": "8157834",
    //         "testRecordStatus": "Paid",
    //         "vitalSignStatus": null,
    //         "checkupRecordStatus": "Paid",
    //         "roomNumber": "A107",
    //         "servicePrice": 300000
    //       },
    //       {
    //         "id": "9bf7a0fc-20c0-4156-90ec-9a64b14d6e5b",
    //         "serviceCode": "MS010     ",
    //         "serviceNote": null,
    //         "serviceName": "Đánh giá tổng quát",
    //         "packageName": "Khám tổng quát cơ bản - Nữ có gia đình",
    //         "testRecordCode": null,
    //         "testRecordStatus": null,
    //         "vitalSignStatus": null,
    //         "checkupRecordStatus": "Paid",
    //         "roomNumber": "B212",
    //         "servicePrice": 200000
    //       }
    //     ],
    //     "error": {
    //       "code": "",
    //       "message": ""
    //     },
    //     "isSuccess": true
    //   }
    // {
    //     "value": [
    //       {
    //         "id": "d7041d8e-087e-471d-a511-b620e69f611a",
    //         "serviceCode": "MS021     ",
    //         "serviceNote": null,
    //         "serviceName": "Đo sinh hiệu",
    //         "packageName": null,
    //         "testRecordCode": null,
    //         "testRecordStatus": null,
    //         "vitalSignStatus": "Completed",
    //         "checkupRecordStatus": null,
    //         "roomNumber": "V001",
    //         "servicePrice": 0
    //       },
    //       {
    //         "id": "22a5ae0b-3cd6-4d01-8b42-08ddb51e4a84",
    //         "serviceCode": "MS018     ",
    //         "serviceNote": "Kiểm tra độ cận, loạn, viễn thị định kỳ",
    //         "serviceName": "Đo thị lực",
    //         "packageName": "Khám chuyên sâu tổng quát",
    //         "testRecordCode": "6826008",
    //         "testRecordStatus": "Finished",
    //         "vitalSignStatus": null,
    //         "checkupRecordStatus": "Completed",
    //         "roomNumber": "A110",
    //         "servicePrice": 290000
    //       },
    //       {
    //         "id": "d2546aa7-50bf-4f03-8b43-08ddb51e4a84",
    //         "serviceCode": "MS003     ",
    //         "serviceNote": "Áp dụng cho khám định kỳ",
    //         "serviceName": "Xét nghiệm máu thường quy",
    //         "packageName": "Khám chuyên sâu tổng quát",
    //         "testRecordCode": "7899824",
    //         "testRecordStatus": "Finished",
    //         "vitalSignStatus": null,
    //         "checkupRecordStatus": "Completed",
    //         "roomNumber": "A103",
    //         "servicePrice": 200000
    //       },
    //       {
    //         "id": "ea38cf30-3b86-4dc9-8b44-08ddb51e4a84",
    //         "serviceCode": "MS007     ",
    //         "serviceNote": "Phát hiện viêm tiết niệu, đạm niệu",
    //         "serviceName": "Xét nghiệm nước tiểu",
    //         "packageName": "Khám chuyên sâu tổng quát",
    //         "testRecordCode": "1127380",
    //         "testRecordStatus": "Finished",
    //         "vitalSignStatus": null,
    //         "checkupRecordStatus": "Completed",
    //         "roomNumber": "A103",
    //         "servicePrice": 200000
    //       },
    //       {
    //         "id": "124ee742-4683-4808-8b45-08ddb51e4a84",
    //         "serviceCode": "MS009     ",
    //         "serviceNote": "Kiểm tra viêm phổi, tràn dịch, lao phổi",
    //         "serviceName": "Chụp X-quang ngực",
    //         "packageName": "Khám chuyên sâu tổng quát",
    //         "testRecordCode": "2316562",
    //         "testRecordStatus": "Finished",
    //         "vitalSignStatus": null,
    //         "checkupRecordStatus": "Completed",
    //         "roomNumber": "A107",
    //         "servicePrice": 300000
    //       },
    //       {
    //         "id": "9bf7a0fc-20c0-4156-90ec-9a64b14d6e5b",
    //         "serviceCode": "MS010     ",
    //         "serviceNote": null,
    //         "serviceName": "Đánh giá tổng quát",
    //         "packageName": "Khám chuyên sâu tổng quát",
    //         "testRecordCode": null,
    //         "testRecordStatus": null,
    //         "vitalSignStatus": null,
    //         "checkupRecordStatus": "Completed",
    //         "roomNumber": "B212",
    //         "servicePrice": 200000
    //       }
    //     ],
    //     "error": {
    //       "code": "",
    //       "message": ""
    //     },
    //     "isSuccess": true
    //   }
    return response.data;
  } catch (error) {
    console.error("Error fetching checkup record services:", error);
    throw error;
  }
};
