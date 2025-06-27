import api from "./api";

export const getServices = async () => {
  try {
    const response = await api.get("/Services");

    // Check if the response has the expected structure
    if (response.data && response.data.value && response.data.value.items) {
      return response.data.value.items.map((service) => ({
        id: service.id,
        name: service.name || service.title, // Support both name and title fields
        description:
          service.description || service.note || service.symptom || "",
        price: service.price || 0,
        code: service.code,
        imageUrl: service.imageUrl || null,
        // Include any additional fields that might be needed
        status: service.status,
        duration: service.duration,
        createdAt: service.createdAt,
        updatedAt: service.updatedAt,
      }));
    } else if (response.data && response.data.items) {
      return response.data.items.map((service) => ({
        id: service.id,
        name: service.name || service.title,
        description:
          service.description || service.note || service.symptom || "",
        price: service.price || 0,
        code: service.code,
        imageUrl: service.imageUrl || null,
        status: service.status,
        duration: service.duration,
        createdAt: service.createdAt,
        updatedAt: service.updatedAt,
      }));
    } else {
      console.error("Unexpected response format:", response.data);
      return [];
    }
  } catch (error) {
    console.error("Error fetching services:", error);
    throw error;
  }
};

export const getServiceById = async (id) => {
  try {
    const response = await api.get(`/Services/${id}`);
    console.log("Fetched service:", response.data);

    // Check if the response has the expected structure
    if (response.data && response.data.value) {
      const service = response.data.value;
      return {
        id: service.id,
        name: service.name || service.title,
        description:
          service.description || service.note || service.symptom || "",
        price: service.price || 0,
        code: service.code,
        imageUrl: service.imageUrl || null,
        // Include any additional fields that might be needed
        status: service.status,
        duration: service.duration,
        createdAt: service.createdAt,
        updatedAt: service.updatedAt,
      };
    } else {
      return response.data;
    }
  } catch (error) {
    console.error(`Error fetching service with id ${id}:`, error);
    throw error;
  }
};
