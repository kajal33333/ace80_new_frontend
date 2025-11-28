"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import axiosInstance from "@/lib/axiosInstance";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader } from "lucide-react";
import { showSuccess } from "@/lib/toastUtils";
import Image from "next/image";

const statusOptions = ["Pending", "Confirmed", "Shipped", "Delivered", "Cancelled"];

const EditOrderRequest = () => {
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
      const response = await instance.get(`/product-orders/${id}`);
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
      const response = await instance.put(`/product-orders/${id}`, { status });
      if (response?.status === 200) {
        showSuccess(response?.data?.message || "Status updated");
        router.push("/admin/order-requests");
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
            Edit Product Order
          </h2>
          <Button
            variant="default"
            size="sm"
            onClick={() => router.push("/admin/order-requests")}
            className="gap-2"
          >
            <ArrowLeft size={16} />
            <span className="hidden sm:inline">Back</span>
          </Button>
        </div>

        <form onSubmit={handleUpdate}>
          <div className="grid gap-4 sm:grid-cols-2 sm:gap-6">
            {renderReadonly("Order ID", request?.orderId)}
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
            <div className="sm:col-span-2">
              <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-200">
                Products
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {request?.products?.map((prod, index) => {
                  const imageSrc = prod?.productId?.image
                    ? `${FileUrl}${prod?.productId?.image.replace(/\\/g, "/")}`
                    : "/default.png";
                  const title = [prod?.productId?.name, prod?.cropId?.category]
                    .filter(Boolean)
                    .join(" | ");
                  const category = prod?.productId?.category ?? "-";
                  const quantity = prod?.quantity != null && prod?.quantity_unit
                    ? `${prod?.quantity} ${prod?.quantity_unit}`
                    : (prod?.quantity ?? "-");
                  const unitPrice = prod?.productId?.price ?? "-";
                  const subTotal = prod?.subTotal != null ? `₹ ${prod?.subTotal}` : "-";

                  return (
                    <div
                      key={index}
                      className="border rounded-lg p-4 bg-white dark:bg-background shadow-sm flex gap-4 items-start"
                    >
                      <Image
                        src={imageSrc}
                        alt="Product"
                        width={96}
                        height={96}
                        className="h-24 w-24 object-cover rounded"
                      />
                      <div className="flex-1">
                        <div className="mb-2">
                          <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                            {title || "Product"}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">{category}</div>
                        </div>
                        <div className="grid grid-cols-2 gap-3 text-sm">
                          <div>
                            <div className="text-gray-500 dark:text-gray-400">Quantity</div>
                            <div className="font-medium text-gray-900 dark:text-gray-100">{quantity}</div>
                          </div>
                          <div>
                            <div className="text-gray-500 dark:text-gray-400">Price / unit</div>
                            <div className="font-medium text-gray-900 dark:text-gray-100">{unitPrice}</div>
                          </div>
                          <div>
                            <div className="text-gray-500 dark:text-gray-400">Sub total</div>
                            <div className="font-medium text-gray-900 dark:text-gray-100">{subTotal}</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            {renderReadonly("Total", request?.totalPrice)}
            {renderReadonly(
              "Ordered at",
              request?.createdAt ? new Date(request.createdAt).toLocaleString() : "-"
            )}
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

export default EditOrderRequest;


