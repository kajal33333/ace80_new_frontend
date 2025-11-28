
"use client";

import React, { useState, useEffect, useRef } from "react";
import { showSuccess, showError, showWarning } from "@/lib/toastUtils";
import { useRouter, useSearchParams } from "next/navigation";
import axiosInstance from "@/lib/axiosInstance";
import { Button } from "@/components/ui/button";
import { Loader, ArrowLeft } from "lucide-react";
import Image from "next/image";

const AddProduct = ({ type }) => {
  const instance = axiosInstance();
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  const FileUrl = process.env.NEXT_PUBLIC_FILEURL;
  const imageRef = useRef(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    skuCode: "",
    unit: "",
    quantity: "",
    price: "",
    category: "",
    description: "",
    image: null,
    createdAt:"",
    updatedAt: "",
  });
  const [errors, setErrors] = useState({});

  const unitOptions = ["kg", "g", "ml", "l", "ton"];

  const validate = () => {
    const newErrors = {};
    if (!formData?.name.trim()) newErrors.name = "Name is required";
    if (!formData?.skuCode.trim()) newErrors.skuCode = "SKU Code is required";
    if (!formData?.quantity.trim()) newErrors.quantity = "Quantity is required";
    if (!formData?.unit) newErrors.unit = "Unit is required";
    if (!formData?.price) newErrors.price = "Price is required";
    if (!formData?.category.trim()) newErrors.category = "Category is required";
    if (!formData?.description.trim()) newErrors.description = "Description is required";
    if (!formData?.image) newErrors.image = "Image is required";
    if (formData?.image && formData?.image?.size > 2 * 1024 * 1024) {
      newErrors.image = "Image size should not exceed 2MB";
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

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    const maxSize = 2 * 1024 * 1024;

    if (!file) {
      setFormData((prev) => ({ ...prev, image: null }));
      setErrors((prev) => ({ ...prev, image: "Image is required" }));
      setPreviewUrl(null);
      return;
    }

    if (!allowedTypes.includes(file.type)) {
      imageRef.current.value = "";
      setErrors((prev) => ({
        ...prev,
        image: "Only .jpg, .jpeg, .png, or .webp files are allowed",
      }));
      setFormData((prev) => ({ ...prev, image: null }));
      setPreviewUrl(null);
      return;
    }

    if (file.size > maxSize) {
      imageRef.current.value = "";
      setErrors((prev) => ({
        ...prev,
        image: "Image size should not exceed 2MB",
      }));
      setFormData((prev) => ({ ...prev, image: null }));
      setPreviewUrl(null);
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
    setFormData((prev) => ({ ...prev, image: file }));
    setErrors((prev) => ({ ...prev, image: "" }));
  };

  const handleImageDelete = () => {
    imageRef.current.value = "";
    setFormData((prev) => ({ ...prev, image: null }));
    setErrors((prev) => ({ ...prev, image: "Image is required" }));
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
  };

  const getProduct = async (id) => {
    try {
      const response = await instance.get(`/product-master/${id}`);
      if (response.data?.data) {
        const product = response.data.data;
        // Assuming unit comes as "5kg", split into quantity and unit
        const unitMatch = product.unit.match(/^(\d+)([a-zA-Z]+)$/);
        const quantity = unitMatch ? unitMatch[1] : "";
        const unit = unitMatch ? unitMatch[2] : "";
        setFormData({
          name: product.name || "",
          skuCode: product.skuCode || "",
          unit: unit || "",
          quantity: quantity || "",
          price: product.price || "",
          category: product.category || "",
          description: product.description || "",
          image: product.image || null,
          createdAt: product.createdAt || "",
          updatedAt: product.updatedAt || "",
        });
        setPreviewUrl(null);
      }
    } catch (error) {
      showError(error?.response?.data?.message || "Failed to fetch product");
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
      // Combine quantity and unit into a single unit field
      const combinedUnit = `${formData.quantity}${formData.unit}`;
      Object.entries(formData).forEach(([key, value]) => {
        if (key === "image" && typeof value === "string") return;
        if (key === "quantity") return; // Skip quantity as it's combined with unit
        if (key === "unit") {
          formDataToSend.append(key, combinedUnit);
        } else {
          formDataToSend.append(key, value);
        }
      });
      const response = await instance.post("/product-master/", formDataToSend);
      if (response?.status === 200) {
        showSuccess(response?.data?.message || "Product added successfully");
        router.push("/admin/products-list");
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
    setErrors({});
    setIsSubmitting(true);
    try {
      const formDataToSend = new FormData();
      // Combine quantity and unit into a single unit field
      const combinedUnit = `${formData.quantity}${formData.unit}`;
      Object.entries(formData).forEach(([key, value]) => {
        if (key === "image" && typeof value === "string") return;
        if (key === "quantity") return; // Skip quantity as it's combined with unit
        if (key === "unit") {
          formDataToSend.append(key, combinedUnit);
        } else {
          formDataToSend.append(key, value);
        }
      });
      const response = await instance.put(`/product-master/${id}`, formDataToSend);
      if (response?.status === 200) {
        showSuccess(response?.data?.message || "Product updated successfully");
        router.push("/admin/products-list");
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

  useEffect(() => {
    if ((type === "Edit" || type === "View") && id) {
      getProduct(id);
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
            {type === "View" ? "View Product" : `${type} Product`}
          </h2>
          <Button
            variant="default"
            size="sm"
            onClick={() => router.push("/admin/products-list")}
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
                htmlFor="name"
                className="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-200"
              >
                Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                disabled={type === "View"}
                className="w-full border border-border rounded px-3 py-2 text-sm bg-background dark:text-gray-200"
                placeholder="Product Name"
              />
              {errors.name && (
                <p className="text-red-500 text-xs mt-1">{errors.name}</p>
              )}
            </div>
            {/* SKU Code */}
            <div>
              <label
                htmlFor="skuCode"
                className="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-200"
              >
                SKU Code *
              </label>
              <input
                type="text"
                name="skuCode"
                value={formData.skuCode}
                onChange={handleChange}
                disabled={type === "View"}
                className="w-full border border-border rounded px-3 py-2 text-sm bg-background dark:text-gray-200"
                placeholder="SKU Code"
              />
              {errors.skuCode && (
                <p className="text-red-500 text-xs mt-1">{errors.skuCode}</p>
              )}
            </div>
            {/* Quantity */}
            <div>
              <label
                htmlFor="quantity"
                className="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-200"
              >
                Quantity *
              </label>
              <input
                type="number"
                name="quantity"
                value={formData.quantity}
                onChange={handleChange}
                disabled={type === "View"}
                className="w-full border border-border rounded px-3 py-2 text-sm bg-background dark:text-gray-200"
                placeholder="Quantity"
                min="0"
              />
              {errors.quantity && (
                <p className="text-red-500 text-xs mt-1">{errors.quantity}</p>
              )}
            </div>
            {/* Unit */}
            <div>
              <label
                htmlFor="unit"
                className="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-200"
              >
                Unit *
              </label>
              <select
                name="unit"
                value={formData.unit}
                onChange={handleChange}
                disabled={type === "View"}
                className="w-full border border-border rounded px-3 py-2 text-sm bg-background dark:text-gray-200"
              >
                <option value="">Select Unit</option>
                {unitOptions.map((unit) => (
                  <option key={unit} value={unit}>
                    {unit}
                  </option>
                ))}
              </select>
              {errors.unit && (
                <p className="text-red-500 text-xs mt-1">{errors.unit}</p>
              )}
            </div>
            {/* Price */}
            <div>
              <label
                htmlFor="price"
                className="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-200"
              >
                Price *
              </label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                disabled={type === "View"}
                className="w-full border border-border rounded px-3 py-2 text-sm bg-background dark:text-gray-200"
                placeholder="Price"
                min="0"
                step="0.01"
              />
              {errors.price && (
                <p className="text-red-500 text-xs mt-1">{errors.price}</p>
              )}
            </div>
            {/* Category */}
            <div>
              <label
                htmlFor="category"
                className="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-200"
              >
                Category *
              </label>
              <input
                type="text"
                name="category"
                value={formData.category}
                onChange={handleChange}
                disabled={type === "View"}
                className="w-full border border-border rounded px-3 py-2 text-sm bg-background dark:text-gray-200"
                placeholder="Category"
              />
              {errors.category && (
                <p className="text-red-500 text-xs mt-1">{errors.category}</p>
              )}
            </div>
            {/* Description */}
            <div className="sm:col-span-2">
              <label
                htmlFor="description"
                className="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-200"
              >
                Description *
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                disabled={type === "View"}
                placeholder="Enter a detailed product description..."
                rows={4}
                className="w-full border border-border rounded px-3 py-2 text-sm bg-background dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all resize-y"
              />
              {errors.description && (
                <p className="text-red-500 text-xs mt-1">{errors.description}</p>
              )}
            </div>
            {/* Image Upload */}
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-200">
                Image *
              </label>
              <input
                type="file"
                name="image"
                accept="image/*"
                onChange={handleImageChange}
                disabled={type === "View"}
                className="w-full border border-border rounded px-3 py-2 text-sm bg-background dark:text-gray-200"
                ref={imageRef}
              />
              {formData.image && formData.image !== "null" && (
                <>
                  {typeof formData.image === "string" ? (
                    <Image
                      src={`${FileUrl}${formData.image.replace(/\\/g, "/")}`}
                      alt="Product"
                      width={128}
                      height={128}
                      className="mt-2 h-32 w-32 object-cover rounded"
                    />
                  ) : (
                    previewUrl && (
                      <Image
                        src={previewUrl}
                        alt="Preview"
                        width={128}
                        height={128}
                        className="mt-2 h-32 w-32 object-cover rounded"
                      />
                    )
                  )}
                  {type !== "View" && (
                    <Button
                      type="button"
                      variant="destructive"
                      className="mt-2 px-3 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600"
                      onClick={handleImageDelete}
                    >
                      Remove
                    </Button>
                  )}
                </>
              )}
              {errors.image && (
                <p className="text-red-500 text-xs mt-1">{errors.image}</p>
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
                {type === "Edit" ? "Update Product" : "Add Product"}
              </Button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default AddProduct;
