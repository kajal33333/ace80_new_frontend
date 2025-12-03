"use client";
import React, { useEffect, useMemo, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, Edit, Trash, LucideToggleLeft, LucideToggleRight } from "lucide-react";
import { IconPlus } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import ConfirmationModal from "@/components/confirmation-modal";
import DataTable from "@/components/table-component/data-table";
import Pagination from "@/components/pagination-component/pagination";
import axiosInstance from "@/lib/axiosInstance";
import { showSuccess } from "@/lib/toastUtils";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";

const ProductsList = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialPage = Number(searchParams.get("page")) || 1;
  const initialLimit = Number(searchParams.get("limit")) || 10;

  const instance = axiosInstance();
  const [customers, setCustomers] = useState([]);

  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [limit, setLimit] = useState(initialLimit);
  const [searchText, setSearchText] = useState("");

  const [modalType, setModalType] = useState(null); // 'delete' | 'toggle'
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const FileUrl = process.env.NEXT_PUBLIC_FILEURL;

  const fetchCustomers = async () => {
  try {
    const query = searchText.trim()
      ? `/customer?q=${searchText.trim()}`
      : `/customer?page=${currentPage}&limit=${limit}`;

    const response = await instance.get(query);

    if (response?.status === 200) {
      const { data, pagination } = response.data;
      setCustomers(data || []);
      if (!searchText.trim() && pagination) {
        setCurrentPage(pagination.currentPage);
        setLimit(pagination.limit);
        setTotalPages(pagination.totalPages);
      } else {
        setTotalPages(1);
      }
    }
  } catch (error) {
    console.error("Error fetching customers:", error);
  }
};

  useEffect(() => {
    fetchCustomers();
  }, [currentPage, limit]);

  const handleSearch = () => {
    setCurrentPage(1);
    router.push(`?page=1&limit=${limit}`);
   fetchCustomers();
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleSearch();
  };

  const openDeleteModal = (id) => {
    setSelectedProduct({ id });
    setModalType('delete');
    setIsModalOpen(true);
  };

  const openToggleModal = (product) => {
    setSelectedProduct(product);
    setModalType('toggle');
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setSelectedProduct(null);
    setModalType(null);
    setIsModalOpen(false);
  };

  const handleDelete = async () => {
    try {
      const response = await instance.delete(`/customer?id=${selectedProduct.id}`);
      if (response?.status === 200) {
        showSuccess(response?.data?.message);
      fetchCustomers();
      }
    } catch (error) {
      console.error("Delete error:", error);
    }
    closeModal();
  };

  const handleToggleStatus = async () => {
    if (!selectedProduct) return;
    try {
      const response = selectedProduct.isActive
        ? await instance.put(`/product-master/disable/${selectedProduct._id}`)
        : await instance.put(`/product-master/enable/${selectedProduct._id}`);
      if (response?.status === 200) {
        showSuccess(response?.data?.message);
      fetchCustomers();
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

  const renderActions = (product) => (
    <div className="flex gap-2">
      <Link
        href={`/admin/view-products?id=${product.id}`}
        className="text-blue-600 hover:text-blue-800"
        title="Preview"
      >
        <Eye size={16} />
      </Link>
      <Link
        href={`/admin/edit-products?id=${product.id}`}
        className="text-yellow-600 hover:text-yellow-800"
        title="Edit"
      >
        <Edit size={16} />
      </Link>
      <button
        onClick={() => openToggleModal(product)}
        className="text-green-600 hover:text-green-800 cursor-pointer"
        title={product.isActive ? "Inactive" : "Active"}
      >
        {product.isActive ? <LucideToggleRight size={16} /> : <LucideToggleLeft size={16} />}
      </button>
      <button
          onClick={() => openDeleteModal(product.id)}
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
          <Link href="/admin/add-products">
            <Button
              variant="default"
              size="sm"
              className="gap-2"
            >
              <IconPlus size={16} />
              <span className="hidden sm:inline">Add Customer</span>
            </Button>
          </Link>
        </div>

        {/* Table */}
        <DataTable
          columns={columns}
          data={customers}
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
          modalType === 'delete' ? handleDelete :
          modalType === 'toggle' ? handleToggleStatus :
          undefined
        }
        title={
          modalType === 'delete' ? 'Confirm Deletion' :
          modalType === 'toggle' && selectedProduct ? (selectedProduct.isActive ? 'Disable Product' : 'Enable Product') :
          ''
        }
        description={
          modalType === 'delete' ? 'Are you sure you want to delete this product? This action cannot be undone.' :
          modalType === 'toggle' && selectedProduct ? (
            selectedProduct.isActive
              ? 'Are you sure you want to disable this product? You can enable it again later.'
              : 'Are you sure you want to enable this product?'
          ) :
          ''
        }
        confirmButtonText={
          modalType === 'delete' ? 'Delete' :
          modalType === 'toggle' && selectedProduct ? (selectedProduct.isActive ? 'Disable' : 'Enable') :
          ''
        }
        confirmButtonVariant={modalType === 'delete' ? 'outline' : 'outline'}
      />
    </div>
  );
};

export default ProductsList;
