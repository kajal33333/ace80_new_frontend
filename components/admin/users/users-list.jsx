"use client";
import React, { useEffect, useMemo, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, Edit, Trash } from "lucide-react";
import { IconPlus } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import ConfirmationModal from "@/components/confirmation-modal";
import DataTable from "@/components/table-component/data-table";
import Pagination from "@/components/pagination-component/pagination";
import axiosInstance from "@/lib/axiosInstance";
import { showSuccess } from "@/lib/toastUtils";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
const UserList = () => {
  const FileUrl = process.env.NEXT_PUBLIC_FILEURL;
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialPage = Number(searchParams.get("page")) || 1;
  const initialLimit = Number(searchParams.get("limit")) || 10;

  const instance = axiosInstance();
  const [users, setUsers] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [limit, setLimit] = useState(initialLimit);
  const [searchText, setSearchText] = useState("");

  const [deleteId, setDeleteId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchUsers = async () => {
    try {
      const query = searchText.trim()
        ? `/users?q=${searchText.trim()}`
        : `/users?page=${currentPage}&limit=${limit}`;

      const response = await instance.get(query);

      if (response?.status === 200) {
        const { data, pagination } = response.data;
        setUsers(data || []);
        if (!searchText.trim() && pagination) {
          setCurrentPage(pagination.currentPage);
          setLimit(pagination.limit);
          setTotalPages(pagination.totalPages);
        } else {
          setTotalPages(1);
        }
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [currentPage, limit]);

  const handleSearch = () => {
    setCurrentPage(1);
    router.push(`?page=1&limit=${limit}`);
    fetchUsers();
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleSearch();
  };

  const openDeleteModal = (id) => {
    setDeleteId(id);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setDeleteId(null);
    setIsModalOpen(false);
  };

  const deleteUser = async () => {
    try {
      const response = await instance.delete(`/users/${deleteId}`);
      if (response?.status === 200) {
        showSuccess(response?.data?.message);
        fetchUsers();
      }
    } catch (error) {
      console.error("Delete error:", error);
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
      { header: "Emp Code", accessorKey: "emp_code" },

      { header: "First Name", accessorKey: "first_name" },
      { header: "Last Name", accessorKey: "last_name" },
      { header: "Email", accessorKey: "primary_email" },

      { header: "Phone", accessorKey: "contact" },
      { header: "admin", accessorKey: "isAdmin" },
      { header: "company", accessorKey: "company_name" },

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
      {
        header: "Created At",
        accessorKey: "createdAt",
        cell: ({ getValue }) => {
          const date = new Date(getValue());
          return format(date, "MMM dd, yyyy");
        },
      },
    ],
    []
  );

  const renderActions = (user) => (
    <div className="flex gap-2">
      <Link
        href={`/admin/view-user?id=${user.id}`}
        className="text-blue-600 hover:text-blue-800"
        title="Preview"
      >
        <Eye size={16} />
      </Link>
      <Link
        href={`/admin/edit-user?id=${user.id}`}
        className="text-yellow-600 hover:text-yellow-800"
        title="Edit"
      >
        <Edit size={16} />
      </Link>
      <button
        onClick={() => openDeleteModal(user.id)}
        className="text-red-500 hover:text-red-800 cursor-pointer"
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
              placeholder="Search by phone, name or email"
              className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-background"
            />
            <Button onClick={handleSearch} variant="default" size="sm">
              Search
            </Button>
          </div>

          {/* Add Button */}
          <Link href="/admin/add-user">
            <Button variant="default" size="sm" className="gap-2">
              <IconPlus size={16} />
              <span className="hidden sm:inline">Add User</span>
            </Button>
          </Link>
        </div>

        {/* Table */}
        <DataTable
          columns={columns}
          data={users}
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
        onConfirm={deleteUser}
        title="Confirm Deletion"
        description="Are you sure you want to delete this user? This action cannot be undone."
        confirmButtonText="Delete"
        confirmButtonVariant="outline"
      />
    </div>
  );
};

export default UserList;
