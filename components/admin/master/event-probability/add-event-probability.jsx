




"use client";
import React, { useState, useEffect } from "react";
import { showSuccess, showError } from "@/lib/toastUtils";
import { useRouter, useSearchParams } from "next/navigation";
import axiosInstance from "@/lib/axiosInstance";
import { Button } from "@/components/ui/button";
import { Loader, ArrowLeft } from "lucide-react";

const AddEventProbability = ({ type }) => {
    const instance = axiosInstance();
    const router = useRouter();
    const searchParams = useSearchParams();
    const id = searchParams.get("id");

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        name: "",

    });
    const [errors, setErrors] = useState({});

    // Validation
    const validate = () => {
        const errors = {};
        if (!formData.name) errors.name = "Name is required";
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

    // Fetch
    //  data
    const getEnquiryStatus = async (id) => {
        try {
            const response = await instance.get(`/eventsOrderProbability?id=${id}`);
            const data = response.data?.data;

            if (data) {
                setFormData({
                    name: data.name || "",
                    //   enquiry_id: data.id || "",
                    createdAt: data.createdAt || "",
                    updatedAt: data.updatedAt || "",
                });
            }
        } catch (error) {
            console.error("Failed to load Event probability:", error);
            showError("Failed to load Event probability data");
        }
    };

    useEffect(() => {
        if ((type === "Edit" || type === "View") && id) {
            getEnquiryStatus(id);
        }
    }, [id, type]);

    // Submit / Update
    const handleSubmit = async (e) => {
        e.preventDefault();
        const validationErrors = validate();
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }
        setIsSubmitting(true);

        try {
            const payload = { name: formData.name, id: Number(id) };

            let response;

            if (type === "Edit") {
                await instance.put(`/eventsOrderProbability?id=${id}`, payload);

                showSuccess(response?.data?.message || "Event probability updated successfully!");
            } else {
                response = await instance.post("/eventsOrderProbability", payload);
                showSuccess(response?.data?.message || "Event probability created successfully!");
            }

            router.push("/admin/event-probability");
        } catch (error) {
            console.error(error);
            showError(error?.response?.data?.message || "Something went wrong");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="p-4 flex flex-col gap-6">
            <div className="bg-white dark:bg-background border shadow rounded-lg p-6">
                <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-4">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-gray-200">
                        {type === "View" ? "View Event probability" : `${type} Event probability`}
                    </h2>
                    <Button
                        variant="default"
                        size="sm"
                        onClick={() => router.push("/admin/event-probability")}
                        className="gap-2"
                    >
                        <ArrowLeft size={16} />
                        <span className="hidden sm:inline">Back</span>
                    </Button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="grid gap-4 sm:grid-cols-2 sm:gap-6">
                        {/* Name */}
                        <div>
                            <label
                                htmlFor="name"
                                className="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-200"
                            >
                                Name
                            </label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                disabled={type === "View"}
                                className="w-full border border-border rounded px-3 py-2 text-sm bg-background dark:text-gray-200"
                                placeholder="Name"
                            />
                            {errors.name && (
                                <p className="text-red-500 text-xs mt-1">{errors.name}</p>
                            )}
                        </div>

                        {/* Created At (View Only) */}
                        {type === "View" && (
                            <>
                                <div>
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

                                {/* Updated At */}
                                <div>
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


                            </>
                        )}
                    </div>

                    {/* Submit Button */}
                    {type !== "View" && (
                        <div className="flex justify-end mt-4">
                            <Button
                                type="submit"
                                disabled={isSubmitting}
                                variant="default"
                                size="sm"
                                className="gap-2"
                            >
                                {isSubmitting && <Loader className="animate-spin w-5 h-5 mr-2" />}
                                {type === "Edit" ? "Update" : "Add "}
                            </Button>
                        </div>
                    )}
                </form>
            </div>
        </div>
    );
};

export default AddEventProbability;
