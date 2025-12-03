




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

const DivisionList = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialPage = Number(searchParams.get("page")) || 1;
  const initialLimit = Number(searchParams.get("limit")) || 10;

  const [reports, setReports] = useState([]);
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [limit, setLimit] = useState(initialLimit);
  const [totalPages, setTotalPages] = useState(1);
  const [searchText, setSearchText] = useState("");

  const [deleteId, setDeleteId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
const [allowedActions, setAllowedActions] = useState([]);
// Filter-related states
  const [selectedCity, setSelectedCity] = useState("");
  const [selectedAssignedTo, setSelectedAssignedTo] = useState("");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [tempCity, setTempCity] = useState(null); // { value, label } or null
  const [tempAssignedTo, setTempAssignedTo] = useState("");
  const instance = axiosInstance();

  const fetchReports = async () => {
    try {
      const queryParams = new URLSearchParams();
      queryParams.append("page", currentPage);
      queryParams.append("limit", limit);
      if (searchText.trim()) queryParams.append("search", searchText.trim());

      const response = await instance.get(`/enquiryDivision?${queryParams.toString()}`);
      if (response?.status === 200) {
       const { data, pagination } = response.data;
        setReports(data || []);
        if (pagination) {
          setCurrentPage(pagination.currentPage);
          setLimit(pagination.limit);
          setTotalPages(pagination.totalPages);
        //    setAllowedActions(allowedActions);
        }
        
      }
    } catch (error) {
      console.error("Error fetching reports:", error);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [currentPage, limit]);

  const handleSearch = () => {
    setCurrentPage(1);
    router.push(`?page=1&limit=${limit}`);
    fetchReports();
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

  const deleteReport = async () => {
    try {
      const response = await instance.delete(`/enquiryDivision?id=${deleteId}`);
      if (response?.status === 200) {
        showSuccess(response?.data?.message || "Report deleted");
        fetchReports();
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
    { header: "Name", accessorKey: "name" },
   
    { 
    header: "Created At",
        accessorKey: "createdAt",
      
    },
       {
        header: "Updated At",
        accessorKey: "updatedAt",
       
      },
     
      
    ],
    []
  );


  const renderActions = (report) => (
    <div className="flex gap-2">
   
      <Link href={`/admin/view-division?id=${report.id}`} className="text-blue-600 hover:text-blue-800">
        <Eye size={16} />
      </Link>

     
      <Link href={`/admin/edit-division?id=${report.id}`} className="text-yellow-600 hover:text-yellow-800">
        <Edit size={16} />
      </Link>
    
   
      <button
        onClick={() => openDeleteModal(report.id)}
        className="text-red-500 hover:text-red-800"
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
              placeholder="Search by company, phone or email"
              className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-background"
            />
            <Button onClick={handleSearch} variant="default" size="sm">
              Search
            </Button>
          </div>

        
  <Link href="/admin/add-division">
    <Button variant="default" size="sm" className="gap-2">
      <IconPlus size={16} /> Add Division
    </Button>
  </Link>

        </div>

        {/* Table */}
        <DataTable
          columns={columns}
          data={reports}
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
        onConfirm={deleteReport}
        title="Confirm Deletion"
        description="Are you sure you want to delete this report? This action cannot be undone."
        confirmButtonText="Delete"
        confirmButtonVariant="outline"
      />
    </div>
  );
};

export default DivisionList;
