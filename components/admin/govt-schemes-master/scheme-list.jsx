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
} from "lucide-react";
import { IconPlus } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import ConfirmationModal from "@/components/confirmation-modal";
import DataTable from "@/components/table-component/data-table";
import Pagination from "@/components/pagination-component/pagination";
import axiosInstance from "@/lib/axiosInstance";
import { showSuccess } from "@/lib/toastUtils";
import { Badge } from "@/components/ui/badge";

// Language list with ISO 639-2 codes and full names
const languages = [
  // { code: "eng", name: "English" },
  // { code: "hin", name: "Hindi" },
  // { code: "ben", name: "Bengali" },
  // { code: "tam", name: "Tamil" },
  // { code: "tel", name: "Telugu" },
//   { code: "mar", name: "Marathi" },
//   { code: "guj", name: "Gujarati" },
//   { code: "kann", name: "Kannada" },
//   { code: "mal", name: "Malayalam" },
//   { code: "ori", name: "Odia" },
//   { code: "pun", name: "Punjabi" },
];

const SchemesList = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialPage = Number(searchParams.get("page")) || 1;
  const initialLimit = Number(searchParams.get("limit")) || 10;

  const instance = axiosInstance();
  const [schemes, setSchemes] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [limit, setLimit] = useState(initialLimit);
  const [searchText, setSearchText] = useState("");

  const [modalType, setModalType] = useState(null); // 'delete' | 'toggle'
  const [selectedScheme, setSelectedScheme] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchSchemes = async () => {
    try {
      const query = searchText.trim()
        ? `/government-scheme?q=${searchText.trim()}`
        : `/government-scheme?page=${currentPage}&limit=${limit}`;

      const response = await instance.get(query);

      if (response?.status === 200) {
        const { data, pagination } = response.data;
        setSchemes(data || []);
        if (!searchText.trim() && pagination) {
          setCurrentPage(pagination.currentPage);
          setLimit(pagination.limit);
          setTotalPages(pagination.totalPages);
        } else {
          setTotalPages(1);
        }
      }
    } catch (error) {
      console.error("Error fetching schemes:", error);
    }
  };

  useEffect(() => {
    fetchSchemes();
  }, [currentPage, limit]);

  const handleSearch = () => {
    setCurrentPage(1);
    router.push(`?page=1&limit=${limit}`);
    fetchSchemes();
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleSearch();
  };

  const openDeleteModal = (id) => {
    setSelectedScheme({ id });
    setModalType("delete");
    setIsModalOpen(true);
  };

  const openToggleModal = (scheme) => {
    setSelectedScheme(scheme);
    setModalType("toggle");
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setSelectedScheme(null);
    setModalType(null);
    setIsModalOpen(false);
  };

  const handleDelete = async () => {
    try {
      const response = await instance.delete(
        `/government-scheme/${selectedScheme.id}`
      );
      if (response?.status === 200) {
        showSuccess(response?.data?.message);
        fetchSchemes();
      }
    } catch (error) {
      console.error("Delete error:", error);
    }
    closeModal();
  };

  const handleToggleStatus = async () => {
    if (!selectedScheme) return;
    try {
      const response = selectedScheme.isActive
        ? await instance.put(`/government-scheme/disable/${selectedScheme._id}`)
        : await instance.put(`/government-scheme/enable/${selectedScheme._id}`);
      if (response?.status === 200) {
        showSuccess(response?.data?.message);
        fetchSchemes();
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
      { header: "Scheme ID", accessorKey: "schemeId",
        cell: ({ getValue }) => {
          return <Link href={`/admin/view-schemes?id=${getValue()}`} className="text-blue-600 hover:text-blue-800">{getValue()}</Link>;
        },
       },
      { header: "Name", accessorKey: "name" },
      {
        header: "Languages",
        accessorKey: "translation",
        cell: ({ getValue }) => {
          const translations = getValue();

          if (!translations || translations.length === 0) {
            return <span className="text-muted-foreground">None</span>;
          }

          return (
            <div className="flex flex-wrap gap-1">
              {translations.map((t) => {
                const lang = languages.find((l) => l.code === t.language);
                return (
                  <Badge
                    key={t.language}
                    variant="secondary"
                    className="text-xs"
                  >
                    {lang ? lang.name : t.language.toUpperCase() || "Unknown"}
                  </Badge>
                );
              })}
            </div>
          );
        },
      },
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

  const renderActions = (scheme) => (
    <div className="flex gap-2">
      <Link
        href={`/admin/view-schemes?id=${scheme.schemeId}`}
        className="text-blue-600 hover:text-blue-800"
        title="Preview"
      >
        <Eye size={16} />
      </Link>
      <Link
        href={`/admin/edit-schemes?id=${scheme.schemeId}`}
        className="text-yellow-600 hover:text-yellow-800"
        title="Edit"
      >
        <Edit size={16} />
      </Link>
      <button
        onClick={() => openToggleModal(scheme)}
        className="text-green-600 hover:text-green-800 cursor-pointer"
        title={scheme.isActive ? "Inactive" : "Active"}
      >
        {scheme.isActive ? (
          <LucideToggleRight size={16} />
        ) : (
          <LucideToggleLeft size={16} />
        )}
      </button>
      <button
        onClick={() => openDeleteModal(scheme._id)}
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
              placeholder="Search by name, language, or scheme ID"
              className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-background"
            />
            <Button onClick={handleSearch} variant="default" size="sm">
              Search
            </Button>
          </div>

          {/* Add Button */}
          <Link href="/admin/add-schemes">
            <Button variant="default" size="sm" className="gap-2">
              <IconPlus size={16} />
              <span className="hidden sm:inline">Add Scheme</span>
            </Button>
          </Link>
        </div>

        {/* Table */}
        <DataTable
          columns={columns}
          data={schemes}
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
            : modalType === "toggle" && selectedScheme
            ? selectedScheme.isActive
              ? "Disable Scheme"
              : "Enable Scheme"
            : ""
        }
        description={
          modalType === "delete"
            ? "Are you sure you want to delete this scheme? This action cannot be undone."
            : modalType === "toggle" && selectedScheme
            ? selectedScheme.isActive
              ? "Are you sure you want to disable this scheme? You can enable it again later."
              : "Are you sure you want to enable this scheme?"
            : ""
        }
        confirmButtonText={
          modalType === "delete"
            ? "Delete"
            : modalType === "toggle" && selectedScheme
            ? selectedScheme.isActive
              ? "Disable"
              : "Enable"
            : ""
        }
        confirmButtonVariant={modalType === "delete" ? "outline" : "outline"}
      />
    </div>
  );
};

export default SchemesList;
