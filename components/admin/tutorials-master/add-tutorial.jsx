"use client";
import React, { useState, useEffect, useRef, useMemo } from "react";
import { showSuccess, showError } from "@/lib/toastUtils";
import { useRouter, useSearchParams } from "next/navigation";
import axiosInstance from "@/lib/axiosInstance";
import { Button } from "@/components/ui/button";
import { Loader, ArrowLeft } from "lucide-react";
import Image from "next/image";
import dynamic from "next/dynamic";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import "react-quill-new/dist/quill.snow.css";
import { languages } from "@/lib/languages";

const ReactQuill = dynamic(() => import("react-quill-new"), { ssr: false });

// Hold a reference to the Quill library after dynamic import
const quillLibRefGlobal = { current: null };

const AddTutorial = ({ type }) => {
  const FileUrl = process.env.NEXT_PUBLIC_FILEURL;
  const imageRef = useRef(null);
  const instance = axiosInstance();
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  const quillRef = useRef(null);
  const quillLibRef = useRef(null);
  const blotRefs = useRef({ VideoBlot: null, AudioBlot: null, IframeBlot: null });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    language: "",
    description: "",
    image: null,
    createdAt: "",
    updatedAt: "",
  });
  const [previewUrl, setPreviewUrl] = useState(null);
  const [errors, setErrors] = useState({});
  const [isMediaModalOpen, setIsMediaModalOpen] = useState(false);
  const [mediaItems, setMediaItems] = useState([]);
  const [mediaLoading, setMediaLoading] = useState(false);
  const [mediaError, setMediaError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedMediaType, setSelectedMediaType] = useState("image");
  const [isEmbedModalOpen, setIsEmbedModalOpen] = useState(false);
  const [embedUrl, setEmbedUrl] = useState("");
  const [embedError, setEmbedError] = useState("");


  const mediaTypes = [
    { value: "image", label: "Image" },
    { value: "video", label: "Video" },
    { value: "audio", label: "Audio" },
  ];

  const quillModules = useMemo(() => {
    const getSilent = () => quillLibRef.current?.sources?.SILENT || "silent";
    return {
      toolbar: {
        container: [
          [{ header: [1, 2, 3, false] }],
          ["bold", "italic", "underline"],
          [{ list: "ordered" }, { list: "bullet" }],
          ["clean"],
          [{ align: [] }],
          ["image", "video", "iframe"],
        ],
        handlers: {
          iframe: function () {
            if (quillRef.current) {
              setEmbedUrl("");
              setEmbedError("");
              setIsEmbedModalOpen(true);
              quillRef.current.getEditor().focus();
            }
          },
        },
      },
      keyboard: {
        bindings: {
          enter: {
            key: 13,
            handler: function (range, context) {
              if (context && (context.format.video || context.format.audio || context.format.iframe)) {
                const index = range.index + 1;
                this.quill.insertText(index, "\n", "user");
                this.quill.insertEmbed(index + 1, "block", "<p><br></p>", "user");
                this.quill.setSelection(index + 2, getSilent());
                return false;
              }
              return true;
            },
          },
          down: {
            key: 40,
            handler: function (range, context) {
              if (context && (context.format.video || context.format.audio || context.format.iframe)) {
                const index = range.index + 1;
                this.quill.insertText(index, "\n", "user");
                this.quill.insertEmbed(index + 1, "block", "<p><br></p>", "user");
                this.quill.setSelection(index + 2, getSilent());
                return false;
              }
              return true;
            },
          },
        },
      },
    };
  }, []);
  const quillFormats = [
    "header",
    "bold",
    "italic",
    "underline",
    "list",
    "bullet",
    "link",
    "align",
    "image",
    "video",
    "audio",
    "iframe",
    "block",
  ];

  const handleEditorClick = (e) => {
    if (!quillRef.current) return;
    const quill = quillRef.current.getEditor();
    const range = quill.getSelection(true);
    if (range) {
      const [leaf] = quill.getLeaf(range.index);
      const { VideoBlot, AudioBlot, IframeBlot } = blotRefs.current || {};
      if (
        leaf &&
        VideoBlot &&
        AudioBlot &&
        IframeBlot &&
        (leaf.blot instanceof VideoBlot ||
          leaf.blot instanceof AudioBlot ||
          leaf.blot instanceof IframeBlot)
      ) {
        const index = range.index + 1;
        quill.insertText(index, "\n", "user");
        quill.insertEmbed(index + 1, "block", "<p><br></p>", "user");
        const silent = quillLibRef.current?.sources?.SILENT || "silent";
        quill.setSelection(index + 2, silent);
      }
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Name cannot be empty";
    if (!formData.language) newErrors.language = "Language is required";
    if (!formData.description.trim()) newErrors.description = "Description cannot be empty";
    if (/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi.test(formData.description)) {
      newErrors.description = "Description contains illegal <script> tags";
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

  const handleDescriptionChange = (value) => {
    setFormData((prev) => ({
      ...prev,
      description: value,
    }));
    setErrors((prev) => ({ ...prev, description: "" }));
  };

  const handleEmbedMedia = async (media) => {
    try {
      const response = await fetch(media.url, { method: "HEAD" });
      if (!response.ok) {
        showError(`Media URL is inaccessible: ${media.url}`);
        return;
      }
    } catch (error) {
      showError(`Failed to validate media URL: ${media.url}`);
      return;
    }

    const quill = quillRef.current?.getEditor();
    quill.focus(); // Ensure editor is focused
    let range = quill.getSelection(true);
    if (!quill || range === null) {
      showError("Editor is not ready. Please try again.");
      // Fallback: insert at the end of the content
      range = { index: quill.getLength() };
    }

    switch (media.type) {
      case "image":
        quill.insertEmbed(range.index, "image", media.url, "user");
        break;
      case "video":
        quill.insertEmbed(range.index, "video", {
          url: media.url,
          type: media.format || "video/mp4",
        }, "user");
        break;
      case "audio":
        quill.insertEmbed(range.index, "audio", {
          url: media.url,
          type: media.format || "audio/mpeg",
        }, "user");
        break;
      default:
        return;
    }

    quill.insertText(range.index + 1, "\n", "user");
    quill.insertEmbed(range.index + 2, "block", "<p><br></p>", "user");
    const silent = quillLibRef.current?.sources?.SILENT || "silent";
    quill.setSelection(range.index + 3, silent);
    setIsMediaModalOpen(false);
  };

  const handleEmbedUrl = () => {
    if (!embedUrl || !/^https?:\/\/.+/.test(embedUrl)) {
      setEmbedError("Please enter a valid URL.");
      return;
    }

    const quill = quillRef.current?.getEditor();
    quill.focus(); // Ensure editor is focused
    let range = quill.getSelection(true);
    if (!quill || range === null) {
      showError("Editor is not ready. Please try again.");
      // Fallback: insert at the end of the content
      range = { index: quill.getLength() };
    }

    quill.insertEmbed(range.index, "iframe", { url: embedUrl }, "user");
    quill.insertText(range.index + 1, "\n", "user");
    quill.insertEmbed(range.index + 2, "block", "<p><br></p>", "user");
    const silent = quillLibRef.current?.sources?.SILENT || "silent";
    quill.setSelection(range.index + 3, silent);

    setIsEmbedModalOpen(false);
    setEmbedUrl("");
    setEmbedError("");
  };

  const getTutorial = async (id) => {
    try {
      const response = await instance.get(`/tutorial-master/${id}`);
      if (response.data?.data) {
        const tutorial = response.data.data;
        setFormData({
          name: tutorial.name || "",
          language: tutorial.language || "",
          description: tutorial.description || "",
          image: tutorial.image || null,
          createdAt: tutorial.createdAt || "",
          updatedAt: tutorial.updatedAt || "",
        });
      }
    } catch (error) {
      showError(error?.response?.data?.message || "Failed to fetch tutorial");
    }
  };

  const fetchMedia = async (page = 1) => {
    setMediaLoading(true);
    setMediaError(null);
    try {
      const response = await instance.get(`/media-master`, {
        params: { page, limit: 10, type: selectedMediaType },
      });
      setMediaItems(response.data.data || []);
      setTotalPages(response.data.pagination?.totalPages || 1);
      setCurrentPage(page);
    } catch (error) {
      setMediaError(error?.response?.data?.message || "Failed to fetch media");
    } finally {
      setMediaLoading(false);
    }
  };

  const handleMediaTypeChange = (value) => {
    setSelectedMediaType(value);
    setCurrentPage(1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      showError("Please fill all required fields correctly");
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
      const response = await instance.post("/tutorial-master/", formDataToSend);
      if (response?.status === 200) {
        showSuccess(response?.data?.message || "Tutorial added successfully");
        router.push("/admin/tutorials-list");
      }
    } catch (error) {
      const backendErrors = error?.response?.data?.error?.errors;
      if (backendErrors && Array.isArray(backendErrors)) {
        const newErrors = {};
        backendErrors.forEach((err) => {
          newErrors[err.field] = err.message;
        });
        setErrors(newErrors);
        showError("Validation failed");
      } else {
        showError(error?.response?.data?.message || "Failed to add tutorial");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    const maxSize = 2 * 1024 * 1024;

    if (!file) {
      setFormData((prev) => ({ ...prev, image: null }));
      setErrors((prev) => ({ ...prev, image: "" }));
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
    setErrors((prev) => ({ ...prev, image: "" }));
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      showError("Please fill all required fields correctly");
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
      const response = await instance.put(`/tutorial-master/${id}`, formDataToSend);
      if (response?.status === 200) {
        showSuccess(response?.data?.message || "Tutorial updated successfully");
        router.push("/admin/tutorials-list");
      }
    } catch (error) {
      const backendErrors = error?.response?.data?.error?.errors;
      if (backendErrors && Array.isArray(backendErrors)) {
        const newErrors = {};
        backendErrors.forEach((err) => {
          newErrors[err.field] = err.message;
        });
        setErrors(newErrors);
        showError("Validation failed");
      } else {
        showError(error?.response?.data?.message || "Failed to update tutorial");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if ((type === "Edit" || type === "View") && id) {
      getTutorial(id);
    }
  }, [id, type]);

  useEffect(() => {
    if (isMediaModalOpen) {
      fetchMedia(currentPage);
    }
  }, [isMediaModalOpen, currentPage, selectedMediaType]);

  // Dynamically import Quill and register custom blots on the client only
  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const Quill = (await import("quill")).default;
        if (!isMounted) return;

        // Define and register custom blots after Quill loads in the browser
        class VideoBlot extends Quill.import("blots/block/embed") {
          static create(value) {
            let node = super.create();
            node.setAttribute("controls", "");
            node.setAttribute("width", "100%");
            node.setAttribute(
              "style",
              "max-width: 100%; height: auto; display: block; margin: 0 auto;"
            );
            let source = document.createElement("source");
            source.setAttribute("src", value.url);
            source.setAttribute("type", value.type || "video/mp4");
            node.appendChild(source);
            return node;
          }
          static value(node) {
            let source = node.querySelector("source");
            return {
              url: source ? source.getAttribute("src") : "",
              type: source ? source.getAttribute("type") : "video/mp4",
            };
          }
        }
        VideoBlot.blotName = "video";
        VideoBlot.tagName = "video";
        Quill.register(VideoBlot);

        class AudioBlot extends Quill.import("blots/block/embed") {
          static create(value) {
            let node = super.create();
            node.setAttribute("controls", "");
            node.setAttribute("style", "width: 100%; display: block; margin: 0 auto;");
            let source = document.createElement("source");
            source.setAttribute("src", value.url);
            source.setAttribute("type", value.type || "audio/mpeg");
            node.appendChild(source);
            return node;
          }
          static value(node) {
            let source = node.querySelector("source");
            return {
              url: source ? source.getAttribute("src") : "",
              type: source ? source.getAttribute("type") : "audio/mpeg",
            };
          }
        }
        AudioBlot.blotName = "audio";
        AudioBlot.tagName = "audio";
        Quill.register(AudioBlot);

        class IframeBlot extends Quill.import("blots/block/embed") {
          static create(value) {
            let node = super.create();
            node.setAttribute("src", value.url);
            node.setAttribute("frameborder", "0");
            node.setAttribute("allowfullscreen", "");
            node.setAttribute("width", "100%");
            node.setAttribute("height", "315");
            node.setAttribute(
              "style",
              "max-width: 100%; display: block; margin: 0 auto;"
            );
            return node;
          }
          static value(node) {
            return { url: node.getAttribute("src") };
          }
        }
        IframeBlot.blotName = "iframe";
        IframeBlot.tagName = "iframe";
        Quill.register(IframeBlot);

        quillLibRef.current = Quill;
        blotRefs.current = { VideoBlot, AudioBlot, IframeBlot };
        quillLibRefGlobal.current = Quill;
      } catch (e) {
        // If Quill fails to load in a non-browser environment, ignore
      }
    })();
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="p-4 flex flex-col gap-6">
      <div className="bg-white dark:bg-background border shadow rounded-lg p-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-4">
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-200">
            {type === "View" ? "View Tutorial" : `${type} Tutorial`}
          </h2>
          <Button
            variant="default"
            size="sm"
            onClick={() => router.push("/admin/tutorials-list")}
            className="gap-2"
          >
            <ArrowLeft size={16} />
            <span className="hidden sm:inline">Back</span>
          </Button>
        </div>

        <form onSubmit={type === "Edit" ? handleUpdate : handleSubmit}>
          <div className="grid gap-4 sm:grid-cols-2 sm:gap-6">
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
                placeholder="Tutorial Name"
              />
              {errors.name && (
                <p className="text-red-500 text-xs mt-1">{errors.name}</p>
              )}
            </div>

            <div>
              <label
                htmlFor="language"
                className="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-200"
              >
                Language *
              </label>
              <select
                name="language"
                value={formData.language}
                onChange={handleChange}
                disabled={type === "View"}
                className="w-full border border-border rounded px-3 py-2 text-sm bg-background dark:text-gray-200"
              >
                <option value="" disabled>
                  Select Language
                </option>
                {languages.map((lang) => (
                  <option key={lang.code} value={lang.code}>
                    {lang.name}
                  </option>
                ))}
              </select>
              {errors.language && (
                <p className="text-red-500 text-xs mt-1">{errors.language}</p>
              )}
            </div>

            <div>
              <label htmlFor="image" className="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-200">
                Image
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
                      alt="Crop"
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

            <div className="sm:col-span-2">
              <label
                htmlFor="description"
                className="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-200"
              >
                Description *
              </label>
              {type === "View" ? (
                <div
                  className="ql-editor border border-border rounded p-2 bg-background dark:text-gray-200"
                  style={{ minHeight: "200px" }}
                  dangerouslySetInnerHTML={{ __html: formData.description }}
                />
              ) : (
                <>
                  <div className="flex justify-end mb-2">
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        onClick={() => setIsMediaModalOpen(true)}
                      >
                        Insert Media
                      </Button>
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        onClick={() => {
                          setEmbedUrl("");
                          setEmbedError("");
                          setIsEmbedModalOpen(true);
                          if (quillRef.current) {
                            quillRef.current.getEditor().focus();
                          }
                        }}
                      >
                        Embed URL
                      </Button>
                    </div>
                  </div>
                  <ReactQuill
                    ref={quillRef}
                    value={formData.description}
                    onChange={handleDescriptionChange}
                    modules={quillModules}
                    formats={quillFormats}
                    className="bg-background dark:text-gray-200"
                    placeholder="Enter a detailed tutorial description..."
                    onClick={handleEditorClick}
                  />
                </>
              )}
              {errors.description && (
                <p className="text-red-500 text-xs mt-1">{errors.description}</p>
              )}
            </div>
            {type === "View" && (
            <div className="mt-6">
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
            <div className="mt-6">
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
                {type === "Edit" ? "Update Tutorial" : "Add Tutorial"}
              </Button>
            </div>
          )}
        </form>
      </div>

      <Dialog open={isMediaModalOpen} onOpenChange={setIsMediaModalOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Select Media</DialogTitle>
          </DialogHeader>
          <div className="mb-4">
            <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-200">
              Media Type
            </label>
            <Select
              value={selectedMediaType}
              onValueChange={handleMediaTypeChange}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select media type" />
              </SelectTrigger>
              <SelectContent>
                {mediaTypes.map((mediaType) => (
                  <SelectItem key={mediaType.value} value={mediaType.value}>
                    {mediaType.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {mediaLoading ? (
            <div className="flex justify-center py-10">
              <Loader className="animate-spin w-8 h-8" />
            </div>
          ) : mediaError ? (
            <p className="text-red-500 text-center">{mediaError}</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 max-h-[60vh] overflow-y-auto">
              {mediaItems.map((media) => (
                <div
                  key={media._id}
                  className="border rounded-lg p-2 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer"
                  onClick={() => handleEmbedMedia(media)}
                >
                  {media.type === "image" && (
                    <img
                      src={media.url}
                      alt={media.name}
                      className="w-full h-32 object-cover rounded"
                    />
                  )}
                  {media.type === "video" && (
                    <video
                      src={media.url}
                      className="w-full h-32 object-cover rounded"
                      controls
                      muted
                    />
                  )}
                  {media.type === "audio" && (
                    <div className="flex items-center justify-center h-32 bg-gray-200 dark:bg-gray-700 rounded">
                      <audio controls className="w-full">
                        <source src={media.url} type={media.format} />
                        Your browser does not support the audio tag.
                      </audio>
                    </div>
                  )}
                  <p className="text-sm mt-2 truncate">{media.name}</p>
                  <p className="text-xs text-gray-500">{media.type}</p>
                </div>
              ))}
            </div>
          )}
          {!mediaLoading && !mediaError && mediaItems.length === 0 && (
            <p className="text-center text-gray-500">No {selectedMediaType} found</p>
          )}
          <DialogFooter className="mt-4">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    onClick={() => currentPage > 1 && fetchMedia(currentPage - 1)}
                    className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                  />
                </PaginationItem>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <PaginationItem key={page}>
                    <PaginationLink
                      onClick={() => fetchMedia(page)}
                      isActive={page === currentPage}
                    >
                      {page}
                    </PaginationLink>
                  </PaginationItem>
                ))}
                <PaginationItem>
                  <PaginationNext
                    onClick={() => currentPage < totalPages && fetchMedia(currentPage + 1)}
                    className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isEmbedModalOpen} onOpenChange={setIsEmbedModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Embed URL</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-2 mt-2">
            <label className="text-sm font-medium">URL *</label>
            <input
              type="url"
              className="border border-border rounded px-3 py-2 text-sm bg-background dark:text-gray-200"
              value={embedUrl}
              onChange={(e) => {
                setEmbedUrl(e.target.value);
                setEmbedError("");
              }}
              placeholder="https://www.youtube.com/embed/..."
            />
            {embedError && (
              <p className="text-red-500 text-xs">{embedError}</p>
            )}
          </div>
          <DialogFooter className="mt-4">
            <Button type="button" onClick={handleEmbedUrl}>
              Embed
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AddTutorial;