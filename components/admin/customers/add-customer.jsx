
"use client";

import React, { useState, useEffect, useRef } from "react";
import { showSuccess, showError, showWarning } from "@/lib/toastUtils";
import { useRouter, useSearchParams } from "next/navigation";
import axiosInstance from "@/lib/axiosInstance";
import { Button } from "@/components/ui/button";
import { Loader, ArrowLeft } from "lucide-react";
import Image from "next/image";
import {  Download } from "lucide-react";


const AddCustomer = ({ type }) => {
  const instance = axiosInstance();
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
 

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [formData, setFormData] = useState({
  customer_name: "",
  customer_phone: "",
  customer_email: "",
  region: "",
  state: "",
  city: "",
  customer_business: "",
  assigned_to: "",
  customer_code: "",
});
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [errors, setErrors] = useState({});
 const [regions, setRegions] = useState([]);
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [businesses, setBusinesses] = useState([]);
  const [showBulkUpload, setShowBulkUpload] = useState(false);
const [bulkFile, setBulkFile] = useState(null);
const [bulkAssignedTo, setBulkAssignedTo] = useState("");
const [bulkUploading, setBulkUploading] = useState(false);
const [uploadResults, setUploadResults] = useState(null);

  const [users, setUsers] = useState([]);
  const unitOptions = ["kg", "g", "ml", "l", "ton"];

 const validate = () => {
  const newErrors = {};
  if (!formData.customer_name.trim()) newErrors.customer_name = "Customer Name is required";
  if (!formData.customer_phone.trim()) newErrors.customer_phone = "Phone number is required";
  if (!formData.assigned_to) newErrors.assigned_to = "Assign to is required"; 
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

  

   const fetchMasterData = async () => {
    try {
      setLoadingUsers(true);
      const [usersRes, regionsRes, statesRes, citiesRes, businessesRes] =
        await Promise.all([
          instance.get(`/users?getAll=true`),
          instance.get(`/enquiryRegion?getAll=true`),
          instance.get(`/enquiryState?getAll=true`),
          instance.get(`/cities`),
          instance.get(`/enquiryCustomerBusiness?getAll=true`),
        ]);

      if (usersRes?.data?.data) setUsers(usersRes.data.data);
      if (regionsRes?.data?.data) setRegions(regionsRes.data.data);
      if (statesRes?.data?.data) setStates(statesRes.data.data);
      if (citiesRes?.data?.data) setCities(citiesRes.data.data);
      if (businessesRes?.data?.data) setBusinesses(businessesRes.data.data);
    } catch (error) {
      console.error("Failed to fetch master data", error);
      toast.error("Failed to load master data");
    } finally {
      setLoadingUsers(false);
    }
  };

  // Call fetchMasterData once when component mounts
useEffect(() => {
  fetchMasterData();
}, []);

 const getCustomer = async (id) => {
  try {
    const response = await instance.get(`/customer?id=${id}`);
    if (response.data?.data) {
      const customer = response.data.data;
      setFormData({
        customer_name: customer.customer_name || "",
        customer_phone: customer.customer_phone || "",
        customer_email: customer.customer_email || "",
        region: customer.region || "",
        state: customer.state || "",
        city: customer.city || "",
        customer_business: customer.customer_business || "",
        assigned_to: customer.assigned_to || "",
        customer_code: customer.customer_code || "",
         createdAt: customer.createdAt || "",
  updatedAt: customer.updatedAt || "",
      });
    }
  } catch (error) {
    showError(error?.response?.data?.message || "Failed to fetch customer");
  }
};

useEffect(() => {
  if ((type === "Edit" || type === "View") && id) {
    getCustomer(id);
  }
}, [id, type]);




const downloadTemplate = () => {
  const headers = "customer_name,customer_phone\n";
  const sampleData = "John Doe,9876543210\nJane Smith,9123456789\n";
  const csvContent = headers + sampleData;

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  link.href = url;
  link.download = "customer_template.csv";
  link.click();
  document.body.removeChild(link);
};

const handleBulkUpload = async () => {
  if (!bulkFile) return showWarning("Please select a file");
  if (!bulkAssignedTo) return showWarning("Please select a user");

  setBulkUploading(true);
  try {
    const formDataObj = new FormData();
    formDataObj.append("file", bulkFile);
    formDataObj.append("assigned_to", bulkAssignedTo);

    const response = await instance.post("/customer/bulk-upload", formDataObj, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    if (response?.data?.success) {
      setUploadResults(response.data);
      showSuccess(response?.data?.message);
      setBulkFile(null);
    } else {
      showError(response?.data?.message || "Bulk upload failed");
    }
  } catch (error) {
    showError(error?.response?.data?.message || "Bulk upload failed");
  } finally {
    setBulkUploading(false);
  }
};

const handleSubmit = async (e) => {
  e.preventDefault();
  const validationErrors = validate();
  if (Object.keys(validationErrors).length > 0) {
    showWarning("Please fill all required fields");
    setErrors(validationErrors);
    return;
  }

  setIsSubmitting(true);
  try {
    const payload = {
      ...formData,
      assigned_to: Number(formData.assigned_to),
      city: Number(formData.city),
      customer_business: Number(formData.customer_business),
      region: Number(formData.region),
      state: Number(formData.state),
    };
    const response = await instance.post("/customer", payload);

    if (response?.status === 200) {
      showSuccess(response?.data?.message || "Customer added successfully");
     router.push("/admin/customers");
    }
  } catch (error) {
    const backendErrors = error?.response?.data?.error?.errors;
    if (backendErrors && Array.isArray(backendErrors)) {
      const newErrors = {};
      backendErrors.forEach((err) => {
        newErrors[err.field] = err.message;
      });
      setErrors(newErrors);
    } else {
      showError(error?.response?.data?.message || "Something went wrong");
    }
  } finally {
    setIsSubmitting(false);
  }
};

const downloadErrorReport = () => {
  if (!uploadResults?.errors || uploadResults.errors.length === 0) return showWarning("No errors to download");

  const headers = "Line #,Customer Name,Phone,Error\n";
  const rows = uploadResults.errors
    .map(err => `${err.line},"${err.customer_name}","${err.customer_phone}","${err.error}"`)
    .join("\n");

  const blob = new Blob([headers + rows], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `customer_upload_errors_${new Date().toISOString().split("T")[0]}.csv`;
  link.click();
};

  
  
const handleUpdate = async (e) => {
  e.preventDefault();
  const validationErrors = validate();
  if (Object.keys(validationErrors).length > 0) {
    showWarning("Please fill all required fields");
    setErrors(validationErrors);
    return;
  }

  setIsSubmitting(true);
  try {
    const payload = {
      id: Number(id),
      ...formData,
      assigned_to: Number(formData.assigned_to),
      city: Number(formData.city),
      customer_business: Number(formData.customer_business),
      region: Number(formData.region),
      state: Number(formData.state),
    };

    const response = await instance.put("/customer", payload);

    showSuccess(response?.data?.message || "Customer updated successfully");
    router.push("/admin/customers");
  } catch (error) {
    const backendErrors = error?.response?.data?.error?.errors;
    if (backendErrors && Array.isArray(backendErrors)) {
      const newErrors = {};
      backendErrors.forEach((err) => {
        newErrors[err.field] = err.message;
      });
      setErrors(newErrors);
    } else {
      showError(error?.response?.data?.message || "Failed to update customer");
    }
  } finally {
    setIsSubmitting(false);
  }
};
  useEffect(() => {
    if ((type === "Edit" || type === "View") && id) {
      getCustomer(id);
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
            {type === "View" ? "View Customer" : `${type} Customer`}
          </h2>
          <Button
            variant="default"
            size="sm"
            onClick={() => router.push("/admin/customers")}
            className="gap-2"
          >
            <ArrowLeft size={16} />
            <span className="hidden sm:inline">Back</span>
          </Button>
        </div>

        {type !== "View" && (
  <div className="flex gap-2 mb-4">
    <Button
      variant={!showBulkUpload ? "default" : "outline-default"}
      size="sm"
      onClick={() => setShowBulkUpload(false)}
    >
      Add Single
    </Button>
    <Button
      variant={showBulkUpload ? "default" : "outline-default"}
      size="sm"
      onClick={() => setShowBulkUpload(true)}
    >
      Bulk Upload
    </Button>
  </div>
)}
{!showBulkUpload ? (
        <form onSubmit={type === "Edit" ? handleUpdate : handleSubmit}>
          <div className="grid gap-4 sm:grid-cols-2 sm:gap-6">
            {/* Name */}
            <div>
              <label
                htmlFor="name"
                className="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-200"
              >
                Customer Name *
              </label>
             <input
  type="text"
  name="customer_name"
  value={formData.customer_name}
                onChange={handleChange}
                disabled={type === "View"}
                className="w-full border border-border rounded px-3 py-2 text-sm bg-background dark:text-gray-200"
                placeholder="Enter customer name"
              />
            {errors.customer_name && (
  <p className="text-red-500 text-xs mt-1">{errors.customer_name}</p>
)}
            </div>
           
            {/* Customer Code */}
{(type === "Edit" || type === "View") && (
  <div>
    <label
      htmlFor="customer_code"
      className="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-200"
    >
      Customer Code
    </label>
    <input
      type="text"
      name="customer_code"
      value={formData.customer_code || ""}
      disabled
      className="w-full border border-border rounded px-3 py-2 text-sm bg-background dark:text-gray-200"
      placeholder="Customer Code"
    />
  </div>
)}

            {/* SKU Code */}
            <div>
              <label
                htmlFor="skuCode"
                className="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-200"
              >
                Email
              </label>
             <input
  type="email"
  name="customer_email"
  value={formData.customer_email}
                onChange={handleChange}
                disabled={type === "View"}
                className="w-full border border-border rounded px-3 py-2 text-sm bg-background dark:text-gray-200"
                placeholder="Enter email"
              />
              {errors.customer_email && (
  <p className="text-red-500 text-xs mt-1">{errors.customer_email}</p>
)}
            </div>
            {/* phone number*/}
          <div>
  <label
    htmlFor="customer_phone"
    className="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-200"
  >
    Phone Number *
  </label>
  <input
    type="tel"
    name="customer_phone"
    value={formData.customer_phone}
    onChange={handleChange}
    disabled={type === "View"}
    className="w-full border border-border rounded px-3 py-2 text-sm bg-background dark:text-gray-200"
    placeholder="Enter phone number"
    pattern="[0-9]{7,15}" // optional: allows 7 to 15 digits
  />
  {errors.customer_phone && (
    <p className="text-red-500 text-xs mt-1">{errors.customer_phone}</p>
  )}
</div>

            {/* Region */}
          <div>
  <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-200">
    Region
  </label>
  <select
    name="region"
    value={formData.region}
    onChange={handleChange}
    disabled={type === "View"}
    className="w-full border border-border rounded px-3 py-2 text-sm bg-background dark:text-gray-200"
  >
    <option value="">Select Region</option>
    {regions.map((r) => (
      <option key={r.id} value={r.id}>
        {r.name}
      </option>
    ))}
  </select>
    {errors.region && <p className="text-red-500 text-xs mt-1">{errors.region}</p>}
</div>

            {/* city */}
           <div>
              <label
                htmlFor="unit"
                className="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-200"
              >
                City
              </label>
             <select
    name="city"
    value={formData.city}
    onChange={handleChange}
    disabled={type === "View"}
    className="w-full border border-border rounded px-3 py-2 text-sm bg-background dark:text-gray-200"
  >
    <option value="">Select City</option>
    {cities.map((c) => (
      <option key={c.id} value={c.id}>
        {c.name}
      </option>
    ))}
  </select>
             {errors.city && <p className="text-red-500 text-xs mt-1">{errors.city}</p>}
            </div>
            {/* state */}
            <div>
              <label
                htmlFor="unit"
                className="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-200"
              >
                State
              </label>
              <select
    name="state"
    value={formData.state}
    onChange={handleChange}
    disabled={type === "View"}
    className="w-full border border-border rounded px-3 py-2 text-sm bg-background dark:text-gray-200"
  >
    <option value="">Select State</option>
    {states.map((s) => (
      <option key={s.id} value={s.id}>
        {s.name}
      </option>
    ))}
  </select>
              {errors.state && <p className="text-red-500 text-xs mt-1">{errors.state}</p>}
            </div>
            {/* Customer business */}
            <div>
              <label
                htmlFor="unit"
                className="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-200"
              >
                Customer business
              </label>
              <select
    name="customer_business"
    value={formData.customer_business}
    onChange={handleChange}
    disabled={type === "View"}
    className="w-full border border-border rounded px-3 py-2 text-sm bg-background dark:text-gray-200"
  >
    <option value="">Select Business</option>
    {businesses.map((b) => (
      <option key={b.id} value={b.id}>
        {b.name}
      </option>
    ))}
  </select>
              {errors.customer_business && <p className="text-red-500 text-xs mt-1">{errors.customer_business}</p>}
            </div>
          {/* Assign to */}
           <div>
              <label
                htmlFor="unit"
                className="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-200"
              >
                Assign to *
              </label>
          <select
  name="assigned_to"
  value={formData.assigned_to}
  onChange={handleChange}
  
  disabled={type === "View"}
  className="w-full border border-border rounded px-3 py-2 text-sm bg-background dark:text-gray-200"
>
  <option value="">Select User</option>
  {users.map((u) => (
    <option key={u.id} value={u.id}>
      {u.first_name ? `${u.first_name} ${u.last_name}` : u.emp_code}
    </option>
  ))}
</select>

  {errors.assigned_to && <p className="text-red-500 text-xs mt-1">{errors.assigned_to}</p>}
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
                {type === "Edit" ? "Update " : "Add "}
              </Button>
            </div>
          )}
        </form>
        ) : (

       <div className="bg-white dark:bg-background border shadow rounded-lg p-6">
  <p className="mb-3 text-sm text-gray-700 dark:text-gray-200 bg-blue-100 dark:bg-blue-900 p-2 rounded">
    <strong>Instructions:</strong> Upload a CSV or Excel file with columns: <code>customer_name</code> and <code>customer_phone</code>.
    Assign all customers to a user.
  </p>

  <div className="grid gap-4 sm:grid-cols-2">
    <div>
      <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-200">
        Assign All To *
      </label>
      <select
        value={bulkAssignedTo}
        onChange={(e) => setBulkAssignedTo(e.target.value)}
        disabled={loadingUsers || bulkUploading}
        className="w-full border border-border rounded px-3 py-2 text-sm bg-background dark:text-gray-200"
      >
        <option value="">Select User</option>
        {users.map((u) => (
          <option key={u.id} value={u.id}>
            {u.first_name ? `${u.first_name} ${u.last_name}` : u.emp_code}
          </option>
        ))}
      </select>
    </div>

    <div>
      <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-200">
        Upload File *
      </label>
      <input
        type="file"
        accept=".csv,.xlsx,.xls"
        onChange={(e) => setBulkFile(e.target.files[0])}
        disabled={bulkUploading}
        className="w-full border border-border rounded px-3 py-2 text-sm bg-background dark:text-gray-200"
      />
      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">CSV or Excel file (max 10MB)</p>
    </div>
  </div>

  <div className="flex gap-2 mt-4">
    <Button
      disabled={bulkUploading || !bulkFile || !bulkAssignedTo}
      onClick={handleBulkUpload}
    >
      {bulkUploading ? "Uploading..." : "Upload"}
    </Button>
    <Button
      onClick={downloadTemplate}
      variant="outline"
      size="sm"
      className="gap-2"
    >
      <Download size={16} />
      Template
    </Button>
  </div>
</div>

)}

{uploadResults && (
  <div className="mt-4 p-4 border rounded bg-gray-50 dark:bg-gray-800">
    <h4 className="font-bold mb-2">Upload Summary</h4>
    <ul className="text-sm">
      <li>Total Records: {uploadResults.summary.total}</li>
      <li className="text-green-600">Successful: {uploadResults.summary.successful}</li>
      <li className="text-red-600">Failed: {uploadResults.summary.failed}</li>
      {uploadResults.summary.duplicatesSkipped > 0 && (
        <li>Duplicates Skipped: {uploadResults.summary.duplicatesSkipped}</li>
      )}
    </ul>

   {uploadResults.errors && uploadResults.errors.length > 0 && (
  <div className="mt-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm p-4">
    {/* Header with title and button */}
    <div className="flex justify-between items-center mb-3">
      <h5 className="font-semibold text-gray-900 dark:text-gray-100 text-lg">
        Error Details
      </h5>
      <Button
  variant="outline-danger"
  size="sm"
  onClick={downloadErrorReport}
  className="flex items-center gap-1 px-3 py-1.5 
             hover:bg-red-600 hover:text-white transition-colors duration-200"
>
  <Download size={16} /> Download Report
</Button>

    </div>

    {/* Table container */}
    <div className="overflow-auto max-h-64 border border-gray-200 dark:border-gray-700 rounded">
      <table className="w-full text-sm border-collapse">
        <thead className="bg-gray-100 dark:bg-gray-700 sticky top-0">
          <tr>
            <th className="border-b px-3 py-2 text-left text-gray-700 dark:text-gray-200">Line #</th>
            <th className="border-b px-3 py-2 text-left text-gray-700 dark:text-gray-200">Customer Name</th>
            <th className="border-b px-3 py-2 text-left text-gray-700 dark:text-gray-200">Phone</th>
            <th className="border-b px-3 py-2 text-left text-gray-700 dark:text-gray-200">Error</th>
          </tr>
        </thead>
        <tbody>
          {uploadResults.errors.map((err, idx) => (
            <tr key={idx} className={idx % 2 === 0 ? "bg-gray-50 dark:bg-gray-900" : ""}>
              <td className="border-b px-3 py-2">{err.line}</td>
              <td className="border-b px-3 py-2">{err.customer_name}</td>
              <td className="border-b px-3 py-2">{err.customer_phone}</td>
              <td className="border-b px-3 py-2 text-red-600 font-medium">{err.error}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
)}


  </div>
)}

      </div>
    </div>
  );
};

export default AddCustomer;
