"use client";
import React, { useState, useEffect, useRef } from "react";
import { showSuccess, showError } from "@/lib/toastUtils";
import { useRouter, useSearchParams } from "next/navigation";
import axiosInstance from "@/lib/axiosInstance";
import { Button } from "@/components/ui/button";
import { Loader, ArrowLeft, Plus, Trash2 } from "lucide-react";
import Image from "next/image";
import { languages } from "@/lib/languages";


const AddScheme = ({ type }) => {
  const instance = axiosInstance();
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  const FileUrl = process.env.NEXT_PUBLIC_FILEURL;

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    translations: [{ name: "", language: "", description: "", image: null }],
    createdAt: "",
    updatedAt: ""
  });
  const [previewUrls, setPreviewUrls] = useState([]);
  const imageRefs = useRef([]);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const newErrors = {};

    // Validate top-level name
    if (!formData.name.trim()) newErrors.name = "Name cannot be empty";

    // Validate translations
    if (!formData.translations || formData.translations.length === 0) {
      newErrors.translations = "At least one translation is required";
    } else {
      formData.translations.forEach((t, index) => {
        if (!t.name?.trim()) {
          newErrors[`translations[${index}].name`] = "Translation name cannot be empty";
        }

        if (!t.language?.trim()) {
          newErrors[`translations[${index}].language`] = "Please select a language";
        }

        const isNew = !t._id;
        const isExisting = !!t._id;
        const isImageMissing = !t.image;
        const isFile = t.image instanceof File;
        const isString = typeof t.image === "string";

        if ((isNew && isImageMissing) || (isExisting && isImageMissing)) {
          newErrors[`translations[${index}].image`] = "Image is required";
        }

        if (isFile && t.image.size > 2 * 1024 * 1024) {
          newErrors[`translations[${index}].image`] = "Image size should not exceed 2MB";
        }
      });
    }

    return newErrors;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleTranslationChange = (index, e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const translations = [...prev.translations];
      translations[index] = { ...translations[index], [name]: value };
      return { ...prev, translations };
    });
    setErrors((prev) => ({ ...prev, [`translations[${index}].${name}`]: "" }));
  };

  const handleImageChange = (index, e) => {
    const file = e.target.files?.[0];
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    const maxSize = 2 * 1024 * 1024;

    if (!file) {
      setFormData((prev) => {
        const translations = [...prev.translations];
        translations[index] = { ...translations[index], image: null };
        return { ...prev, translations };
      });
      setErrors((prev) => ({ ...prev, [`translations[${index}].image`]: "" }));
      setPreviewUrls((prev) => {
        const urls = [...prev];
        if (urls[index]) URL.revokeObjectURL(urls[index]);
        urls[index] = null;
        return urls;
      });
      return;
    }

    if (!allowedTypes.includes(file.type)) {
      imageRefs.current[index].value = "";
      setErrors((prev) => ({
        ...prev,
        [`translations[${index}].image`]: "Only .jpg, .jpeg, .png, or .webp files are allowed",
      }));
      setFormData((prev) => {
        const translations = [...prev.translations];
        translations[index] = { ...translations[index], image: null };
        return { ...prev, translations };
      });
      setPreviewUrls((prev) => {
        const urls = [...prev];
        if (urls[index]) URL.revokeObjectURL(urls[index]);
        urls[index] = null;
        return urls;
      });
      return;
    }

    if (file.size > maxSize) {
      imageRefs.current[index].value = "";
      setErrors((prev) => ({
        ...prev,
        [`translations[${index}].image`]: "Image size should not exceed 2MB",
      }));
      setFormData((prev) => {
        const translations = [...prev.translations];
        translations[index] = { ...translations[index], image: null };
        return { ...prev, translations };
      });
      setPreviewUrls((prev) => {
        const urls = [...prev];
        if (urls[index]) URL.revokeObjectURL(urls[index]);
        urls[index] = null;
        return urls;
      });
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    setPreviewUrls((prev) => {
      const urls = [...prev];
      if (urls[index]) URL.revokeObjectURL(urls[index]);
      urls[index] = objectUrl;
      return urls;
    });
    setFormData((prev) => {
      const translations = [...prev.translations];
      translations[index] = { ...translations[index], image: file };
      return { ...prev, translations };
    });
    setErrors((prev) => ({ ...prev, [`translations[${index}].image`]: "" }));
  };

  const handleImageDelete = (index) => {
    imageRefs.current[index].value = "";
    setFormData((prev) => {
      const translations = [...prev.translations];
      translations[index] = { ...translations[index], image: null };
      return { ...prev, translations };
    });
    setErrors((prev) => ({ ...prev, [`translations[${index}].image`]: "" }));
    setPreviewUrls((prev) => {
      const urls = [...prev];
      if (urls[index]) URL.revokeObjectURL(urls[index]);
      urls[index] = null;
      return urls;
    });
  };

  const addTranslation = () => {
    setFormData((prev) => ({
      ...prev,
      translations: [...prev.translations, { name: "", language: "", description: "", image: null }],
    }));
    setPreviewUrls((prev) => [...prev, null]);
    imageRefs.current.push(React.createRef());
  };

  const removeTranslation = (index) => {
    setFormData((prev) => {
      const translations = [...prev.translations];
      translations.splice(index, 1);
      return { ...prev, translations };
    });
    setPreviewUrls((prev) => {
      const urls = [...prev];
      if (urls[index]) URL.revokeObjectURL(urls[index]);
      urls.splice(index, 1);
      return urls;
    });
    imageRefs.current.splice(index, 1);
    setErrors((prev) => {
      const newErrors = { ...prev };
      Object.keys(prev).forEach((key) => {
        if (key.startsWith(`translations[${index}]`)) delete newErrors[key];
      });
      return newErrors;
    });
  };

  const getScheme = async (id) => {
    try {
      const response = await instance.get(`/government-scheme/${id}`);
      if (response.data?.data) {
        const scheme = response.data.data;
        setFormData({
          name: scheme.name || "",
          translations: scheme.translation.map((t) => ({
            _id: t._id,
            name: t.name || "",
            language: t.language || "",
            description: t.description || "",
            image: t.image || null,
          })),
          createdAt: scheme.createdAt || "",
          updatedAt: scheme.updatedAt || "",
        });
        setPreviewUrls(scheme.translation.map(() => null));
        imageRefs.current = scheme.translation.map(() => React.createRef());
      }
    } catch (error) {
      showError(error?.response?.data?.message || "Failed to fetch scheme");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      showError("Please fill all required fields");
      return;
    }
    setErrors({});
    setIsSubmitting(true);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append("name", formData.name);
      formDataToSend.append("translations", JSON.stringify(formData.translations.map(t => ({
        _id: t._id,
        name: t.name,
        language: t.language,
        description: t.description,
      }))));
      formData.translations.forEach((t, index) => {
        if (t.image && typeof t.image !== "string") {
          formDataToSend.append(`translation_images_${index}`, t.image);
        }
      });

      const response = await instance.post("/government-scheme", formDataToSend);
      if (response?.status === 200) {
        showSuccess(response?.data?.message || "Scheme added successfully");
        router.push("/admin/list-schemes");
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
        showError(error?.response?.data?.message || "Failed to add scheme");
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
      showError("Please fill all required fields");
      return;
    }
    setErrors({});
    setIsSubmitting(true);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append("name", formData.name);
      formDataToSend.append("translations", JSON.stringify(formData.translations.map(t => ({
        _id: t._id,
        name: t.name,
        language: t.language,
        description: t.description,
      }))));
      formData.translations.forEach((t, index) => {
        if (t.image && typeof t.image !== "string") {
          formDataToSend.append(`translation_images_${index}`, t.image);
        }
      });

      const response = await instance.put(`/government-scheme/${id}`, formDataToSend);
      if (response?.status === 200) {
        showSuccess(response?.data?.message || "Scheme updated successfully");
        router.push("/admin/list-schemes");
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
      getScheme(id);
    }
  }, [id, type]);

  useEffect(() => {
    return () => {
      previewUrls.forEach((url) => {
        if (url) URL.revokeObjectURL(url);
      });
    };
  }, [previewUrls]);

  return (
    <div className="p-4 flex flex-col gap-6">
      <div className="bg-white dark:bg-background border shadow rounded-lg p-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-4">
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-200">
            {type === "View" ? "View Scheme" : `${type} Scheme`}
          </h2>
          <Button
            variant="default"
            size="sm"
            onClick={() => router.push("/admin/list-schemes")}
            className="gap-2"
          >
            <ArrowLeft size={16} />
            <span className="hidden sm:inline">Back</span>
          </Button>
        </div>

        <form onSubmit={type === "Edit" ? handleUpdate : handleSubmit}>
          <div className="grid gap-4 sm:grid-cols-2 sm:gap-6">
            {/* Top-level Name */}
            <div className="sm:col-span-2">
              <label
                htmlFor="name"
                className="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-200"
              >
                Scheme Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                disabled={type === "View"}
                className="w-full border border-border rounded px-3 py-2 text-sm bg-background dark:text-gray-200"
                placeholder="Scheme Name"
              />
              {errors.name && (
                <p className="text-red-500 text-xs mt-1">{errors.name}</p>
              )}
            </div>

            {/* Translations */}
            <div className="sm:col-span-2">
              <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-200">
                Translations *
              </label>
              {formData.translations.map((translation, index) => (
                <div key={index} className="border p-4 rounded mb-4 relative">
                  {type !== "View" && formData.translations.length > 1 && (
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="absolute top-2 right-2"
                      onClick={() => removeTranslation(index)}
                    >
                      <Trash2 size={16} />
                    </Button>
                  )}
                  <div className="grid gap-4 sm:grid-cols-2 sm:gap-6">
                    {/* Translation Name */}
                    <div>
                      <label
                        htmlFor={`translations[${index}].name`}
                        className="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-200"
                      >
                        Translation Name *
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={translation.name}
                        onChange={(e) => handleTranslationChange(index, e)}
                        disabled={type === "View"}
                        className="w-full border border-border rounded px-3 py-2 text-sm bg-background dark:text-gray-200"
                        placeholder="Translation Name"
                      />
                      {errors[`translations[${index}].name`] && (
                        <p className="text-red-500 text-xs mt-1">
                          {errors[`translations[${index}].name`]}
                        </p>
                      )}
                    </div>

                    {/* Language Dropdown */}
                    <div>
                      <label
                        htmlFor={`translations[${index}].language`}
                        className="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-200"
                      >
                        Language *
                      </label>
                      <select
                        name="language"
                        value={translation.language}
                        onChange={(e) => handleTranslationChange(index, e)}
                        disabled={type === "View"}
                        className="w-full border border-border rounded px-3 py-2 text-sm bg-background dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/50 cursor-pointer"
                      >
                        <option value="">Select a language</option>
                        {languages.map((lang) => (
                          <option key={lang.code} value={lang.code}>
                            {lang.name}
                          </option>
                        ))}
                      </select>
                      {errors[`translations[${index}].language`] && (
                        <p className="text-red-500 text-xs mt-1">
                          {errors[`translations[${index}].language`]}
                        </p>
                      )}
                    </div>

                    {/* Description */}
                    <div className="sm:col-span-2">
                      <label
                        htmlFor={`translations[${index}].description`}
                        className="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-200"
                      >
                        Description
                      </label>
                      <textarea
                        name="description"
                        value={translation.description}
                        onChange={(e) => handleTranslationChange(index, e)}
                        disabled={type === "View"}
                        placeholder="Enter translation description..."
                        rows={4}
                        className="w-full border border-border rounded px-3 py-2 text-sm bg-background dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all resize-y"
                      />
                      {errors[`translations[${index}].description`] && (
                        <p className="text-red-500 text-xs mt-1">
                          {errors[`translations[${index}].description`]}
                        </p>
                      )}
                    </div>

                    {/* Image Upload */}
                    <div>
                      <label
                        htmlFor={`translations[${index}].image`}
                        className="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-200"
                      >
                        Image *
                      </label>
                      <input
                        type="file"
                        name="image"
                        accept="image/*"
                        onChange={(e) => handleImageChange(index, e)}
                        disabled={type === "View"}
                        className="w-full border border-border rounded px-3 py-2 text-sm bg-background dark:text-gray-200"
                        ref={(el) => (imageRefs.current[index] = el)}
                      />
                      {translation.image && (
                        <>
                          {typeof translation.image === "string" ? (
                            <Image
                              src={`${FileUrl}${translation.image.replace(/\\/g, "/")}`}
                              alt={`Translation ${index + 1}`}
                              width={128}
                              height={128}
                              className="mt-2 h-32 w-32 object-cover rounded"
                            />
                          ) : (
                            previewUrls[index] && (
                              <Image
                                src={previewUrls[index]}
                                alt={`Preview ${index + 1}`}
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
                              onClick={() => handleImageDelete(index)}
                            >
                              Remove
                            </Button>
                          )}
                        </>
                      )}
                      {errors[`translations[${index}].image`] && (
                        <p className="text-red-500 text-xs mt-1">
                          {errors[`translations[${index}].image`]}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              {type !== "View" && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addTranslation}
                  className="mt-2"
                >
                  <Plus size={16} className="mr-2" />
                  Add Translation
                </Button>
              )}
              {errors.translations && (
                <p className="text-red-500 text-xs mt-1">{errors.translations}</p>
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
                {type === "Edit" ? "Update Scheme" : "Add Scheme"}
              </Button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default AddScheme;