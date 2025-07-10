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
    // {
    //   "value": {
    //     "totalCount": 6,
    //     "items": [
    //       {
    //         "id": "24d7a4da-e76c-4063-f331-08ddbb962f24",
    //         "serviceCode": "MS018     ",
    //         "serviceNote": "Kiểm tra độ cận, loạn, viễn thị định kỳ",
    //         "serviceName": "Đo thị lực",
    //         "packageName": "Khám chuyên sâu tổng quát",
    //         "servicePrice": 290000,
    //         "testRecordStatus": "Finished",
    //         "roomNumber": "A110",
    //         "estimasedTime": "09:20:00",
    //         "numericalOrder": 43,
    //         "resultDescription": "đã làm xong",
    //         "failReason": null,
    //         "testResults": [],
    //         "stepServiceTrackingResponses": [
    //           {
    //             "id": "977e59f2-3502-4ff4-e4bf-08ddbb962f26",
    //             "stepName": "Kiểm tra thị lực bằng bảng chữ cái",
    //             "isCompleted": true,
    //             "stepServiceValueTrackings": [
    //               {
    //                 "id": "c6154339-6238-4bb2-d593-08ddbb962f2b",
    //                 "name": "Mắt trái",
    //                 "note": "",
    //                 "value": "9",
    //                 "maxValue": "10"
    //               },
    //               {
    //                 "id": "339e83d7-0e31-4a90-d594-08ddbb962f2b",
    //                 "name": "Mắt phải",
    //                 "note": "",
    //                 "value": "9",
    //                 "maxValue": "10"
    //               }
    //             ]
    //           },
    //           {
    //             "id": "a4232a3a-ac2b-4de9-e4c0-08ddbb962f26",
    //             "stepName": "Đo độ cận/loạn/viễn bằng máy",
    //             "isCompleted": true,
    //             "stepServiceValueTrackings": [
    //               {
    //                 "id": "4467af15-287e-4668-d595-08ddbb962f2b",
    //                 "name": "PD ",
    //                 "note": "",
    //                 "value": "70",
    //                 "maxValue": "80"
    //               },
    //               {
    //                 "id": "560ee46f-ced4-4a41-d596-08ddbb962f2b",
    //                 "name": "CYL",
    //                 "note": "",
    //                 "value": "7",
    //                 "maxValue": "8.00"
    //               },
    //               {
    //                 "id": "21c3f042-c424-407b-d597-08ddbb962f2b",
    //                 "name": "OS / L",
    //                 "note": "",
    //                 "value": "1",
    //                 "maxValue": "1"
    //               },
    //               {
    //                 "id": "3d7d3503-172a-4fb3-d598-08ddbb962f2b",
    //                 "name": "OD / R",
    //                 "note": "",
    //                 "value": "5",
    //                 "maxValue": "6"
    //               },
    //               {
    //                 "id": "56a99d9c-5430-4695-d599-08ddbb962f2b",
    //                 "name": "SPH",
    //                 "note": "",
    //                 "value": "20",
    //                 "maxValue": "20.00"
    //               },
    //               {
    //                 "id": "ba8f688f-406d-4fa6-d59a-08ddbb962f2b",
    //                 "name": "Axis",
    //                 "note": "",
    //                 "value": "180",
    //                 "maxValue": "180"
    //               },
    //               {
    //                 "id": "f37dc870-9572-41bd-d59b-08ddbb962f2b",
    //                 "name": "ADD",
    //                 "note": "",
    //                 "value": "3.5",
    //                 "maxValue": "3.50"
    //               }
    //             ]
    //           }
    //         ]
    //       },
    //       {
    //         "id": "fc7da0da-3289-450e-f332-08ddbb962f24",
    //         "serviceCode": "MS003     ",
    //         "serviceNote": "Áp dụng cho khám định kỳ",
    //         "serviceName": "Xét nghiệm máu thường quy",
    //         "packageName": "Khám chuyên sâu tổng quát",
    //         "servicePrice": 200000,
    //         "testRecordStatus": "Finished",
    //         "roomNumber": "A103",
    //         "estimasedTime": "09:25:00",
    //         "numericalOrder": 43,
    //         "resultDescription": "ádfsadf",
    //         "failReason": null,
    //         "testResults": [
    //           {
    //             "id": "4f8205fe-86c7-40ca-1628-08ddbb96fb4a",
    //             "resultFieldLink": "uploads/166918b2-acf3-4434-b43f-23ff2d7b4d78_normal.csv"
    //           },
    //           {
    //             "id": "67f45857-1917-444f-1629-08ddbb96fb4a",
    //             "resultFieldLink": "uploads/c33f2475-5c60-4e94-b1ea-19386bad2fe2_Phieu-kham-ma-kham-8432860.pdf"
    //           }
    //         ],
    //         "stepServiceTrackingResponses": [
    //           {
    //             "id": "d6ce63b7-6a1f-48fd-e4c1-08ddbb962f26",
    //             "stepName": "Lấy máu xét nghiệm máu thường quy",
    //             "isCompleted": true,
    //             "stepServiceValueTrackings": []
    //           }
    //         ]
    //       },
    //       {
    //         "id": "0e112ff7-2434-469c-f333-08ddbb962f24",
    //         "serviceCode": "MS007     ",
    //         "serviceNote": "Phát hiện viêm tiết niệu, đạm niệu",
    //         "serviceName": "Xét nghiệm nước tiểu",
    //         "packageName": "Khám chuyên sâu tổng quát",
    //         "servicePrice": 200000,
    //         "testRecordStatus": "Finished",
    //         "roomNumber": "A106",
    //         "estimasedTime": "09:25:00",
    //         "numericalOrder": 43,
    //         "resultDescription": "sadasdf",
    //         "failReason": null,
    //         "testResults": [
    //           {
    //             "id": "5aef7af9-eae9-4d8e-162a-08ddbb96fb4a",
    //             "resultFieldLink": "uploads/301412d5-77ca-4e99-97f8-3bcf4e2090f7_Toa-thuoc-7648652.pdf"
    //           }
    //         ],
    //         "stepServiceTrackingResponses": [
    //           {
    //             "id": "737ebf39-068d-4381-e4c2-08ddbb962f26",
    //             "stepName": "Phân tích mẫu nước tiểu",
    //             "isCompleted": true,
    //             "stepServiceValueTrackings": []
    //           },
    //           {
    //             "id": "620e6a6c-9c95-422a-e4c3-08ddbb962f26",
    //             "stepName": "Thu thập mẫu nước tiểu",
    //             "isCompleted": true,
    //             "stepServiceValueTrackings": []
    //           }
    //         ]
    //       },
    //       {
    //         "id": "43050938-7d84-46d9-f334-08ddbb962f24",
    //         "serviceCode": "MS009     ",
    //         "serviceNote": "Kiểm tra viêm phổi, tràn dịch, lao phổi",
    //         "serviceName": "Chụp X-quang ngực",
    //         "packageName": "Khám chuyên sâu tổng quát",
    //         "servicePrice": 300000,
    //         "testRecordStatus": "Finished",
    //         "roomNumber": "A107",
    //         "estimasedTime": "09:25:00",
    //         "numericalOrder": 43,
    //         "resultDescription": "ấdfafds",
    //         "failReason": null,
    //         "testResults": [
    //           {
    //             "id": "a637f5f7-5f32-4781-162b-08ddbb96fb4a",
    //             "resultFieldLink": "uploads/7f4fd9bf-7dbc-4cd0-bede-dcb6c84b1a51_z6774064874553_7ceed5ab4640497137ba40bb447bc884.jpg"
    //           }
    //         ],
    //         "stepServiceTrackingResponses": [
    //           {
    //             "id": "d2b0b677-2d84-4cf6-e4c4-08ddbb962f26",
    //             "stepName": "Chụp X-quang ngực",
    //             "isCompleted": true,
    //             "stepServiceValueTrackings": []
    //           },
    //           {
    //             "id": "3497e6da-4796-429d-e4c5-08ddbb962f26",
    //             "stepName": "Chụp X-quang",
    //             "isCompleted": true,
    //             "stepServiceValueTrackings": []
    //           }
    //         ]
    //       },
    //       {
    //         "id": "d16b587b-8097-45cb-f335-08ddbb962f24",
    //         "serviceCode": "MS006     ",
    //         "serviceNote": "Theo dõi bệnh nhân cao huyết áp",
    //         "serviceName": "Xét nghiệm chức năng thận",
    //         "packageName": null,
    //         "servicePrice": 200000,
    //         "testRecordStatus": "Finished",
    //         "roomNumber": "B204",
    //         "estimasedTime": "09:25:00",
    //         "numericalOrder": 43,
    //         "resultDescription": "ádfsaf",
    //         "failReason": null,
    //         "testResults": [
    //           {
    //             "id": "53eeb0f6-4904-40f8-162c-08ddbb96fb4a",
    //             "resultFieldLink": "uploads/10537fe6-72b1-4b31-b0b2-6d1665cfd173_normal.csv"
    //           },
    //           {
    //             "id": "b9f12c50-4a8e-4d7c-162d-08ddbb96fb4a",
    //             "resultFieldLink": "uploads/1b815344-1454-44bc-aba2-62650c658543_z6774064804546_df58b0f2a6b3aadd81acb58c240aca11.jpg"
    //           }
    //         ],
    //         "stepServiceTrackingResponses": [
    //           {
    //             "id": "d99946d6-493e-489b-e4c6-08ddbb962f26",
    //             "stepName": "Phân tích mẫu máu (Ure, Creatinin, eGFR)",
    //             "isCompleted": true,
    //             "stepServiceValueTrackings": []
    //           },
    //           {
    //             "id": "53174a6b-721f-4037-e4c7-08ddbb962f26",
    //             "stepName": "Lấy máu xét nghiệm chức năng thận",
    //             "isCompleted": true,
    //             "stepServiceValueTrackings": []
    //           }
    //         ]
    //       },
    //       {
    //         "id": "c328fa6c-a406-4124-f336-08ddbb962f24",
    //         "serviceCode": "MS005     ",
    //         "serviceNote": "Nên làm hàng năm nếu dùng thuốc lâu dài",
    //         "serviceName": "Xét nghiệm chức năng gan",
    //         "packageName": null,
    //         "servicePrice": 200000,
    //         "testRecordStatus": "Finished",
    //         "roomNumber": "B204",
    //         "estimasedTime": "09:25:00",
    //         "numericalOrder": 43,
    //         "resultDescription": "ádfdsaf",
    //         "failReason": null,
    //         "testResults": [
    //           {
    //             "id": "517b1451-6a41-4547-162e-08ddbb96fb4a",
    //             "resultFieldLink": "uploads/4f4e8022-21e4-41cf-b172-1747447570ef_Toa-thuoc-ma-kham-6661881.pdf"
    //           }
    //         ],
    //         "stepServiceTrackingResponses": [
    //           {
    //             "id": "d9de5c32-cce4-4c3c-e4c8-08ddbb962f26",
    //             "stepName": "Phân tích mẫu máu (AST, ALT, GGT, Bilirubin)",
    //             "isCompleted": true,
    //             "stepServiceValueTrackings": []
    //           },
    //           {
    //             "id": "0185a0e6-419c-4438-e4c9-08ddbb962f26",
    //             "stepName": "Lấy máu xét nghiệm chức năng gan",
    //             "isCompleted": true,
    //             "stepServiceValueTrackings": []
    //           }
    //         ]
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
    console.error("Error fetching checkup record results:", error);
    throw error;
  }
};

