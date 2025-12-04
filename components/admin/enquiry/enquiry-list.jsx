









"use client";
import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, Edit, Trash } from "lucide-react";
import { Button } from "@/components/ui/button";
import ConfirmationModal from "@/components/confirmation-modal";
import DataTable from "@/components/table-component/data-table";
import Pagination from "@/components/pagination-component/pagination";
import Select from "react-select";
import axiosInstance from "@/lib/axiosInstance";
import { showSuccess } from "@/lib/toastUtils";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";

const EnquiryList = () => {
  const router = useRouter();
  const instance = axiosInstance();

  const [reports, setReports] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [searchText, setSearchText] = useState("");
  const [deleteId, setDeleteId] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [allowedActions, setAllowedActions] = useState([]);

  // Filter states
  const [selectedDivision, setSelectedDivision] = useState("");
  const [selectedRegion, setSelectedRegion] = useState("");
  const [selectedAssignedTo, setSelectedAssignedTo] = useState("");
  const [selectedCustomerCategory, setSelectedCustomerCategory] = useState("");

  // Temp filter values
  const [tempDivision, setTempDivision] = useState(null);
  const [tempRegion, setTempRegion] = useState(null);
  const [tempAssignedTo, setTempAssignedTo] = useState("");
  const [tempCustomerCategory, setTempCustomerCategory] = useState(null);

  // Filter dropdown data
  const [divisionsList, setDivisionsList] = useState([]);
  const [regionsList, setRegionsList] = useState([]);
  const [usersList, setUsersList] = useState([]);
  const [customerCategoriesList, setCustomerCategoriesList] = useState([]);

  // Fetch Enquiry
  const fetchEnquiry = async () => {
    try {
      const queryParams = new URLSearchParams();
      queryParams.append("page", currentPage);
      queryParams.append("limit", limit);
      if (searchText.trim()) queryParams.append("search", searchText.trim());
      if (selectedDivision) queryParams.append("division", selectedDivision);
      if (selectedRegion) queryParams.append("region", selectedRegion);
      if (selectedAssignedTo) queryParams.append("assignedTo", selectedAssignedTo);
      if (selectedCustomerCategory) queryParams.append("customer_category", selectedCustomerCategory);

      const response = await instance.get(`/enquiry?${queryParams.toString()}`);
      if (response?.status === 200) {
        const { data, pagination, allowedActions } = response.data;
        console.log("Allowed Actions:", allowedActions);
        setReports(data || []);
        if (pagination) {
          setCurrentPage(pagination.currentPage);
          setLimit(pagination.limit);
          setTotalPages(pagination.totalPages || 1);
        }
        setAllowedActions(allowedActions || []);
      }
    } catch (error) {
      console.error("Error fetching enquiry:", error);
    }
  };

  useEffect(() => {
    fetchEnquiry();
  }, [currentPage, limit, selectedDivision, selectedRegion, selectedAssignedTo, selectedCustomerCategory]);

  
  // Load saved filters from localStorage
  useEffect(() => {
    const saved = {
      division: localStorage.getItem("enquiryFilterDivision") || "",
      region: localStorage.getItem("enquiryFilterRegion") || "",
      assignedTo: localStorage.getItem("enquiryFilterAssignedTo") || "",
      customerCategory: localStorage.getItem("enquiryFilterCustomerCategory") || "",
    };
    setSelectedDivision(saved.division);
    setSelectedRegion(saved.region);
    setSelectedAssignedTo(saved.assignedTo);
    setSelectedCustomerCategory(saved.customerCategory);
  }, []);

  // Save filters to localStorage
  useEffect(() => {
    localStorage.setItem("enquiryFilterDivision", selectedDivision);
    localStorage.setItem("enquiryFilterRegion", selectedRegion);
    localStorage.setItem("enquiryFilterAssignedTo", selectedAssignedTo);
    localStorage.setItem("enquiryFilterCustomerCategory", selectedCustomerCategory);
  }, [selectedDivision, selectedRegion, selectedAssignedTo, selectedCustomerCategory]);

  // Fetch filter options when modal opens
  useEffect(() => {
    if (!isFilterOpen) return;

    const loadFilters = async () => {
      try {
        const [divRes, regRes, catRes, userRes] = await Promise.all([
          instance.get("/enquiryDivision"),
          instance.get("/enquiryRegion"),
          instance.get("/enquiryCustomerCategory"),
          instance.get("/users"),
        ]);

        setDivisionsList((divRes.data?.data || []).map(d => ({ value: d.id.toString(), label: d.name })));
        setRegionsList((regRes.data?.data || []).map(r => ({ value: r.id.toString(), label: r.name })));
        setCustomerCategoriesList((catRes.data?.data || []).map(c => ({ value: c.id.toString(), label: c.name })));
        setUsersList(userRes.data?.data || []);

        // Set temp values from selected
        setTempAssignedTo(selectedAssignedTo);
        setTempDivision(divisionsList.find(d => d.value === selectedDivision) || null);
        setTempRegion(regionsList.find(r => r.value === selectedRegion) || null);
        setTempCustomerCategory(customerCategoriesList.find(c => c.value === selectedCustomerCategory) || null);
      } catch (err) {
        console.error("Failed to load filter options", err);
      }
    };

    loadFilters();
  }, [isFilterOpen]);

  // Delete handlers
  const openDeleteModal = (id) => {
    setDeleteId(id);
    setIsDeleteModalOpen(true);
  };

  const deleteReport = async () => {
    try {
      const res = await instance.delete(`/enquiry?id=${deleteId}`);
      if (res?.status === 200) {
        showSuccess(res.data?.message || "Enquiry deleted successfully");
        fetchEnquiry();
      }
    } catch (err) {
      console.error("Delete failed", err);
    }
    setIsDeleteModalOpen(false);
  };

  // Filter handlers
  const handleApplyFilter = () => {
    setSelectedDivision(tempDivision?.value || "");
    setSelectedRegion(tempRegion?.value || "");
    setSelectedCustomerCategory(tempCustomerCategory?.value || "");
    setSelectedAssignedTo(tempAssignedTo || "");
    setCurrentPage(1);
    setIsFilterOpen(false);
  };

  const handleResetFilter = () => {
    setTempDivision(null);
    setTempRegion(null);
    setTempCustomerCategory(null);
    setTempAssignedTo("");

    setSelectedDivision("");
    setSelectedRegion("");
    setSelectedCustomerCategory("");
    setSelectedAssignedTo("");

    localStorage.removeItem("enquiryFilterDivision");
    localStorage.removeItem("enquiryFilterRegion");
    localStorage.removeItem("enquiryFilterCustomerCategory");
    localStorage.removeItem("enquiryFilterAssignedTo");

    setCurrentPage(1);
    setIsFilterOpen(false);
  };

  const permittedActions = useMemo(() => {
    return allowedActions.reduce((acc, action) => {
      if (action.actions) acc[action.menu_name] = true;
      return acc;
    }, {}) || {};
  }, [allowedActions]);

  const renderActions = ({ row } = {}) => {
    // fallback if row or row.original is missing
    if (!row || !row.original) return null;

    return (
      <div className="flex gap-3">
        {permittedActions.View && (
          <Link href={`/enquiry/view-enquiry?id=${row.original.id}`} className="text-blue-600 hover:text-blue-800">
            <Eye size={16} />
          </Link>
        )}
        {permittedActions.Edit && (
          <Link href={`/enquiry/edit-enquiry?id=${row.original.id}`} className="text-yellow-600 hover:text-yellow-800">
            <Edit size={16} />
          </Link>
        )}
        {permittedActions.Delete && (
          <button onClick={() => openDeleteModal(row.original.id)} className="text-red-500 hover:text-red-800">
            <Trash size={16} />
          </button>
        )}
      </div>
    );
  };


  const columns = useMemo(() => [
    { header: "Enquiry ID", accessorKey: "enquiry_id" },
    {
      header: "Enquiry No",
      cell: ({ row }) => (
        <Link href={`/enquiry/view/${row.original.id}`} className="text-blue-600 font-medium hover:underline">
          {row.original.enquiry_no}
        </Link>
      ),
    },
    {
      header: "Enquiry Date",
      accessorKey: "enquiry_date",
      cell: ({ getValue }) => getValue() ? format(new Date(getValue()), "dd MMM yyyy") : "-",
    },
    { header: "Time of Visit", accessorKey: "time_of_visit" },
    { header: "Contact Person", accessorKey: "contact_person" },
    { header: "Division", accessorKey: "divisionInfo.name" },
    { header: "Region", accessorKey: "regionInfo.name" },
    { header: "Customer Category", accessorKey: "customerCategory.name" },
    {
      header: "EFC Status",
      accessorKey: "efc_status",
      cell: ({ getValue }) => {
        const status = getValue();
        return (
          <Badge variant={status === "Hot" ? "destructive" : status === "Warm" ? "default" : "secondary"}>
            {status || "-"}
          </Badge>
        );
      },
    },
    {
      header: "Expected Closing",
      accessorKey: "expected_closing_date",
      cell: ({ getValue }) => getValue() ? format(new Date(getValue()), "dd MMM yyyy") : "-",
    },
    {
      header: "Next Meeting",
      accessorKey: "next_meeting_date",
      cell: ({ getValue }) => getValue() ? format(new Date(getValue()), "dd MMM yyyy") : "-",
    },
    {
      header: "Assigned To",
      cell: ({ row }) => {
        const user = row.original.assignedUser;
        return user ? `${user.first_name} ${user.last_name || ""}`.trim() : "-";
      },
    },
  ], []);

  return (
    <div className="p-4 flex flex-col gap-6">
      <div className="bg-white border shadow rounded-lg p-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
          <div className="w-full md:w-1/2 flex items-center gap-2">
            <input
              type="text"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && (setCurrentPage(1), fetchEnquiry())}
              placeholder="Search by company, phone or email"
              className="w-full border rounded-lg px-3 py-2 text-sm"
            />
            <Button onClick={() => { setCurrentPage(1); fetchEnquiry(); }} size="sm">
              Search
            </Button>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsFilterOpen(true)}
          >
            Filter
          </Button>

        </div>

        <DataTable columns={columns} data={reports} renderActions={renderActions} currentPage={currentPage}
          limit={limit} />

        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={(page) => setCurrentPage(page)}
          onLimitChange={(newLimit) => { setLimit(newLimit); setCurrentPage(1); }}
          limit={limit}
        />
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={deleteReport}
        title="Confirm Deletion"
        description="Are you sure you want to delete this enquiry? This action cannot be undone."
        confirmButtonText="Delete"
        confirmButtonVariant="destructive"
      />

      {/* Filter Modal (using same ConfirmationModal) */}
      <ConfirmationModal
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        onConfirm={handleApplyFilter}
        title="Filter Enquiry"
        description={
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Division</label>
              <Select
                options={divisionsList}
                value={tempDivision}
                onChange={setTempDivision}
                isClearable
                placeholder="Select division..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Region</label>
              <Select
                options={regionsList}
                value={tempRegion}
                onChange={setTempRegion}
                isClearable
                placeholder="Select region..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Customer Category</label>
              <Select
                options={customerCategoriesList}
                value={tempCustomerCategory}
                onChange={setTempCustomerCategory}
                isClearable
                placeholder="Select category..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Assigned To</label>
              <select
                className="w-full border rounded px-3 py-2 text-sm"
                value={tempAssignedTo}
                onChange={(e) => setTempAssignedTo(e.target.value)}
              >
                <option value="">All Users</option>
                {usersList.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.first_name} {user.last_name}
                  </option>
                ))}
              </select>
            </div>
            <Button variant="outline" size="sm" onClick={handleResetFilter} className="w-full">
              Reset All Filters
            </Button>
          </div>
        }
        confirmButtonText="Apply Filters"
        confirmButtonVariant="default"
      />
    </div>
  );
};

export default EnquiryList;
