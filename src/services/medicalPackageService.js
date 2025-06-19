// src/services/medicalPackageService.js
import api from "./api";

export const getMedicalPackages = async (gender = null, age = null) => {
  try {
    // Build query parameters if gender and/or age are provided
    let url = "/MedicalPackages";
    const params = [];

    if (gender) {
      params.push(`Gender=${encodeURIComponent(gender)}`);
    }

    if (age !== null && age !== undefined) {
      params.push(`Age=${encodeURIComponent(age)}`);
    }

    // Add query parameters to URL if any exist
    if (params.length > 0) {
      url += `?${params.join("&")}`;
    }

    const response = await api.get(url); // Check if the response has the expected structure
    if (response.data && response.data.value && response.data.value.items) {
      return response.data.value.items.map((pkg) => ({
        id: pkg.id,
        name: pkg.title || pkg.name, // Support both title and name fields
        code: pkg.code,
        description: pkg.description || pkg.shortDescription || "",
        price: pkg.price || 0,
        type: pkg.type,
        targetGroup: pkg.targetGroup,
        imageUrl: pkg.imageUrl || null,
        details: pkg.details || {
          testCategories: pkg.testCategories || [],
        },
        // Include any additional fields that might be needed
        status: pkg.status,
        duration: pkg.duration,
        createdAt: pkg.createdAt,
        updatedAt: pkg.updatedAt,
      }));
    } else if (response.data && response.data.items) {
      return response.data.items.map((pkg) => ({
        id: pkg.id,
        name: pkg.title || pkg.name,
        code: pkg.code,
        description: pkg.description || pkg.shortDescription || "",
        price: pkg.price || 0,
        type: pkg.type,
        targetGroup: pkg.targetGroup,
        imageUrl: pkg.imageUrl || null,
        details: pkg.details || {
          testCategories: pkg.testCategories || [],
        },
        status: pkg.status,
        duration: pkg.duration,
        createdAt: pkg.createdAt,
        updatedAt: pkg.updatedAt,
      }));
    } else if (Array.isArray(response.data)) {
      // Handle direct array response
      return response.data.map((pkg) => ({
        id: pkg.id,
        name: pkg.title || pkg.name,
        code: pkg.code,
        description: pkg.description || pkg.shortDescription || "",
        price: pkg.price || 0,
        type: pkg.type,
        targetGroup: pkg.targetGroup,
        imageUrl: pkg.imageUrl || null,
        details: pkg.details || {
          testCategories: pkg.details?.testCategories || [],
        },
        status: pkg.status,
        duration: pkg.duration,
        createdAt: pkg.createdAt,
        updatedAt: pkg.updatedAt,
      }));
    } else {
      console.error("Unexpected response format:", response.data);
      return [];
    }
  } catch (error) {
    console.error("Error fetching medical packages:", error);
    throw error;
  }
};

export const getMedicalPackageById = async (id) => {
  try {
    const response = await api.get(`/MedicalPackages/${id}`);
    console.log("Fetched medical package:", response.data); // Check if the response has the expected structure
    if (response.data && response.data.value) {
      const pkg = response.data.value;
      return {
        id: pkg.id,
        name: pkg.title || pkg.name, // Support both title and name fields
        code: pkg.code,
        description: pkg.description || pkg.shortDescription || "",
        price: pkg.price || 0,
        type: pkg.type,
        targetGroup: pkg.targetGroup,
        imageUrl: pkg.imageUrl || null,
        details: pkg.details || {
          testCategories: pkg.testCategories || [],
        },
        status: pkg.status,
        duration: pkg.duration,
        createdAt: pkg.createdAt,
        updatedAt: pkg.updatedAt,
      };
    } else {
      return response.data;
    }
  } catch (error) {
    console.error(`Error fetching medical package with id ${id}:`, error);
    throw error;
  }
};
