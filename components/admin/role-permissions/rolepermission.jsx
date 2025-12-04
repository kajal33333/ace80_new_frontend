"use client";

import { useEffect, useState } from "react";
import axiosInstance from "@/lib/axiosInstance";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import PermissionItem from "./permission-item";
import { Button } from "@/components/ui/button";

import { showSuccess, showError } from "@/lib/toastUtils";

export default function RolePermissionPage() {
  const instance = axiosInstance();
  const [treeData, setTreeData] = useState([]);
  const searchParams = useSearchParams();
  const id = searchParams.get("id");

  useEffect(() => {
    if (id) fetchPermission(id);
  }, [id]);

  const fetchPermission = async (userRoleId) => {
    try {
      const response = await instance.get(`/permissions?role_id=${userRoleId}`, {
        headers: { pass: "pass" }
      });

      if (response?.data?.success) {
        setTreeData(response?.data?.data[0]?.children || []);
      }
    } catch (error) {
      console.error("Error fetching permissions:", error);
      showError("Failed to load permissions");
    }
  };

  const setAllChildren = (children, newVal) => {
    return children.map((child) => ({
      ...child,
      actions: newVal,
      children: child.children ? setAllChildren(child.children, newVal) : [],
    }));
  };

  const updateTreeNode = (nodes, menu_id, newVal) => {
    return nodes.map((node) => {
      if (node.menu_id === menu_id) {
        return {
          ...node,
          actions: newVal,
          children: node.children ? setAllChildren(node.children, newVal) : [],
        };
      } else if (node.children?.length > 0) {
        return {
          ...node,
          children: updateTreeNode(node.children, menu_id, newVal),
        };
      }
      return node;
    });
  };

  const handlePermissionChange = (menu_id, newVal) => {
    setTreeData((prevTree) => updateTreeNode(prevTree, menu_id, newVal));
  };

  const handleSubmit = async () => {
    const payload = {
      role_id: id,
      permissions: treeData,
    };

    try {
      const response = await instance.put("/permissions", payload, {
        headers: { pass: "pass" }
      });

      if (response?.data?.success) {
        showSuccess("Permissions updated successfully");
      }
    } catch (error) {
      console.error("Update error:", error);
      showError("Failed to update permissions");
    }
  };

  return (
    <div className="p-4 flex flex-col gap-6">
      <div className="bg-white dark:bg-background border shadow rounded-lg p-6">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
          <h2 className="text-xl font-semibold text-gray-800">Role Permissions</h2>

          <Link href="/admin/roles">
            <Button variant="default" size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90">
              Back
            </Button>
          </Link>
        </div>

        {/* Permission Tree */}
        {treeData.length === 0 ? (
          <p className="text-center text-gray-500 py-4">Loading permissions...</p>
        ) : (
          <div className="border rounded-lg p-4 bg-gray-100">
            {treeData.map((item) => (
              <PermissionItem
                key={item.menu_id}
                item={item}
                onPermissionChange={handlePermissionChange}
              />
            ))}
          </div>
        )}

        {/* Save Button */}
        <div className="mt-6 text-right">
          <Button
            onClick={handleSubmit}
            disabled={treeData.length === 0}
            className="bg-primary text-primary-foreground hover:bg-primary/90 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            Save Permissions
          </Button>
        </div>
      </div>
    </div>
  );
}
