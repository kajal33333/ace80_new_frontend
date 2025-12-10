





"use client";
import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, Edit, Trash } from "lucide-react";
import { IconPlus } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import ConfirmationModal from "@/components/confirmation-modal";
import DataTable from "@/components/table-component/data-table";
import Pagination from "@/components/pagination-component/pagination";
import Select from "react-select";
import axiosInstance from "@/lib/axiosInstance";
import { showSuccess } from "@/lib/toastUtils";
import { format } from "date-fns";

const   DailyReportList = () => {
  const router = useRouter();
  const [reports, setReports] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [searchText, setSearchText] = useState("");
  const [deleteId, setDeleteId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [allowedActions, setAllowedActions] = useState([]);

  // Filter states
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [citiesList, setCitiesList] = useState([]);
  const [usersList, setUsersList] = useState([]);
  const [selectedCity, setSelectedCity] = useState("");
  const [selectedAssignedTo, setSelectedAssignedTo] = useState("");
  const [tempCity, setTempCity] = useState(null);
  const [tempAssignedTo, setTempAssignedTo] = useState("");

  const instance = axiosInstance();

  // Fetch reports
  const fetchReports = async () => {
    try {
      const queryParams = new URLSearchParams();
      queryParams.append("page", currentPage);
      queryParams.append("limit", limit);
      if (searchText.trim()) queryParams.append("search", searchText.trim());
      if (selectedCity) queryParams.append("city", selectedCity);
      if (selectedAssignedTo) queryParams.append("assignedTo", selectedAssignedTo);

      const response = await instance.get(`/dailyReport?${queryParams.toString()}`);
      if (response?.status === 200) {
        const { data, pagination, allowedActions } = response.data;
        setReports(data || []);
        if (pagination) {
          setCurrentPage(pagination.currentPage);
          setLimit(pagination.limit);
          setTotalPages(pagination.totalPages);
          setAllowedActions(allowedActions);
        }
      }
    } catch (error) {
      console.error("Error fetching reports:", error);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [currentPage, limit, selectedCity, selectedAssignedTo]);

  // Fetch cities and users for filter
  const fetchCities = async () => {
    try {
      const res = await instance.get("/cities");
      const cities = res.data?.data || [];
      setCitiesList(cities.map(c => ({ value: c.id.toString(), label: c.name })));
    } catch (err) {
      console.error("Failed to fetch cities", err);
    }
  };

  const fetchUsers = async () => {
  try {
    const res = await instance.get("/users");
    const users = res.data?.data || [];
    setUsersList(users);     
    return users;            
  } catch (err) {
    console.error("Failed to fetch users", err);
    setUsersList([]);        
    return [];
  }
};

 useEffect(() => {
  if (isFilterOpen) {
    
    const loadFilters = async () => {
      await fetchCities();   
      await fetchUsers();

     
      if (selectedCity && citiesList.length > 0) {
        const found = citiesList.find(c => c.value === selectedCity);
        setTempCity(found || null);
      }
      setTempAssignedTo(selectedAssignedTo || "");
    };

    loadFilters();
  }
}, [isFilterOpen]);


  // Delete report
  const openDeleteModal = (id) => {
    setDeleteId(id);
    setIsModalOpen(true);
  };
  const closeModal = () => setIsModalOpen(false);
  const deleteReport = async () => {
    try {
      const response = await instance.delete(`/dailyReport?id=${deleteId}`);
      if (response?.status === 200) {
        showSuccess(response?.data?.message || "Report deleted");
        fetchReports();
      }
    } catch (err) {
      console.error("Delete error:", err);
    }
    closeModal();
  };



  const handleApplyFilter = () => {
    setSelectedCity(tempCity ? tempCity.value : "");
    setSelectedAssignedTo(tempAssignedTo || "");
    setCurrentPage(1);
    setIsFilterOpen(false);
  };

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      router.push(`?page=${page}&limit=${limit}`);
    }
  };
  const handleResetFilter = () => {
    setTempCity(null);
    setTempAssignedTo("");
    setSelectedCity("");
    setSelectedAssignedTo("");
    setCurrentPage(1);
    setIsFilterOpen(false);
  };

  const permittedActions = useMemo(() => {
    return allowedActions?.reduce((acc, action) => {
      if (action.actions) acc[action.menu_name] = true;
      return acc;
    }, {}) || {};
  }, [allowedActions]);

  const renderActions = (report) => (
    <div className="flex gap-2">
      {permittedActions.View && (
        <Link href={`/admin/view-daily-report?id=${report.id}`} className="text-blue-600 hover:text-blue-800">
          <Eye size={16} />
        </Link>
      )}
      {permittedActions.Edit && (
        <Link href={`/admin/edit-daily-report?id=${report.id}`} className="text-yellow-600 hover:text-yellow-800">
          <Edit size={16} />
        </Link>
      )}
      {permittedActions.Delete && (
        <button onClick={() => openDeleteModal(report.id)} className="text-red-500 hover:text-red-800">
          <Trash size={16} />
        </button>
      )}
    </div>
  );

  const columns = useMemo(() => [
    { header: "Report ID", accessorKey: "daily_report_id" },
    { header: "Report No", accessorKey: "daily_report_no" },
    {
      header: "Date of Visit",
      accessorKey: "date_of_visit",
      cell: ({ getValue }) => getValue() ? format(new Date(getValue()), "MMM dd, yyyy") : "-"
    },
    { header: "Time of Visit", accessorKey: "time_of_visit" },
    { header: "Company Name", accessorKey: "company_name" },
    { header: "Mobile No", accessorKey: "mobile_no" },
    { header: "Customer Email", accessorKey: "customer_email" },
    { header: "City", accessorKey: "cityInfo.name" },
    { header: "Assigned To", accessorKey: "assignedUser.user_name" },
  ], []);

  return (
    <div className="p-4 flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-4">
        <div className="w-full md:w-1/2 flex items-center gap-2">
          <input
            type="text"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            placeholder="Search by company, phone or email"
            className="w-full border border-border rounded-lg px-3 py-2 text-sm"
          />
          <Button onClick={() => { setCurrentPage(1); fetchReports(); }} variant="default" size="sm">
            Search
          </Button>
        </div>
        <div className="flex gap-2">
          {permittedActions.Create && (
            <Link href="/admin/add-report">
              <Button variant="default" size="sm" className="gap-2">
                <IconPlus size={16} /> Add
              </Button>
            </Link>
          )}
          <Button variant="outline" size="sm" onClick={() => setIsFilterOpen(true)}>
            Filter
          </Button>
        </div>
      </div>

      {/* Table */}
      <DataTable columns={columns} data={reports} renderActions={renderActions} currentPage={currentPage} limit={limit} />

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
      {/* Delete Modal */}
      <ConfirmationModal
        isOpen={isModalOpen}
        onClose={closeModal}
        onConfirm={deleteReport}
        title="Confirm Deletion"
        description="Are you sure you want to delete this report? This action cannot be undone."
        confirmButtonText="Delete"
        confirmButtonVariant="outline"
      />

    
     {/* Filter Modal */}
<ConfirmationModal
  isOpen={isFilterOpen}
  onClose={() => setIsFilterOpen(false)}
  onConfirm={handleApplyFilter}
  title="Filter Daily Reports"
  confirmButtonText="Apply Filter"
  confirmButtonVariant="default"
  cancelButtonText="Cancel"
>
  <div className="space-y-4">
    <div>
      <label className="block text-sm font-medium mb-1">City</label>
      <Select
        options={citiesList}
        value={tempCity}
        onChange={setTempCity}
        isClearable
        placeholder="Select city..."
        className="react-select-container"
        classNamePrefix="react-select"
      />
    </div>

    <div>
      <label className="block text-sm font-medium mb-1">Assigned To</label>
      <select
        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
        value={tempAssignedTo}
        onChange={(e) => setTempAssignedTo(e.target.value)}
      >
        <option value="">All Users</option>
        {usersList.map((u) => (
          <option key={u.id} value={u.id}>
            {u.first_name} {u.last_name}
          </option>
        ))}
      </select>
    </div>

    <Button variant="outline" size="sm" className="w-full" onClick={handleResetFilter}>
      Reset Filters
    </Button>
  </div>
</ConfirmationModal>
    </div>
  );
};

export default DailyReportList;
