"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import axiosInstance from "@/lib/axiosInstance";
import DataTable from "@/components/table-component/data-table";
import Pagination from "@/components/pagination-component/pagination";
import { Button } from "@/components/ui/button";
import { Edit } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";

const statusVariants = {
  Pending: { variant: "secondary" },   // Grey - waiting
  Confirmed: { variant: "default" },   // Primary - approved
  Shipped: { variant: "outline" },     // Border - in transit
  Delivered: { variant: "ghost" },     // Subtle - completed
  Cancelled: { variant: "destructive" } // Red - cancelled
};


const statusOptions = ["Pending", "Confirmed", "Shipped", "Delivered", "Cancelled"];

const OrderRequestsList = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialPage = Number(searchParams.get("page")) || 1;
  const initialLimit = Number(searchParams.get("limit")) || 10;

  const instance = axiosInstance();

  const [requests, setRequests] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [limit, setLimit] = useState(initialLimit);
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const FileUrl = process.env.NEXT_PUBLIC_FILEURL;

  const fetchRequests = async () => {
    try {
      const params = new URLSearchParams();
      params.set("page", String(currentPage));
      params.set("limit", String(limit));
      if (searchText.trim()) params.set("q", searchText.trim());
      if (statusFilter) params.set("status", statusFilter);

      const response = await instance.get(`/customer?page?${params.toString()}`);
      if (response?.status === 200) {
        const { data, pagination } = response.data;
        setRequests(Array.isArray(data) ? data : []);
        if (!searchText.trim()) {
          setCurrentPage(pagination?.currentPage || 1);
          setLimit(pagination?.limit || 10);
          setTotalPages(pagination?.totalPages || 1);
        } else {
          setTotalPages(1);
        }
      }
    } catch (error) {
      console.error("Error fetching sale requests:", error);
    }
  };

  useEffect(() => {
    fetchRequests();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, limit, statusFilter]);

  const handleSearch = () => {
    setCurrentPage(1);
    router.push(`?page=1&limit=${limit}`);
    fetchRequests();
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleSearch();
  };

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      router.push(`?page=${page}&limit=${limit}`);
    }
  };

  const columns = useMemo(
    () => [
      { header: "Code", accessorKey: "customer_code" },
       { header: "Name", accessorKey: "customer_name" },
      { header: "Phone", accessorKey: "customer_phone" },
      { header: "Email", accessorKey: "customer_email" },
       { header: "updated At", accessorKey: "updatedAt" },
       {header: "created At", accessorKey: "createdAt" },
       {
        header: "Region",
        accessorKey: "regionInfo.name",
        cell: ({ row }) => row.original.regionInfo?.name || "-",
      },
       {
        header: "State",
        accessorKey: "stateInfo.name",
        cell: ({ row }) => row.original.stateInfo?.name || "-",
      },
      {
        header: "City",
        accessorKey: "cityInfo.name",
        cell: ({ row }) => row.original.cityInfo?.name || "-",
      },
      {
        header: "Business",
        accessorKey: "customerBusinessInfo.name",
        cell: ({ row }) => row.original.customerBusinessInfo?.name || "-",
      },
      {
        header: "Assigned To",
        accessorKey: "assignedUser",
        cell: ({ row }) => {
          const user = row.original.assignedUser;
          if (!user) return "-";
          return `${user.first_name} ${user.last_name}`;
        },
      },
      // {

      //   header: "User",
      //   accessorKey: "userId",
      //   cell: ({ row }) => {
      //     const user = row.original?.userId;
      //     if (!user) return "-";
      //     const name = [user.first_name, user.last_name]
      //       .filter(Boolean)
      //       .join(" ");
      //     const phone = user.phone;
      //     if (name && phone) return `${name} (${phone})`;
      //     return name || phone || "-";
      //   },
      // },
      // {
      //   header: "Amount",
      //   accessorKey: "totalPrice",
      //   cell: ({ getValue }) => `₹ ${getValue()}`,
      // },
      // {
      //   header: "Status",
      //   accessorKey: "status",
      //   cell: ({ getValue }) => {
      //     const value = getValue();
      //     const badgeProps = statusVariants[value] || { variant: "secondary" };
      //     return (
      //       <Badge variant={badgeProps.variant} className="text-xs">
      //         {value}
      //       </Badge>
      //     );
      //   },
      // },
    ],
    []
  );

  const renderActions = (request) => (
    <div className="flex gap-2">
      <Link
        href={`/admin/edit-product-order?id=${request._id}`}
        className="text-yellow-600 hover:text-yellow-800"
        title="Edit"
      >
        <Edit size={16} />
      </Link>
    </div>
  );

  return (
    <div className="p-4 flex flex-col gap-6">
      <div className="bg-white dark:bg-background border shadow rounded-lg p-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-4">
          <div className="w-full md:w-2/3 flex items-center gap-2">
            <input
              type="text"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Search by Order ID"
              className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-background"
            />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border border-border rounded-lg px-3 py-2 text-sm bg-background"
            >
              <option value="">All Status</option>
              {statusOptions.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
            <Button onClick={handleSearch} variant="default" size="sm">
              Search
            </Button>
          </div>
        </div>

        <DataTable
          columns={columns}
          data={requests}
          renderActions={renderActions}
          currentPage={currentPage}
          limit={limit}
        />

        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
          onLimitChange={(newLimit) => {
            setLimit(newLimit);
            setCurrentPage(1);
            router.push(`?page=1&limit=${newLimit}`);
          }}
          limit={limit}
        />
      </div>
    </div>
  );
};

export default OrderRequestsList;


