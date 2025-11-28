"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import axiosInstance from "@/lib/axiosInstance";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader } from "lucide-react";
import { showSuccess } from "@/lib/toastUtils";
import Image from "next/image";

const statusOptions = ["Pending", "Approved", "Rejected", "Completed"];

const EditSaleRequest = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  const instance = axiosInstance();

  const [isLoading, setIsLoading] = useState(false);
  const [request, setRequest] = useState(null);
  const [status, setStatus] = useState("");
  const FileUrl = process.env.NEXT_PUBLIC_FILEURL

  const fetchRequest = async () => {
    if (!id) return;
    try {
      const response = await instance.get(`/crop-sale-requests/${id}`);
      if (response?.status === 200) {
        const data = response.data?.data;
        setRequest(data);
        setStatus(data?.status || "Pending");
      }
    } catch (error) {
      // handled globally
    }
  };

  useEffect(() => {
    fetchRequest();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!id) return;
    setIsLoading(true);
    try {
      const response = await instance.put(`/crop-sale-requests/${id}`, { status });
      if (response?.status === 200) {
        showSuccess(response?.data?.message || "Status updated");
        router.push("/admin/sale-requests");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const renderReadonly = (label, value) => (
    <div>
      <label className="block mb-1 text-sm font-medium text-gray-900 dark:text-gray-200">{label}</label>
      <input
        type="text"
        value={value ?? "-"}
        disabled
        className="w-full border border-border rounded px-3 py-2 text-sm bg-background dark:text-gray-200"
        readOnly
      />
    </div>
  );

  return (
    <div className="p-4 flex flex-col gap-6">
      <div className="bg-white dark:bg-background border shadow rounded-lg p-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-4">
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-200">
            Edit Sale Request
          </h2>
          <Button
            variant="default"
            size="sm"
            onClick={() => router.push("/admin/sale-requests")}
            className="gap-2"
          >
            <ArrowLeft size={16} />
            <span className="hidden sm:inline">Back</span>
          </Button>
        </div>

        <form onSubmit={handleUpdate}>
          <div className="grid gap-4 sm:grid-cols-2 sm:gap-6">
            {renderReadonly("Request ID", request?.requestId)}
            {renderReadonly(
              "User",
              (() => {
                const user = request?.userId;
                const name = [user?.first_name, user?.last_name]
                  .filter(Boolean)
                  .join(" ");
                const phone = user?.phone;
                if (name && phone) return `${name} (${phone})`;
                return name || phone;
              })()
            )}
            {renderReadonly(
              "Crop",
              [request?.cropId?.name, request?.cropId?.category]
                .filter(Boolean)
                .join(" | ")
            )}
            {renderReadonly(
              "Quantity",
              request?.quantity != null && request?.quantity_unit
                ? `${request?.quantity} ${request?.quantity_unit}`
                : request?.quantity
            )}
            {renderReadonly(
              "Price/Unit",
              request?.price_per_unit != null
                ? `₹ ${request?.price_per_unit}`
                : "-"
            )}
            {renderReadonly(
              "Ready to sell on",
              request?.ready_to_sell_on
                ? new Date(request.ready_to_sell_on).toLocaleString()
                : "-"
            )}
            {renderReadonly(
              "Created At",
              request?.createdAt
                ? new Date(request.createdAt).toLocaleString()
                : "-"
            )}

            <div className="sm:col-span-2">
              <label className="block mb-1 text-sm font-medium text-gray-900 dark:text-gray-200">
                Image
              </label>
              <Image
                src={`${FileUrl}${request?.cropId?.image.replace(
                  /\\/g,
                  "/"
                )}`}
                alt="Product"
                width={128}
                height={128}
                className="mt-2 h-32 w-32 object-cover rounded"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block mb-1 text-sm font-medium text-gray-900 dark:text-gray-200">
                Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full border border-border rounded px-3 py-2 text-sm bg-background dark:text-gray-200"
              >
                {statusOptions.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex justify-end mt-4">
            <Button
              type="submit"
              disabled={isLoading}
              variant="default"
              size="sm"
              className="gap-2"
            >
              {isLoading && <Loader className="animate-spin w-5 h-5 mr-2" />}
              Update Status
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditSaleRequest;


