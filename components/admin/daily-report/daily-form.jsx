


"use client";
import React, { useState, useEffect, useRef } from "react";
import { showSuccess, showError } from "@/lib/toastUtils";
import { useRouter, useSearchParams } from "next/navigation";
import axiosInstance from "@/lib/axiosInstance";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";

import { formatDate } from "@/lib/utils";
import { Loader, ArrowLeft,Plus } from "lucide-react";
import Image from "next/image";
const AddDailyReport = ({ type, userId }) => {
  const FileUrl = process.env.NEXT_PUBLIC_FILEURL;
  const instance = axiosInstance();
  const router = useRouter();

 const searchParams = useSearchParams();
const id = searchParams.get("id");
  const imageRef = useRef(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [usersList, setUsersList] = useState([]);
  const [cityList, setCityList] = useState([]);

  const [roles, setRoles] = useState([
    { role_id: "Admin", role_name: "Admin" },
    { role_id: "User", role_name: "User" },
  ]);
  const [formData, setFormData] = useState({
    date_of_visit: "",
    time_of_visit: "",
    contact_person: "",
    company_name: "",
    mobile_no: "",
    location_area: "",
    city: "",
    cold_customer: false,
    competitor_customer: false,
    customer_email: "",
    remarks: "",
    latitude: "",
    longitude: "",
    assigned_to: "",

  });



  const [errors, setErrors] = useState({});
  const [previewUrl, setPreviewUrl] = useState(null);

  const validate = () => {
    const errors = {};

    if (!formData.date_of_visit) errors.date_of_visit = "Date of visit is required";
    if (!formData.time_of_visit) errors.time_of_visit = "Time of visit is required";
    if (!formData.contact_person) errors.contact_person = "Contact person is required";
    if (!formData.company_name) errors.company_name = "Company name is required";
    if (!formData.mobile_no) errors.mobile_no = "Mobile number is required";
    else if (!/^\d{10}$/.test(formData.mobile_no))
      errors.mobile_no = "Mobile number must be 10 digits";
    if (!formData.location_area) errors.location_area = "Location area is required";
    if (!formData.city) errors.city = "City is required";
    if (!formData.assigned_to) errors.assigned_to = "Assigned user is required";

    if (formData.customer_email && !/^\S+@\S+\.\S+$/.test(formData.customer_email))
      errors.customer_email = "Invalid email";

    return errors;
  };


  const handleChange = (e) => {
  const { name, type, value, checked } = e.target;
  setFormData((prev) => ({
    ...prev,
    [name]: type === "checkbox" ? checked : value,
  }));
  setErrors((prev) => ({ ...prev, [name]: "" }));
};


   


 const getReport = async (id) => {
  try {
    const response = await instance.get(`/dailyReport?id=${id}`);
    const report = response.data?.data;

    if (report) {
      setFormData({
        date_of_visit: report.date_of_visit || "",
        time_of_visit: report.time_of_visit || "",
        contact_person: report.contact_person || "",
        company_name: report.company_name || "",
        mobile_no: report.mobile_no || "",
        location_area: report.location_area || "",
        city: report.city || "",
        cold_customer: report.cold_customer || false,
        competitor_customer: report.competitor_customer || false,
        customer_email: report.customer_email || "",
        remarks: report.remarks || "",
        latitude: report.latitude || "",
        longitude: report.longitude || "",
        assigned_to: report.assigned_to || "",
        createdAt: report.createdAt || "",
        updatedAt: report.updatedAt || "",
      });
    }
  } catch (error) {
    showError("Report data could not be loaded");
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
      const response = await instance.post("/dailyreport", formData);
      if (response?.status === 200) {
        showSuccess(response?.data?.message || "User registered successfully");
        router.push("/daily-report");
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
      const response = await instance.put(`/dailyreport?id=${id}`, payload);

      if (response?.status === 200) {
        showSuccess(response?.data?.message || "User updated successfully");
        router.push("/admin/daily-report");
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
      getReport(id);
    }
  }, [id, type]);

  const fetchUsers = async () => {
    const res = await instance.get("/users");
    setUsersList(res.data?.data || []);
  };

  const fetchCity = async () => {
    try {
      const res = await instance.get("/cities");
      setCityList(res.data?.data || []);
    } catch (error) {
      console.error("Failed to fetch cities:", error);
    }
  };

  useEffect(() => {
    fetchCity();
  }, []);

  useEffect(() => {
    fetchUsers();
    if (id && (type === "Edit" || type === "View")) {
      getReport(id);
    }
  }, [id, type]);

  return (
    <div className="p-4 flex flex-col gap-6">
      <div className="bg-white dark:bg-background border shadow rounded-lg p-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-4">
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-200">

            
            {type === "View" ? "View Report" : `${type} Report`}
          </h2>
<div className="flex gap-2">
            {type === "View" && (
      <Button
        size="sm"
        variant="default"
        onClick={() => router.push(`/admin/add-enquiry?daily_report_id=${id}`)}
        className="gap-2"
      >
        <Plus size={14} />
        <span className="hidden sm:inline">Add Enquiry</span>
      </Button>
    )}
          <Button
            variant="default"
            size="sm"
            onClick={() => router.push("/admin/daily-report")}
            className="gap-2"
          >
            <ArrowLeft size={16} />
            <span className="hidden sm:inline">Back</span>
          </Button>
          </div>
        </div>

        <form onSubmit={type === "Edit" ? handleUpdate : handleSubmit}>
          <div className="grid gap-4 sm:grid-cols-2 sm:gap-6">
            {/* Phone */}
            <div>
              <label
                htmlFor="mobile_no"
                className="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-200"
              >
                Contact *
              </label>
              <input
                type="text"
                name="mobile_no"
                value={formData.mobile_no}
                onChange={handleChange}
                disabled={type === "View"}
                className="w-full border border-border rounded px-3 py-2 text-sm bg-background dark:text-gray-200"
                placeholder="e.g., +1234567890"
              />
              {errors.mobile_no && (
                <p className="text-red-500 text-xs mt-1">{errors.mobile_no}</p>
              )}
            </div>

            {/* First Name */}
            <div>
              <label
                htmlFor="contact_person"
                className="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-200"
              >
                Contact person *
              </label>
              <input
                type="text"
                name="contact_person"
                value={formData.contact_person}
                onChange={handleChange}
                disabled={type === "View"}
                className="w-full border border-border rounded px-3 py-2 text-sm bg-background dark:text-gray-200"
                placeholder="Conatct person name"
              />
              {errors.contact_person && (
                <p className="text-red-500 text-xs mt-1">{errors.contact_person}</p>
              )}
            </div>

            {/* Last Name */}
            <div>
              <label
                htmlFor="remarks"
                className="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-200"
              >
                Remarks
              </label>
              <input
                type="text"
                name="remarks"
                value={formData.remarks}
                onChange={handleChange}
                disabled={type === "View"}
                className="w-full border border-border rounded px-3 py-2 text-sm bg-background dark:text-gray-200"
                placeholder="Remarks"
              />
              {errors.remarks && (
                <p className="text-red-500 text-xs mt-1">{errors.remarks}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label
                htmlFor="customer_email"
                className="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-200"
              >
                Customer Email ID
              </label>
              <input
                type="email"
                name="customer_email"
                value={formData.customer_email}
                onChange={handleChange}
                disabled={type === "View"}
                className="w-full border border-border rounded px-3 py-2 text-sm bg-background dark:text-gray-200"
                placeholder="Email"
              />
              {errors.customer_email && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.customer_email}
                </p>
              )}
            </div>

            {/* competitior */}
          <div className="flex items-center gap-2">
  <Checkbox
    id="competitor_customer"
    checked={formData.competitor_customer}
    onCheckedChange={(checked) =>
      setFormData((prev) => ({ ...prev, competitor_customer: checked }))
    }
    disabled={type === "View"}
  />
  <label htmlFor="competitor_customer" className="text-sm font-medium text-gray-900 dark:text-gray-200">
    Competitor Customer
  </label>
</div>

            {/* cold customer */}
            <div className="flex items-center gap-2">
  <Checkbox
    id="cold_customer"
    checked={formData.cold_customer}
    onCheckedChange={(checked) =>
      setFormData((prev) => ({ ...prev, cold_customer: checked }))
    }
    disabled={type === "View"}
  />
  <label htmlFor="cold_customer" className="text-sm font-medium text-gray-900 dark:text-gray-200">
    Cold Customer
  </label>
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
            {/*  longitude*/}
            <div>
              <label
                htmlFor="longitude"
                className="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-200"
              >
                Longitude
              </label>
              <input
                type="text"
                name="longitude"
                value={formData.longitude}
                onChange={handleChange}
                disabled={type === "View"}
                className="w-full border border-border rounded px-3 py-2 text-sm bg-background dark:text-gray-200"
                placeholder="longitude"
              />
              {errors.longitude && (
                <p className="text-red-500 text-xs mt-1">{errors.longitude}</p>
              )}
            </div>
            {/* latitude */}
            <div>
              <label
                htmlFor="latitude"
                className="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-200"
              >
                latitude
              </label>
              <input
                type="text"
                name="latitude"
                value={formData.latitude}
                onChange={handleChange}
                disabled={type === "View"}
                className="w-full border border-border rounded px-3 py-2 text-sm bg-background dark:text-gray-200"
                placeholder="latitude"
              />
              {errors.latitude && (
                <p className="text-red-500 text-xs mt-1">{errors.latitude}</p>
              )}
            </div>
            {/* start date */}
            <div>
              <label
                htmlFor="start_date"
                className="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-200"
              >
                Date of visit
              </label>

              <input
                type="date"
                name="date_of_visit"
                value={
                  formData.date_of_visit ? formData.date_of_visit.split("T")[0] : ""
                }
                onChange={handleChange}
                disabled={type === "View"}
                className="w-full border border-border rounded px-3 py-2 text-sm bg-background dark:text-gray-200"
                placeholder="Date of visit"
              />

              {errors.start_date && (
                <p className="text-red-500 text-xs mt-1">{errors.start_date}</p>
              )}
            </div>

            {/* time of visit */}
            <div>
              <label
                htmlFor="time_of_visit"
                className="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-200"
              >
                Time of Visit *
              </label>

              <input
                type="time"
                name="time_of_visit"
                value={formData.time_of_visit || ""}
                onChange={handleChange}
                disabled={type === "View"}
                className="w-full border border-border rounded px-3 py-2 text-sm bg-background dark:text-gray-200"
                placeholder="Time of visit"
              />

              {errors.time_of_visit && (
                <p className="text-red-500 text-xs mt-1">{errors.time_of_visit}</p>
              )}
            </div>

            {/* admin */}
            <div>
              <label
                htmlFor=" isAdmin"
                className="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-200"
              >
                Company name
              </label>
              <input
                type="text"
                name="company_name"
                value={formData.company_name}
                onChange={handleChange}
                disabled={type === "View"}
                className="w-full border border-border rounded px-3 py-2 text-sm bg-background dark:text-gray-200"
                placeholder="Company name"
              />
              {errors.isAdmin && (
                <p className="text-red-500 text-xs mt-1">{errors.isAdmin}</p>
              )}
            </div>


            {/* user */}
            <div>
              <label
                htmlFor="assigned_to"
                className="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-200"
              >
                Assigned user *
              </label>
              <select
                id="assigned_to"
                name="assigned_to"
                value={formData.assigned_to}
                onChange={handleChange}
                disabled={type === "View"}
                className="w-full border border-border rounded px-3 py-2 text-sm bg-background dark:text-gray-200"
              >
                <option value="">Select User</option>
                {usersList.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.first_name} {user.last_name}
                  </option>
                ))}
              </select>
              {errors.assigned_to && (
                <p className="text-red-500 text-xs mt-1">{errors.assigned_to}</p>
              )}
            </div>




            {/* location */}
            <div>
              <label
                htmlFor="location_area"
                className="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-200"
              >
                location *
              </label>
              <input
                type="text"
                name="location_area"
                value={formData.location_area}
                onChange={handleChange}
                disabled={type === "View"}
                className="w-full border border-border rounded px-3 py-2 text-sm bg-background dark:text-gray-200"
                placeholder="location"
              />
              {errors.location_area && (
                <p className="text-red-500 text-xs mt-1">{errors.location_area}</p>
              )}
            </div>
            {/* city */}
            <div>
              <label
                htmlFor="city"
                className="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-200"
              >
                City *
              </label>
              <select
                id="city"
                name="city"
                value={formData.city}
                onChange={handleChange}
                disabled={type === "View"}
                className="w-full border border-border rounded px-3 py-2 text-sm bg-background dark:text-gray-200"
              >
                <option value="">Select City</option>
                {cityList.map((city) => (
                  <option key={city.id} value={city.id}>
                    {city.name}
                  </option>
                ))}
              </select>
              {errors.city && (
                <p className="text-red-500 text-xs mt-1">{errors.city}</p>
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

export default AddDailyReport;