//lấy kết quả từng service trong checkup record
export const getCheckupRecordServiceResults = async (serviceId) => {
  try {
    const response = await api.get(`/TestRecords/${serviceId}`);
    // {
    //   "value": {
    //     "id": "24d7a4da-e76c-4063-f331-08ddbb962f24",
    //     "serviceCode": "MS018     ",
    //     "serviceNote": "Kiểm tra độ cận, loạn, viễn thị định kỳ",
    //     "serviceName": "Đo thị lực",
    //     "packageName": null,
    //     "servicePrice": 0,
    //     "testRecordStatus": "Finished",
    //     "roomNumber": null,
    //     "estimasedTime": "09:20:00",
    //     "numericalOrder": 43,
    //     "resultDescription": "đã làm xong",
    //     "failReason": null,
    //     "testResults": [],
    //     "stepServiceTrackingResponses": [
    //       {
    //         "id": "977e59f2-3502-4ff4-e4bf-08ddbb962f26",
    //         "stepName": "Kiểm tra thị lực bằng bảng chữ cái",
    //         "isCompleted": true,
    //         "stepServiceValueTrackings": [
    //           {
    //             "id": "c6154339-6238-4bb2-d593-08ddbb962f2b",
    //             "name": "Mắt trái",
    //             "note": "",
    //             "value": "9",
    //             "maxValue": "10"
    //           },
    //           {
    //             "id": "339e83d7-0e31-4a90-d594-08ddbb962f2b",
    //             "name": "Mắt phải",
    //             "note": "",
    //             "value": "9",
    //             "maxValue": "10"
    //           }
    //         ]
    //       },
    //       {
    //         "id": "a4232a3a-ac2b-4de9-e4c0-08ddbb962f26",
    //         "stepName": "Đo độ cận/loạn/viễn bằng máy",
    //         "isCompleted": true,
    //         "stepServiceValueTrackings": [
    //           {
    //             "id": "4467af15-287e-4668-d595-08ddbb962f2b",
    //             "name": "PD ",
    //             "note": "",
    //             "value": "70",
    //             "maxValue": "80"
    //           },
    //           {
    //             "id": "560ee46f-ced4-4a41-d596-08ddbb962f2b",
    //             "name": "CYL",
    //             "note": "",
    //             "value": "7",
    //             "maxValue": "8.00"
    //           },
    //           {
    //             "id": "21c3f042-c424-407b-d597-08ddbb962f2b",
    //             "name": "OS / L",
    //             "note": "",
    //             "value": "1",
    //             "maxValue": "1"
    //           },
    //           {
    //             "id": "3d7d3503-172a-4fb3-d598-08ddbb962f2b",
    //             "name": "OD / R",
    //             "note": "",
    //             "value": "5",
    //             "maxValue": "6"
    //           },
    //           {
    //             "id": "56a99d9c-5430-4695-d599-08ddbb962f2b",
    //             "name": "SPH",
    //             "note": "",
    //             "value": "20",
    //             "maxValue": "20.00"
    //           },
    //           {
    //             "id": "ba8f688f-406d-4fa6-d59a-08ddbb962f2b",
    //             "name": "Axis",
    //             "note": "",
    //             "value": "180",
    //             "maxValue": "180"
    //           },
    //           {
    //             "id": "f37dc870-9572-41bd-d59b-08ddbb962f2b",
    //             "name": "ADD",
    //             "note": "",
    //             "value": "3.5",
    //             "maxValue": "3.50"
    //           }
    //         ]
    //       }
    //     ]
    //   },
    //   "error": {
    //     "code": "",
    //     "message": ""
    //   },
    //   "isSuccess": true
    // }
    // {
    //   "value": {
    //     "id": "d16b587b-8097-45cb-f335-08ddbb962f24",
    //     "serviceCode": "MS006     ",
    //     "serviceNote": "Theo dõi bệnh nhân cao huyết áp",
    //     "serviceName": "Xét nghiệm chức năng thận",
    //     "packageName": null,
    //     "servicePrice": 0,
    //     "testRecordStatus": "Finished",
    //     "roomNumber": null,
    //     "estimasedTime": "09:25:00",
    //     "numericalOrder": 43,
    //     "resultDescription": "ádfsaf",
    //     "failReason": null,
    //     "testResults": [
    //       {
    //         "id": "53eeb0f6-4904-40f8-162c-08ddbb96fb4a",
    //         "resultFieldLink": "uploads/10537fe6-72b1-4b31-b0b2-6d1665cfd173_normal.csv"
    //       },
    //       {
    //         "id": "b9f12c50-4a8e-4d7c-162d-08ddbb96fb4a",
    //         "resultFieldLink": "uploads/1b815344-1454-44bc-aba2-62650c658543_z6774064804546_df58b0f2a6b3aadd81acb58c240aca11.jpg"
    //       }
    //     ],
    //     "stepServiceTrackingResponses": [
    //       {
    //         "id": "d99946d6-493e-489b-e4c6-08ddbb962f26",
    //         "stepName": "Phân tích mẫu máu (Ure, Creatinin, eGFR)",
    //         "isCompleted": true,
    //         "stepServiceValueTrackings": []
    //       },
    //       {
    //         "id": "53174a6b-721f-4037-e4c7-08ddbb962f26",
    //         "stepName": "Lấy máu xét nghiệm chức năng thận",
    //         "isCompleted": true,
    //         "stepServiceValueTrackings": []
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
    console.error("Error fetching checkup record service results:", error);
    throw error;
  }
};

//lấy kết quả đo sinh hiệu
export const getVitalSignsResults = async (serviceId) => {
  try {
    const response = await api.get(`/VitalSigns/${serviceId}`);
    // {
    //   "value": {
    //     "id": "1ad1ab3a-b463-4e11-4975-08ddbebf58df",
    //     "height": 160,
    //     "weight": 50,
    //     "temperature": 37,
    //     "spO2": 42,
    //     "bloodPressure": "120/80",
    //     "speed": 75,
    //     "bmi": 19.53,
    //     "pulse": 75,
    //     "note": "okela đó",
    //     "status": "Completed"
    //   },
    //   "error": {
    //     "code": "",
    //     "message": ""
    //   },
    //   "isSuccess": true
    // };
    return response.data;
  } catch (error) {
    console.error("Error fetching vital signs results:", error);
    throw error;
  }
};
