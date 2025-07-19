import api from "./api";

export const UpdatePrescriptionDetails = async (
  prescriptionDetailsId,
  prescriptionData
) => {
  try {
    const response = await api.patch(
      `/PrescriptionDetails/${prescriptionDetailsId}`,
      prescriptionData
    );
    // {
    //   "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    //   "quantityByPatient": 0,
    //   "reasonChange": "string",
    // }
    return response.data;
  } catch (error) {
    throw error;
  }
};
