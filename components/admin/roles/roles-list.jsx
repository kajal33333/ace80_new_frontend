"use client";
import React, { useEffect, useMemo, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Eye,
  Edit,
  Trash,
  LucideToggleLeft,
  LucideToggleRight,
  Lock, Shield,
  Key,
} from "lucide-react";
import { IconPlus } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import ConfirmationModal from "@/components/confirmation-modal";
import DataTable from "@/components/table-component/data-table";
import Pagination from "@/components/pagination-component/pagination";
import axiosInstance from "@/lib/axiosInstance";
import { showSuccess } from "@/lib/toastUtils";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";

const RoleList = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialPage = Number(searchParams.get("page")) || 1;
  const initialLimit = Number(searchParams.get("limit")) || 10;

  const instance = axiosInstance();
  const [crops, setCrops] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [limit, setLimit] = useState(initialLimit);
  const [searchText, setSearchText] = useState("");

  const [modalType, setModalType] = useState(null); // 'delete' | 'toggle'
  const [selectedCrop, setSelectedCrop] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const FileUrl = process.env.NEXT_PUBLIC_FILEURL;

  const fetchCrops = async () => {
    try {
      const query = searchText.trim()
        ? `/roles?page${searchText.trim()}`
        : `/roles?page${currentPage}&limit=${limit}`;

      const response = await instance.get(query);

      if (response?.status === 200) {
        const { data, pagination } = response.data;
        setCrops(data || []);
        if (!searchText.trim() && pagination) {
          setCurrentPage(pagination.currentPage);
          setLimit(pagination.limit);
          setTotalPages(pagination.totalPages);
        } else {
          setTotalPages(1);
        }
      }
    } catch (error) {
      console.error("Error fetching crops:", error);
    }
  };

  useEffect(() => {
    fetchCrops();
  }, [currentPage, limit]);

  const handleSearch = () => {
    setCurrentPage(1);
    router.push(`?page=1&limit=${limit}`);
    fetchCrops();
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleSearch();
  };

  const openDeleteModal = (role_id) => {
  setSelectedCrop({ role_id });
  setModalType("delete");
  setIsModalOpen(true);
};


  const openToggleModal = (crop) => {
    setSelectedCrop(crop);
    setModalType("toggle");
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setSelectedCrop(null);
    setModalType(null);
    setIsModalOpen(false);
  };

  const handleDelete = async () => {
    try {
     const response = await instance.delete(`/roles?id=${selectedCrop.role_id}`);

      if (response?.status === 200) {
        showSuccess(response?.data?.message);
        fetchCrops();
      }
    } catch (error) {
      console.error("Delete error:", error);
    }
    closeModal();
  };

  const handleToggleStatus = async () => {
    if (!selectedCrop) return;
    try {
      const response = selectedCrop.isActive
        ? await instance.put(`/crop-master/disable/${selectedCrop._id}`)
        : await instance.put(`/crop-master/enable/${selectedCrop._id}`);
      if (response?.status === 200) {
        showSuccess(response?.data?.message);
        fetchCrops();
      }
    } catch (error) {
      console.error("Toggle status error:", error);
    }
    closeModal();
  };

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      router.push(`?page=${page}&limit=${limit}`);
    }
  };

  const columns = useMemo(
    () => [
      { header: "Name", accessorKey: "role_name" },
      {
        header: "Description",
        accessorKey: "description",
      },

      { header: "Created At", accessorKey: "createdAt" },
      { header: "Updated At", accessorKey: "updatedAt" },

      {
        header: "Status",
        accessorKey: "isActive",
        cell: ({ getValue }) =>
          getValue() ? (
            <Badge
              variant="default"
              className="bg-primary text-primary-foreground"
            >
              Active
            </Badge>
          ) : (
            <Badge
              variant="secondary"
              className="border border-[color:oklch(0.52_0.08_60)] text-[color:oklch(0.3_0.035_40)]"
            >
              Inactive
            </Badge>
          ),
      },
    ],
    []
  );

  const renderActions = (crop) => (
    <div className="flex gap-2">
      <Link
     href={`/admin/view-role?id=${crop.role_id}`}
        className="text-blue-600 hover:text-blue-800"
        title="Preview"
      >
        <Eye size={16} />
      </Link>
      <Link
      href={`/admin/edit-role?id=${crop.role_id}`}

        className="text-yellow-600 hover:text-yellow-800"
        title="Edit"
      >
        <Edit size={16} />
      </Link>
<Link
  href={`/admin/role-permissions?id=${crop.role_id}`}
  className="flex items-center gap-1 text-green-600 hover:text-green-800"
  title={`View Permission: ${crop.permissionType}`}
>
  <Lock size={16} />
  <span>{crop.permissionType}</span>
</Link>
      {/* <button
        onClick={() => openToggleModal(crop)}
        className="text-green-600 hover:text-green-800 cursor-pointer"
        title={crop.isActive ? "Inactive" : "Active"}
      >
        {crop.isActive ? (
          <LucideToggleRight size={16} />
        ) : (
          <LucideToggleLeft size={16} />
        )}
      </button> */}
      <button
      onClick={() => openDeleteModal(crop.role_id)}
        className="text-red-600 hover:text-red-800 cursor-pointer"
        title="Delete"
      >
        <Trash size={16} />
      </button>
    </div>
  );

  return (
    <div className="p-4 flex flex-col gap-6">
      <div className="bg-white dark:bg-background border shadow rounded-lg p-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-4">
          {/* Search */}
          <div className="w-full md:w-1/2 flex items-center gap-2">
            <input
              type="text"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Search by name or category or variety or season"
              className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-background"
            />
            <Button onClick={handleSearch} variant="default" size="sm">
              Search
            </Button>
          </div>

          {/* Add Button */}
          <Link href="/admin/add-role">
            <Button variant="default" size="sm" className="gap-2">
              <IconPlus size={16} />
              <span className="hidden sm:inline">Add</span>
            </Button>
          </Link>
        </div>

        {/* Table */}
        <DataTable
          columns={columns}
          data={crops}
          renderActions={renderActions}
          currentPage={currentPage}
          limit={limit}
        />

        {/* Pagination */}
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

      {/* Modal */}
      <ConfirmationModal
        isOpen={isModalOpen}
        onClose={closeModal}
        onConfirm={
          modalType === "delete"
            ? handleDelete
            : modalType === "toggle"
            ? handleToggleStatus
            : undefined
        }
        title={
          modalType === "delete"
            ? "Confirm Deletion"
            : modalType === "toggle" && selectedCrop
            ? selectedCrop.isActive
              ? "Disable Crop"
              : "Enable Crop"
            : ""
        }
        description={
          modalType === "delete"
            ? "Are you sure you want to delete this crop? This action cannot be undone."
            : modalType === "toggle" && selectedCrop
            ? selectedCrop.isActive
              ? "Are you sure you want to disable this crop? You can enable it again later."
              : "Are you sure you want to enable this crop?"
            : ""
        }
        confirmButtonText={
          modalType === "delete"
            ? "Delete"
            : modalType === "toggle" && selectedCrop
            ? selectedCrop.isActive
              ? "Disable"
              : "Enable"
            : ""
        }
        confirmButtonVariant={modalType === "delete" ? "outline" : "outline"}
      />
    </div>
  );
};

export default RoleList;
