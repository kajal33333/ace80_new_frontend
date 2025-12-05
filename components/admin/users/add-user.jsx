"use client";
import React, { useState, useEffect, useRef } from "react";
import { showSuccess, showError } from "@/lib/toastUtils";
import { useRouter, useSearchParams } from "next/navigation";
import axiosInstance from "@/lib/axiosInstance";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";
import { Loader, ArrowLeft } from "lucide-react";
import Image from "next/image";
const AddUser = ({ type, userId }) => {
  const FileUrl = process.env.NEXT_PUBLIC_FILEURL;
  const instance = axiosInstance();
  const router = useRouter();

  const id = userId;
  const imageRef = useRef(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [roleList, setRoleList] = useState([]);
  
  const [roles, setRoles] = useState([
    { role_id: "Admin", role_name: "Admin" },
    { role_id: "User", role_name: "User" },
  ]);
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    primary_email: "",
    emp_code: "",
    password: "",
    contact: "",
    role_id: "",
    company_name: "",
    start_date: "",
    status_date: "",
    location: "",
    isAdmin: false,
    address: "",
  });

  const [errors, setErrors] = useState({});
  const [previewUrl, setPreviewUrl] = useState(null);

  const validate = () => {
    const errors = {};

    // First Name (Required)

    if (!formData.first_name?.trim()) {
      errors.first_name = "First name is required";
    } else if (!/^[A-Za-z\s]+$/.test(formData.first_name)) {
      errors.first_name = "Only letters allowed";
    }

    // Last Name (Required)

    if (!formData.last_name?.trim()) {
      errors.last_name = "Last name is required";
    } else if (!/^[A-Za-z\s]+$/.test(formData.last_name)) {
      errors.last_name = "Only letters allowed";
    }

    // Emp Code (Required)

    if (!formData.emp_code?.trim()) {
      errors.emp_code = "Emp Code is required";
    }

    // Email (Required)

    if (!formData.primary_email?.trim()) {
      errors.primary_email = "Email is required";
    } else if (!/^\S+@\S+\.\S+$/.test(formData.primary_email)) {
      errors.primary_email = "Invalid email";
    }

    // Password (Required Only On Add)

    if (type !== "Edit") {
      if (!formData.password?.trim()) {
        errors.password = "Password is required";
      } else if (formData.password.length < 6) {
        errors.password = "Min 6 characters required";
      }
    }

    // Contact (Required)

    if (!formData.contact?.trim()) {
      errors.contact = "Contact is required";
    } else if (!/^\d{10}$/.test(formData.contact)) {
      errors.contact = "Enter 10-digit number";
    }

    // Role (Required)

   if (!formData.role_id) {
  errors.role_id = "Role is required";
}


    // Company (Required)

    if (!formData.company_name?.trim()) {
      errors.company_name = "Company is required";
    }

    // Status Date (Required)

    if (!formData.status_date?.trim()) {
      errors.status_date = "Status date is required";
    }

    // Start Date (Required)

    if (!formData.start_date?.trim()) {
      errors.start_date = "Start date is required";
    }

    return errors;
  };

  const handleChange = (e) => {
  const { name, value } = e.target;

  setFormData((prev) => ({
    ...prev,
    [name]: value,
  }));

  setErrors((prev) => ({ ...prev, [name]: "" }));
};


  const getUser = async (id) => {
    try {
      const response = await instance.get(`/users?id=${id}`);
      const user = response.data?.data;

      if (user) {
        setFormData({
          first_name: user.first_name || "",
          last_name: user.last_name || "",
          primary_email: user.primary_email || "",
          emp_code: user.emp_code || "",
          contact: user.contact || "",
          role_id: user.role_id || "",
          company_name: user.company_name || "",
          start_date: user.start_date || "",
          status_date: user.status_date || "",
          location: user.location || "",
          address: user.address || "",
          isAdmin: user.isAdmin || false,
          createdAt: user.createdAt || "",
          updatedAt: user.updatedAt || "",
        });
      }
    } catch (error) {
      showError("User details load nahi hue");
    }
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("FormData ja raha hai:", formData);
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      console.log("VALIDATION ERRORS:", validationErrors);

      return;
    }
    setErrors({});
    setIsSubmitting(true);
    try {
      const response = await instance.post("/users/register", formData);
      if (response?.status === 200) {
        showSuccess(response?.data?.message || "User registered successfully");
        router.push("/admin/users-list");
      }
    } catch (error) {
      console.log(error);
      const backendErrors = error?.response?.data?.error?.errors;
      if (backendErrors && Array.isArray(backendErrors)) {
        const newErrors = {};
        backendErrors.forEach((err) => {
          newErrors[err.field] = err.message;
        });
        setErrors(newErrors);
      } else {
        showError(
          error?.response?.data?.error?.message || "Something went wrong"
        );
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
    showError("Please fix the highlighted errors");
    return;
  }
  setErrors({});
  setIsSubmitting(true);

  try {
    // Prepare payload
    const payload = { ...formData };

    // Convert role_id to number if needed
    if (payload.role_id) payload.role_id = Number(payload.role_id);

    // Convert isAdmin to boolean
    payload.isAdmin = !!payload.isAdmin;

    // Send JSON to backend
    const response = await instance.put(`/users?id=${id}`, payload);

    if (response?.status === 200) {
      showSuccess(response?.data?.message || "User updated successfully");
      router.push("/admin/users-list");
    }
  } catch (error) {
    console.log(error);
    const backendErrors = error?.response?.data?.error?.errors;
    if (backendErrors && Array.isArray(backendErrors)) {
      const newErrors = {};
      backendErrors.forEach((err) => {
        newErrors[err.field] = err.message;
      });
      setErrors(newErrors);
    } else {
      showError(error?.response?.data?.message || "Update failed");
    }
  } finally {
    setIsSubmitting(false);
  }
};


  useEffect(() => {
    if ((type === "Edit" || type === "View") && id) {
      getUser(id);
    }
  }, [id, type]);

  const fetchRoles = async () => {
    try {
      const res = await instance.get("/roles");
      setRoleList(res.data?.data || []);
    } catch (error) {
      console.error("Failed to fetch roles:", error);
    }
  };

  useEffect(() => {
    fetchRoles();
    if (id && (type === "Edit" || type === "View")) {
      getUser(id);
    }
  }, [id, type]);

  return (
    <div className="p-4 flex flex-col gap-6">
      <div className="bg-white dark:bg-background border shadow rounded-lg p-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-4">
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-200">
            {type === "View" ? "View User" : `${type} User`}
          </h2>
          <Button
            variant="default"
            size="sm"
            onClick={() => router.push("/admin/users-list")}
            className="gap-2"
          >
            <ArrowLeft size={16} />
            <span className="hidden sm:inline">Back</span>
          </Button>
        </div>

        <form onSubmit={type === "Edit" ? handleUpdate : handleSubmit}>
          <div className="grid gap-4 sm:grid-cols-2 sm:gap-6">
           

            {/* First Name */}
            <div>
              <label
                htmlFor="first_name"
                className="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-200"
              >
                First Name
              </label>
              <input
                type="text"
                name="first_name"
                value={formData.first_name}
                onChange={handleChange}
              disabled={type === "View" || type !== "Edit"}
                className="w-full border border-border rounded px-3 py-2 text-sm bg-background dark:text-gray-200"
                placeholder="First name"
              />
              {errors.first_name && (
                <p className="text-red-500 text-xs mt-1">{errors.first_name}</p>
              )}
            </div>

            {/* Last Name */}
            <div>
              <label
                htmlFor="last_name"
                className="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-200"
              >
                Last Name
              </label>
              <input
                type="text"
                name="last_name"
                value={formData.last_name}
                onChange={handleChange}
              disabled={type === "View" || type !== "Edit"}
                className="w-full border border-border rounded px-3 py-2 text-sm bg-background dark:text-gray-200"
                placeholder="Last name"
              />
              {errors.last_name && (
                <p className="text-red-500 text-xs mt-1">{errors.last_name}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label
                htmlFor="primary_email"
                className="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-200"
              >
                Email
              </label>
              <input
                type="email"
                name="primary_email"
                value={formData.primary_email}
                onChange={handleChange}
               disabled={type === "View" || type !== "Edit"}
                className="w-full border border-border rounded px-3 py-2 text-sm bg-background dark:text-gray-200"
                placeholder="Email"
              />
              {errors.primary_email && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.primary_email}
                </p>
              )}
            </div>
             {/* Phone */}
            <div>
              <label
                htmlFor="contact"
                className="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-200"
              >
                Contact
              </label>
              <input
                type="tel"
                name="contact"
                value={formData.contact}
                onChange={handleChange}
             disabled={type === "View" || type !== "Edit"}
                className="w-full border border-border rounded px-3 py-2 text-sm bg-background dark:text-gray-200"
                placeholder="e.g., +1234567890"
              />
              {errors.contact && (
                <p className="text-red-500 text-xs mt-1">{errors.contact}</p>
              )}
            </div>
            {/* emp code */}
            <div>
              <label
                htmlFor="emp_code"
                className="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-200"
              >
                Emp Code
              </label>
              <input
                type="text"
                name="emp_code"
                value={formData.emp_code}
                onChange={handleChange}
               disabled={type === "View" || type !== "Edit"}
                className="w-full border border-border rounded px-3 py-2 text-sm bg-background dark:text-gray-200"
                placeholder="Emp Code"
              />
              {errors.emp_code && (
                <p className="text-red-500 text-xs mt-1">{errors.emp_code}</p>
              )}
            </div>
            {/* Password */}
            {type === "Add" && (
              <div>
                <label
                  htmlFor="password"
                  className="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-200"
                >
                  Password
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full border border-border rounded px-3 py-2 text-sm bg-background dark:text-gray-200"
                  placeholder="Password"
                />
                {errors.password && (
                  <p className="text-red-500 text-xs mt-1">{errors.password}</p>
                )}
              </div>
            )}

            <div>
              <label
                htmlFor="address"
                className="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-200"
              >
                Address
              </label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
              disabled={type === "View" || type !== "Edit"}
                className="w-full border border-border rounded px-3 py-2 text-sm bg-background dark:text-gray-200"
                placeholder="Address"
              />
              {errors.address && (
                <p className="text-red-500 text-xs mt-1">{errors.address}</p>
              )}
            </div>
            {/* start date */}
            <div>
              <label
                htmlFor="start_date"
                className="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-200"
              >
                Start Date
              </label>

              <input
                type="date"
                name="start_date"
                value={
                  formData.start_date ? formData.start_date.split("T")[0] : ""
                }
                onChange={handleChange}
               disabled={type === "View" || type !== "Edit"}
                className="w-full border border-border rounded px-3 py-2 text-sm bg-background dark:text-gray-200"
                placeholder="Start Date"
              />

              {errors.start_date && (
                <p className="text-red-500 text-xs mt-1">{errors.start_date}</p>
              )}
            </div>

            {/* admin */}
            <div>
              <label
                htmlFor=" isAdmin"
                className="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-200"
              >
                admin
              </label>
              <input
                type="text"
                name="isAdmin"
                value={formData.isAdmin}
                onChange={handleChange}
             disabled={type === "View" || type !== "Edit"}
                className="w-full border border-border rounded px-3 py-2 text-sm bg-background dark:text-gray-200"
                placeholder="Admin"
              />
              {errors.isAdmin && (
                <p className="text-red-500 text-xs mt-1">{errors.isAdmin}</p>
              )}
            </div>
            {/* status date */}
            <div>
              <label
                htmlFor="status_date"
                className="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-200"
              >
                Status Date
              </label>

              <input
                type="date"
                name="status_date"
                value={
                  formData.status_date ? formData.status_date.split("T")[0] : ""
                }
                onChange={handleChange}
              disabled={type === "View" || type !== "Edit"}
                className="w-full border border-border rounded px-3 py-2 text-sm bg-background dark:text-gray-200"
                placeholder="Status Date"
              />

              {errors.status_date && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.status_date}
                </p>
              )}
            </div>

            {/* company */}
            <div>
              <label
                htmlFor="company_name"
                className="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-200"
              >
                Company
              </label>
              <select
                name="company_name"
                value={formData.company_name}
                onChange={handleChange}
              disabled={type === "View" || type !== "Edit"}
                className="w-full border border-border rounded px-3 py-2 text-sm bg-background dark:text-gray-200"
              >
                <option value="">Select Company</option>
                <option value="Ace">Ace</option>
                <option value="Dealer">Dealer</option>
              </select>
              {errors.company_name && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.company_name}
                </p>
              )}
            </div>

            {/* location */}
            <div>
              <label
                htmlFor="location"
                className="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-200"
              >
                location
              </label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
               disabled={type === "View" || type !== "Edit"}
                className="w-full border border-border rounded px-3 py-2 text-sm bg-background dark:text-gray-200"
                placeholder="location"
              />
              {errors.location && (
                <p className="text-red-500 text-xs mt-1">{errors.location}</p>
              )}
            </div>

            <div>
              <label
                htmlFor="role_id"
                className="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-200"
              >
                Role
              </label>
              <select
                id="role_id"
                name="role_id"
                value={formData.role_id}
                onChange={handleChange}
              disabled={type === "View" || type !== "Edit"}
                className="w-full border border-border rounded px-3 py-2 text-sm bg-background dark:text-gray-200"
              >
                <option value="">Select Role</option>
                {roleList.map((role) => (
                  <option key={role.role_id} value={role.role_id}>
                    {role.role_name}
                  </option>
                ))}
              </select>
              {errors.role_id && (
                <p className="text-red-500 text-xs mt-1">{errors.role_id}</p>
              )}
            </div>

            {type === "View" && (
              <div className="sm:col-span-1">
                <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-200">
                  Created At
                </label>
                <input
                  type="text"
                  value={
                    formData.createdAt
                      ? new Date(formData.createdAt).toLocaleString("en-IN", {
                          dateStyle: "medium",
                          timeStyle: "short",
                        })
                      : "N/A"
                  }
                  disabled
                  className="w-full border border-border rounded px-3 py-2 text-sm bg-background dark:text-gray-200"
                />
              </div>
            )}

            {/* Updated At (View Mode Only) */}
            {type === "View" && (
              <div className="sm:col-span-1">
                <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-200">
                  Updated At
                </label>
                <input
                  type="text"
                  value={
                    formData.updatedAt
                      ? new Date(formData.updatedAt).toLocaleString("en-IN", {
                          dateStyle: "medium",
                          timeStyle: "short",
                        })
                      : "N/A"
                  }
                  disabled
                  className="w-full border border-border rounded px-3 py-2 text-sm bg-background dark:text-gray-200"
                />
              </div>
            )}
          </div>

          {/* Submit Button (Hidden in View Mode) */}
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
                {type === "Edit" ? "Update " : "Add "}
              </Button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default AddUser;
