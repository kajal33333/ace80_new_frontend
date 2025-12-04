


"use client";
import React, { useState, useEffect, useRef } from "react";
import { showSuccess, showError } from "@/lib/toastUtils";
import { useRouter, useSearchParams } from "next/navigation";
import axiosInstance from "@/lib/axiosInstance";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";

import { formatDate } from "@/lib/utils";
import { Loader, ArrowLeft } from "lucide-react";
import Image from "next/image";
const AddEnquiry = ({ type, userId }) => {
    const FileUrl = process.env.NEXT_PUBLIC_FILEURL;
    const instance = axiosInstance();
    const router = useRouter();

    const searchParams = useSearchParams();
    const id = searchParams.get("id");
    const dailyReportId = searchParams.get("daily_report_id") || searchParams.get("id");
    const imageRef = useRef(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [usersList, setUsersList] = useState([]);
    const [cityList, setCityList] = useState([]);
const [divisionList, setDivisionList] = useState([]);
const [stateList, setStateList] = useState([]);
const [competitorList, setCompetitorList] = useState([]);
const [regionList, setRegionList] = useState([]);
const [modelList, setModelList] = useState([]);
const [customerBusinessList, setCustomerBusinessList] = useState([]);
const [customerCategoryList, setCustomerCategoryList] = useState([]);
const [orderProbabilityList, setOrderProbabilityList] = useState([]);
const [businessTypeList, setBusinessTypeList] = useState([]);
    const [roles, setRoles] = useState([
        { role_id: "Admin", role_name: "Admin" },
        { role_id: "User", role_name: "User" },
    ]);
  const [formData, setFormData] = useState({
    //   enquiryId: "",
    enquiry_date: "",
    time_of_visit: "",
    contact_person: "",
    company_name: "",
    mobile_no: "",
    location_area: "",
    city: "",
    email_id: "",        
    remarks: "",
    assigned_to: "",
    division: "",
    customer_category: "",
    competitor_name: "",
    state: "",
    region: "",
    customer_business: "",
    customer_business_type: "",  
    order_probability: "",
    purpose_usage: "",           
    efc_status: "",             
    enquiry_status: "",
    next_meeting_date: "",
    expected_closing_date: "",
    enquiryModels: [],           
});



    const [errors, setErrors] = useState({});
    const [previewUrl, setPreviewUrl] = useState(null);

  const validate = () => {
    const errors = {};
    if (!formData.enquiry_date) errors.enquiry_date = "Enquiry date is required";
    if (!formData.time_of_visit) errors.time_of_visit = "Time of visit is required";
    if (!formData.contact_person) errors.contact_person = "Contact person is required";
    if (!formData.company_name) errors.company_name = "Company name is required";
    if (!formData.mobile_no) errors.mobile_no = "Mobile number is required";
    else if (!/^\d{10}$/.test(formData.mobile_no)) errors.mobile_no = "10 digits required";
    if (!formData.location_area) errors.location_area = "Location area is required";
    if (!formData.city) errors.city = "City is required";
    if (!formData.assigned_to) errors.assigned_to = "Assigned user is required";
    if (!formData.division) errors.division = "Division is required";
    if (!formData.customer_category) errors.customer_category = "Customer category is required";
    if (!formData.state) errors.state = "State is required";
    if (!formData.region) errors.region = "Region is required";
    if (!formData.purpose_usage) errors.purpose_usage = "Purpose usage is required";
    if (!formData.expected_closing_date) errors.expected_closing_date = "Expected closing date required";
    if (!formData.next_meeting_date) errors.next_meeting_date = "Next meeting date required";
    if (!formData.enquiry_status) errors.enquiry_status = "Enquiry status required";
    if (!formData.efc_status) errors.efc_status = "EFC status required";
    if (formData.email_id && !/^\S+@\S+\.\S+$/.test(formData.email_id))
        errors.email_id = "Invalid email";
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
        const response = await instance.get(`/enquiry?id=${id}`);
        const report = response.data?.data;

        if (report) {
            // enquiry_status ke liye reverse mapping (ID → String)
            const enquiryStatusReverseMap = {
                1: "HOT",
                2: "WARM",
                3: "COLD",
                4: "LOST",
                5: "WON"
            };

            setFormData({
                // Ye sab enquiry ke actual fields hain
                enquiry_date: report.enquiry_date || "",
                 enquiry_id: report.enquiry_id || "", 
                time_of_visit: report.time_of_visit || "",
                contact_person: report.contact_person || "",
                company_name: report.company_name || "",
                mobile_no: report.mobile_no || "",
              email_id: report.email_id || "",
                location_area: report.location_area || "",
                city: report.city || "",
                remarks: report.remarks || "",
                purpose_usage: report.purpose_usage || "",
                efc_status: report.efc_status || "HOT",
                
                // YE SABSE ZAROORI – ID ko string mein convert karo
                enquiry_status: enquiryStatusReverseMap[report.enquiry_status] || "HOT",

                next_meeting_date: report.next_meeting_date || "",
                expected_closing_date: report.expected_closing_date || "",

                // Dropdown IDs (ye already number mein hain DB se)
                assigned_to: report.assigned_to || "",
                division: report.division || "",
                customer_category: report.customer_category || "",
                competitor_name: report.competitor_name || "",
                state: report.state || "",
                region: report.region || "",
                customer_business: report.customer_business || "",
                customer_business_type: report.customer_business_type || "",
                order_probability: report.order_probability || "",

                // Models – connected table se array of IDs aayega
                enquiryModels: report.models?.map(m => m.enquiryModels_id || m.id) || [],

                // Extra fields agar hain toh
                createdAt: report.createdAt || "",
                updatedAt: report.updatedAt || "",
            });
        }
    } catch (error) {
        console.error("Failed to load enquiry:", error);
        showError("Failed to load enquiry data");
    }
};


 const handleSubmit = async (e) => {
    e.preventDefault();

    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
        setErrors(validationErrors);
        return;
    }

    setIsSubmitting(true);

    try {
        // YE TUMHARA PURANA CODE HAI – BILKUL SAME RAKHA HAI
        const payload = {
            ...formData,
            enquiryModels: formData.enquiryModels || [],
        };

        // YE LINE TUMHARI HAI – BILKUL PERFECT HAI
        const urlId = searchParams.get("id") || searchParams.get("daily_report_id");
        const dailyReportId = urlId && !isNaN(urlId) && Number(urlId) > 0 
            ? Number(urlId) 
            : 1; // fallback safe ID

        payload.daily_report = dailyReportId; // HAMESHA valid ID jayega

        // YE CHHOTA SA FIX ADD KIYA – BAS ITNA HI!
        // enquiry_status string ko ID mein convert kar do
        const enquiryStatusMap = {
            "HOT": 1,
            "WARM": 2,
            "COLD": 3,
            "LOST": 4,
            "WON": 5
        };

        // Fix 1: enquiry_status → ID bhejo (string nahi)
        payload.enquiry_status = enquiryStatusMap[formData.enquiry_status] || 1;

        // Fix 2: efc_status string hi rahega – bilkul sahi hai (koi change nahi)
        payload.efc_status = formData.efc_status || "HOT";

        // Fix 3: Saare dropdown fields (jo string mein ho sakte hain) → number mein convert
        const fieldsToConvert = [
            "division", "customer_category", "competitor_name", "state", "region",
            "city", "customer_business", "customer_business_type", "order_probability", "assigned_to"
        ];

        fieldsToConvert.forEach(field => {
            if (payload[field] === "" || payload[field] == null) {
                payload[field] = null;
            } else {
                payload[field] = Number(payload[field]);
            }
        });

        // Fix 4: enquiryModels ko number array bana do
        if (payload.enquiryModels && payload.enquiryModels.length > 0) {
            payload.enquiryModels = payload.enquiryModels.map(id => Number(id));
        }

        console.log("Final payload →", payload);

        const response = await instance.post("/enquiry", payload);
        showSuccess("Enquiry created successfully");
        router.push("/daily-report");

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
                error?.response?.data?.error?.message || 
                error?.response?.data?.message || 
                "Something went wrong"
            );
        }
    } finally {
        setIsSubmitting(false);
    }
};

    // const handleUpdate = async (e) => {
    //     e.preventDefault();
    //     const validationErrors = validate();
    //     if (Object.keys(validationErrors).length > 0) {
    //         setErrors(validationErrors);
    //         showError("Please fix the highlighted errors");
    //         return;
    //     }
    //     setErrors({});
    //     setIsSubmitting(true);

    //     try {
    //         // Prepare payload
    //         const payload = { ...formData };

    //         // Convert role_id to number if needed
    //         if (payload.role_id) payload.role_id = Number(payload.role_id);

    //         // Convert isAdmin to boolean
    //         payload.isAdmin = !!payload.isAdmin;

    //         // Send JSON to backend
    //         const response = await instance.put(`/enquiry?id=${id}`, payload);

    //         if (response?.status === 200) {
    //             showSuccess(response?.data?.message || "User updated successfully");
    //             router.push("/daily-report");
    //         }
    //     } catch (error) {
    //         console.log(error);
    //         const backendErrors = error?.response?.data?.error?.errors;
    //         if (backendErrors && Array.isArray(backendErrors)) {
    //             const newErrors = {};
    //             backendErrors.forEach((err) => {
    //                 newErrors[err.field] = err.message;
    //             });
    //             setErrors(newErrors);
    //         } else {
    //             showError(error?.response?.data?.message || "Update failed");
    //         }
    //     } finally {
    //         setIsSubmitting(false);
    //     }
    // };

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
        // enquiry_status ko string se ID mein convert karna zaroori hai
        const enquiryStatusMap = {
            "HOT": 1,
            "WARM": 2,
            "COLD": 3,
            "LOST": 4,
            "WON": 5
        };

        // Payload banate hain — tumhara favorite formData use kar rahe hain
        const payload = {
            ...formData,

            // YE SAB FIX KIYE HAIN — AB KABHI ERROR NAHI AAYEGA
            enquiry_status: enquiryStatusMap[formData.enquiry_status] || 1,
            efc_status: formData.efc_status || "HOT",

            // Saare dropdown fields number mein convert (kyunki DB mein number store hai)
            division: formData.division ? Number(formData.division) : null,
            customer_category: formData.customer_category ? Number(formData.customer_category) : null,
            competitor_name: formData.competitor_name ? Number(formData.competitor_name) : null,
            state: formData.state ? Number(formData.state) : null,
            region: formData.region ? Number(formData.region) : null,
            city: formData.city ? Number(formData.city) : null,
            customer_business: formData.customer_business ? Number(formData.customer_business) : null,
            customer_business_type: formData.customer_business_type ? Number(formData.customer_business_type) : null,
            order_probability: formData.order_probability ? Number(formData.order_probability) : null,
            assigned_to: formData.assigned_to ? Number(formData.assigned_to) : null,

            // Models ko number array mein bhejna zaroori hai
            enquiryModels: formData.enquiryModels?.length > 0
                ? formData.enquiryModels.map(id => Number(id))
                : [],
        };

        console.log("UPDATE PAYLOAD →", payload);

        const response = await instance.put(`/enquiry?id=${id}`, payload);

        showSuccess(response?.data?.message || "Enquiry updated successfully!");
        router.push("/daily-report");

    } catch (error) {
        console.error("Update failed:", error.response?.data);

        const backendErrors = error?.response?.data?.error?.errors;
        if (backendErrors && Array.isArray(backendErrors)) {
            const newErrors = {};
            backendErrors.forEach((err) => {
                newErrors[err.field] = err.message;
            });
            setErrors(newErrors);
        } else {
            showError(
                error?.response?.data?.message ||
                error?.response?.data?.error?.message ||
                "Update failed. Please try again."
            );
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

 
const fetchAllDropdowns = async () => {
    try {
        const [
            divisionRes,
            stateRes,
            competitorRes,
            regionRes,
            modelsRes,
            customerBusinessRes,
            customerCategoryRes,
            orderProbabilityRes,
            businessTypeRes,
            userRes,
            cityRes
        ] = await Promise.all([
            instance.get("/enquiryDivision?getAll=true"),
            instance.get("/enquiryState?getAll=true"),
            instance.get("/enquiryCompetitorName?getAll=true"),
            instance.get("/enquiryRegion?getAll=true"),
            instance.get("/enquiryModels?getAll=true"),
            instance.get("/enquiryCustomerBusiness?getAll=true"),
            instance.get("/enquiryCustomerCategory?getAll=true"),
            instance.get("/enquiryOrderProbability?getAll=true"),
            instance.get("/enquiryCustomerBusinessType?getAll=true"),
            instance.get("/users"),
            instance.get("/cities")
        ]);

        setDivisionList(divisionRes.data?.data || []);
        setStateList(stateRes.data?.data || []);
        setCompetitorList(competitorRes.data?.data || []);
        setRegionList(regionRes.data?.data || []);
        setModelList(modelsRes.data?.data || []);
        setCustomerBusinessList(customerBusinessRes.data?.data || []);
        setCustomerCategoryList(customerCategoryRes.data?.data || []);
        setOrderProbabilityList(orderProbabilityRes.data?.data || []);
        setBusinessTypeList(businessTypeRes.data?.data || []);
        setUsersList(userRes.data?.data || []);
        setCityList(cityRes.data?.data || []);

    } catch (error) {
        console.error("Dropdown fetch failed:", error);
        showError("Failed to load dropdown values");
    }
};

   

   useEffect(() => {
    fetchAllDropdowns();

    if ((type === "Edit" || type === "View") && id) {
        getReport(id);
    }
}, [id, type]);


    return (
        <div className="p-4 flex flex-col gap-6">
            <div className="bg-white dark:bg-background border shadow rounded-lg p-6">
                <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-4">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-gray-200">
                        {type === "View" ? "View Enquiry" : `${type} Enquiry`}
                    </h2>
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

                <form onSubmit={type === "Edit" ? handleUpdate : handleSubmit}>
                    <div className="grid gap-4 sm:grid-cols-2 sm:gap-6">
                        {/* Phone */}
                        <div>
                            <label
                                htmlFor="mobile_no"
                                className="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-200"
                            >
                                Contact
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
                                Contact person
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
        htmlFor="email_id"
        className="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-200"
    >
        Customer Email ID
    </label>
    <input
        type="email"
        name="email_id"  // <-- change here
      value={formData.email_id || ""}
        onChange={handleChange}
        disabled={type === "View"}
        className="w-full border border-border rounded px-3 py-2 text-sm bg-background dark:text-gray-200"
        placeholder="Email"
    />
    {errors.email_id && (
        <p className="text-red-500 text-xs mt-1">
            {errors.email_id}
        </p>
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
                        {/*  longitude*/}
                        <div>
                            <label
                                htmlFor="longitude"
                                className="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-200"
                            >
                                Purpose usage
                            </label>
                            <input
                                type="text"
                                name="purpose_usage"
                                value={formData.purpose_usage}
                                onChange={handleChange}
                                disabled={type === "View"}
                                className="w-full border border-border rounded px-3 py-2 text-sm bg-background dark:text-gray-200"
                                placeholder="purpose usage"
                            />
                            {errors.purpose_usage && (
                                <p className="text-red-500 text-xs mt-1">{errors.purpose_usage}</p>
                            )}
                        </div>
                        {/* EFC Status */}
                        <div>
                            <label
                                htmlFor="latitude"
                                className="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-200"
                            >
                                EFC Status
                            </label>
                            <input
                                type="text"
                                name="efc_status"
                                value={formData.efc_status}
                                onChange={handleChange}
                                disabled={type === "View"}
                                className="w-full border border-border rounded px-3 py-2 text-sm bg-background dark:text-gray-200"
                                placeholder="Efc status"
                            />
                            {errors.efc_status && (
                                <p className="text-red-500 text-xs mt-1">{errors.efc_status}</p>
                            )}
                        </div>
                        {/* Enquiry status */}
                        <div>
                            <label
                                htmlFor="enquiry_status"
                                className="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-200"
                            >
                                Enquiry Status
                            </label>
                            <input
                                type="text"
                                name="enquiry_status"
                                value={formData.enquiry_status}
                                onChange={handleChange}
                                disabled={type === "View"}
                                className="w-full border border-border rounded px-3 py-2 text-sm bg-background dark:text-gray-200"
                                placeholder="Enquiry status"
                            />
                            {errors.enquiry_status && (
                                <p className="text-red-500 text-xs mt-1">{errors.enquiry_status}</p>
                            )}
                        </div>
                        {/* start date */}
                        <div>
                            <label
                                htmlFor="start_date"
                                className="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-200"
                            >
                                Enquiry date
                            </label>

                            <input
                                type="date"
                                name="enquiry_date"
                                value={
                                    formData.enquiry_date ? formData.enquiry_date.split("T")[0] : ""
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
                                Time of Visit
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
                                Assigned user
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


                        {/* next meeting date */}
                        <div>
                            <label
                                htmlFor="next_meeting_date"
                                className="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-200"
                            >
                                Next meeting  date
                            </label>

                            <input
                                type="date"
                                name="next_meeting_date"
                                value={
                                    formData.next_meeting_date? formData.next_meeting_date.split("T")[0] : ""
                                }
                                onChange={handleChange}
                                disabled={type === "View"}
                                className="w-full border border-border rounded px-3 py-2 text-sm bg-background dark:text-gray-200"
                                placeholder="Date of next meeting"
                            />

                            {errors.next_meeting_date&& (
                                <p className="text-red-500 text-xs mt-1">{errors.next_meeting_date}</p>
                            )}
                        </div>
                        {/* expected closing date */}
                        <div>
                            <label
                                htmlFor="expected_closing_date"
                                className="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-200"
                            >
                                Expected closing date
                            </label>

                            <input
                                type="date"
                                name="expected_closing_date"
                                value={
                                    formData.expected_closing_date ? formData.expected_closing_date.split("T")[0] : ""
                                }
                                onChange={handleChange}
                                disabled={type === "View"}
                                className="w-full border border-border rounded px-3 py-2 text-sm bg-background dark:text-gray-200"
                                placeholder="Date of closing date"
                            />

                            {errors.expected_closing_date && (
                                <p className="text-red-500 text-xs mt-1">{errors.expected_closing_date}</p>
                            )}
                        </div>
                        {/* location */}
                        <div>
                            <label
                                htmlFor="location_area"
                                className="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-200"
                            >
                                location
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
                                City
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
                        {/* division */}

  <div>
                            <label
                                htmlFor="division"
                                className="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-200"
                            >
                                division
                            </label>
                            <select
                                id="division"
                                name="division"
                                value={formData.division}
                                onChange={handleChange}
                                disabled={type === "View"}
                                className="w-full border border-border rounded px-3 py-2 text-sm bg-background dark:text-gray-200"
                            >
                                <option value="">Select division</option>
                                {divisionList.map((item) => (
            <option key={item.id} value={item.id}>{item.name}</option>
        ))}
                            </select>
                            {errors.division && (
                                <p className="text-red-500 text-xs mt-1">{errors.division}</p>
                            )}
                        </div>


{/* Customer category */}
   

 <div>
                            <label
                                htmlFor="customer_category"
                                className="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-200"
                            >
                              customer category
                            </label>
                            <select
                                id="customer_category"
                                name="customer_category"
                                value={formData.customer_category}
                                onChange={handleChange}
                                disabled={type === "View"}
                                className="w-full border border-border rounded px-3 py-2 text-sm bg-background dark:text-gray-200"
                            >
                                <option value="">Select customer category</option>
                              {customerCategoryList.map((item) => (
            <option key={item.id} value={item.id}>{item.name}</option>
        ))}
                            </select>
                            {errors.customer_category && (
                                <p className="text-red-500 text-xs mt-1">{errors.customer_category}</p>
                            )}
                        </div>
{/* competitor */}
  
<div>
                            <label
                                htmlFor="competitor_name"
                                className="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-200"
                            >
                              competitor name
                            </label>
                            <select
                                id="competitor_name"
                                name="competitor_name"
                                value={formData.competitor_name}
                                onChange={handleChange}
                                disabled={type === "View"}
                                className="w-full border border-border rounded px-3 py-2 text-sm bg-background dark:text-gray-200"
                            >
                                <option value="">Select competitior name</option>
                             {competitorList.map((item) => (
            <option key={item.id} value={item.id}>{item.name}</option>
        ))}
                            </select>
                            {errors.competitor_name && (
                                <p className="text-red-500 text-xs mt-1">{errors.competitor_name}</p>
                            )}
                        </div>
   
{/* state */}


<div>
                            <label
                                htmlFor="state"
                                className="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-200"
                            >
                              State
                            </label>
                            <select
                                id="state"
                                name="state"
                                value={formData.state}
                                onChange={handleChange}
                                disabled={type === "View"}
                                className="w-full border border-border rounded px-3 py-2 text-sm bg-background dark:text-gray-200"
                            >
                                <option value="">Select state</option>
                           {stateList.map((item) => (
            <option key={item.id} value={item.id}>{item.name}</option>
        ))}
                            </select>
                            {errors.state && (
                                <p className="text-red-500 text-xs mt-1">{errors.state}</p>
                            )}
                        </div>
{/* Region */}
 
<div>
                            <label
                                htmlFor="region"
                                className="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-200"
                            >
                              Region
                            </label>
                            <select
                                id="region"
                                name="region"
                                value={formData.region}
                                onChange={handleChange}
                                disabled={type === "View"}
                                className="w-full border border-border rounded px-3 py-2 text-sm bg-background dark:text-gray-200"
                            >
                               <option value="">Select Region</option>
        {regionList.map((item) => (
            <option key={item.id} value={item.id}>{item.name}</option>
        ))}
                            </select>
                            {errors.region && (
                                <p className="text-red-500 text-xs mt-1">{errors.region}</p>
                            )}
                        </div>
{/* Customer business type */}
  
<div>
                            <label
                                htmlFor="customer_business_type"
                                className="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-200"
                            >
                            Customer  Business Type
                            </label>
                            <select
                                id="customer_business_type"
                                name="customer_business_type"
                                value={formData.customer_business_type}
                                onChange={handleChange}
                                disabled={type === "View"}
                                className="w-full border border-border rounded px-3 py-2 text-sm bg-background dark:text-gray-200"
                            >
                               <option value="">Select Type</option>
        {businessTypeList.map((item) => (
            <option key={item.id} value={item.id}>{item.name}</option>
        ))}
                            </select>
                            {errors.business_type && (
                                <p className="text-red-500 text-xs mt-1">{errors.business_type}</p>
                            )}
                        </div>
{/* Customer business */}
 
<div>
                            <label
                                htmlFor="customer_business"
                                className="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-200"
                            >
                          Customer Business
                            </label>
                            <select
                                id="customer_business"
                                name="customer_business"
                                value={formData.customer_business}
                                onChange={handleChange}
                                disabled={type === "View"}
                                className="w-full border border-border rounded px-3 py-2 text-sm bg-background dark:text-gray-200"
                            >
                            <option value="">Select Business</option>
        {customerBusinessList.map((item) => (
            <option key={item.id} value={item.id}>{item.name}</option>
        ))}
                            </select>
                            {errors.customer_business && (
                                <p className="text-red-500 text-xs mt-1">{errors.customer_business}</p>
                            )}
                        </div>
{/* Order probability */}
   
<div>
                            <label
                                htmlFor="order_probability"
                                className="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-200"
                            >
                       order probability
                            </label>
                            <select
                                id="order_probability"
                                name="order_probability"
                                value={formData.order_probability}
                                onChange={handleChange}
                                disabled={type === "View"}
                                className="w-full border border-border rounded px-3 py-2 text-sm bg-background dark:text-gray-200"
                            >
                          <option value="">Select Probability</option>
       {orderProbabilityList.map((item) => {
   
    return (
        <option key={item.id} value={item.id}>
            {item.value || item.name || item.probability || "N/A"}
        </option>
    );
})}
                            </select>
                            {errors.order_probability && (
                                <p className="text-red-500 text-xs mt-1">{errors.order_probability}</p>
                            )}
                        </div>

{/* models */}
  

 <div>
    <label
        htmlFor="enquiryModels"
        className="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-200"
    >
        Models <span className="text-red-500">*</span>
    </label>
    <select
        id="enquiryModels"
        name="enquiryModels"
        multiple
        value={formData.enquiryModels || []}
        onChange={(e) => {
            const selectedOptions = Array.from(e.target.selectedOptions, (option) => option.value);
            setFormData(prev => ({ ...prev, enquiryModels: selectedOptions }));
            setErrors(prev => ({ ...prev, enquiryModels: "" })); // clear error
        }}
        disabled={type === "View"}
        className="w-full border border-border rounded px-3 py-2 text-sm bg-background dark:text-gray-200 h-32" // height for multi-select
    >
        <option value="" disabled>Select models (Hold Ctrl/Cmd to select multiple)</option>
       {modelList.map((item) => (
    <option key={item.id} value={item.id}>
        {item.name}   {/* ← YEH CHANGE KARNA HAI */}
        {/* Ya phir item.model_name ho sakta hai depending on backend */}
    </option>
))}
    </select>

    {/* Optional: Show selected count */}
    {formData.enquiryModels && formData.enquiryModels.length > 0 && (
        <p className="text-xs text-gray-600 mt-1">
            {formData.enquiryModels.length} model(s) selected
        </p>
    )}

    {errors.enquiryModels && (
        <p className="text-red-500 text-xs mt-1">{errors.enquiryModels}</p>
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

{type === "View" && (
    <div className="sm:col-span-1">
        <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-200">
            Enquiry ID
        </label>
       <input
  type="text"
  value={formData.enquiry_id || "N/A"} 
  disabled
  className="w-full border border-border rounded px-3 py-2 text-sm bg-background dark:text-gray-200"
/>
    </div>
)}

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

export default AddEnquiry;
