"use client";
import React, { useState, useEffect, useRef } from "react";
import { showSuccess, showError } from "@/lib/toastUtils";
import { useRouter, useSearchParams } from "next/navigation";
import axiosInstance from "@/lib/axiosInstance";
import { Button } from "@/components/ui/button";
import { Loader, ArrowLeft } from "lucide-react";
import Image from "next/image";

const AddCrop = ({ type, id }) => {
  const instance = axiosInstance();
  const router = useRouter();
  // const searchParams = useSearchParams();
  // const id = searchParams.get("id");
  const FileUrl = process.env.NEXT_PUBLIC_FILEURL;

  const imageRef = useRef(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);

  const [formData, setFormData] = useState({
    role_name: "",
    description: "",
  });

  const [errors, setErrors] = useState({});

 const validate = () => {
  const newErrors = {};

  if (!formData.role_name || !formData.role_name.trim()) {
    newErrors.role_name = "Role name is required";
  }

  if (!formData.description || !formData.description.trim()) {
    newErrors.description = "Description is required";
  }

  return newErrors;
};


  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

 

  

  const getCrop = async (id) => {
  try {
    const response = await instance.get(`/roles`);
    
    if (response.data?.data) {
      const roles = response.data.data;

      // Single role extract
      const crop = roles.find(r => r.role_id == id);

      if (!crop) return showError("Role not found");

      setFormData({
        role_name: crop.role_name || "",
        description: crop.description || "",
        createdAt: crop.createdAt || "",
        updatedAt: crop.updatedAt || "",
      });
    }
  } catch (error) {
    showError(error?.response?.data?.message || "Failed to fetch role");
  }
};


  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      showWarning("Please fill all the required fields");
      setErrors(validationErrors);
      return;
    }
    setErrors({});
    setIsSubmitting(true);

    try {
      const formDataToSend = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (key === "image" && typeof value === "string") return;
        formDataToSend.append(key, value);
      });

      const response = await instance.post("/roles", formData);
      if (response?.status === 200) {
        showSuccess(response?.data?.message || "Crop added successfully");
        router.push("/admin/crops-list");
      }
    } catch (error) {
      const backendErrors = error?.response?.data?.error?.errors;
      if (backendErrors && Array.isArray(backendErrors)) {
        const newErrors = {};
        backendErrors.forEach((err) => {
          newErrors[err.field] = err.message;
        });
        setErrors(newErrors);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

 const handleUpdate = async (e) => {
  e.preventDefault();

  const validationErrors = validate();
  if (Object.keys(validationErrors).length > 0) {
    setErrors(validationErrors);
    return;
  }

  setIsSubmitting(true);

  try {
    const payload = {
      id: id,
      role_name: formData.role_name,
      description: formData.description,
    };

    const response = await instance.put(`/roles`, payload);

    if (response?.status === 200) {
      showSuccess("Role updated successfully");
      router.push("/admin/crops-list");
    }
  } catch (error) {
    showError(error?.response?.data?.message || "Update failed");
  } finally {
    setIsSubmitting(false);
  }
};


  useEffect(() => {
    if ((type === "Edit" || type === "View") && id) {
      getCrop(id);
    }
  }, [id, type]);

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  return (
    <div className="p-4 flex flex-col gap-6">
      <div className="bg-white dark:bg-background border shadow rounded-lg p-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-4">
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-200">
            {type === "View" ? "View Crop" : `${type} Crop`}
          </h2>
          <Button
            variant="default"
            size="sm"
            onClick={() => router.push("/admin/crops-list")}
            className="gap-2"
          >
            <ArrowLeft size={16} />
            <span className="hidden sm:inline">Back</span>
          </Button>
        </div>

        <form onSubmit={type === "Edit" ? handleUpdate : handleSubmit}>
          <div className="grid gap-4 sm:grid-cols-2 sm:gap-6">
            {/* Name */}
            <div>
              <label
                htmlFor="role_name"
                className="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-200"
              >
                Role Name *
              </label>
              <input
                type="text"
                name="role_name"
                value={formData.role_name}
                onChange={handleChange}
                disabled={type === "View"}
                className="w-full border border-border rounded px-3 py-2 text-sm bg-background dark:text-gray-200"
                placeholder="Name"
              />
              {errors.role_name && (
                <p className="text-red-500 text-xs mt-1">{errors.role_name}</p>
              )}
            </div>

            {/* Category*/}
            <div>
              <label
                htmlFor="description"
                className="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-200"
              >
                Description *
              </label>
              <input
                type="text"
                name="description"
                value={formData.description}
                onChange={handleChange}
                disabled={type === "View"}
                className="w-full border border-border rounded px-3 py-2 text-sm bg-background dark:text-gray-200"
                placeholder="Description"
              />
              {errors.description && (
                <p className="text-red-500 text-xs mt-1">{errors.description}</p>
              )}
            </div>

           
           
            {type === "View" && (
            <div>
              <label htmlFor="createdAt" className="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-200">
                  Created At
                </label>
                <input
                  type="text"
                  name="createdAt"
                  value={formData.createdAt ? new Date(formData.createdAt).toLocaleString() : ""}
                  disabled
                  className="w-full border border-border rounded px-3 py-2 text-sm bg-background dark:text-gray-200"
                />
            </div>
            )}
            {type === "View" && (
            <div>
             <label htmlFor="updatedAt" className="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-200">
                  Updated At
                </label>
                <input
                  type="text"
                  name="updatedAt"
                  value={formData.updatedAt ? new Date(formData.updatedAt).toLocaleString() : ""}
                  disabled
                  className="w-full border border-border rounded px-3 py-2 text-sm bg-background dark:text-gray-200"
                />
            </div>
            )}
          </div>
          
          {type !== "View" && (
            <div className="flex justify-end mt-4">
              <Button
                type="submit"
                disabled={isSubmitting}
                variant="default"
                size="sm"
                className="gap-2"
              >
                {isSubmitting && (
                  <Loader className="animate-spin w-5 h-5 mr-2" />
                )}
                {type === "Edit" ? "Update Crop" : "Add Crop"}
              </Button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default AddCrop;
