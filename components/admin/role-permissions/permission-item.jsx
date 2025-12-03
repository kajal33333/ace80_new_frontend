

"use client";

import React, { useState, useEffect } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";

const PermissionItem = ({ item, onPermissionChange, parentChecked = true }) => {
  const [checked, setChecked] = useState(item.actions);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    setChecked(item.actions);
  }, [item.actions]);

  const effectiveChecked = parentChecked ? checked : false;
  const disabled = !parentChecked;
  const hasChildren = item.children && item.children.length > 0;

  const handleCheckboxChange = (e) => {
    const newVal = e.target.checked;
    setChecked(newVal);
    onPermissionChange(item.menu_id, newVal);
  };

  const toggleOpen = (e) => {
    if (hasChildren) {
      e.stopPropagation();
      setIsOpen((prev) => !prev);
    }
  };

  return (
    <div className={`my-1 ${item.parent_id !== 0 ? "ml-4" : ""}`}>
      <div
        className={`flex items-center p-2 rounded transition 
          ${hasChildren ? "cursor-pointer hover:bg-gray-100" : ""} 
          ${disabled ? "opacity-60" : "hover:bg-gray-50"} 
        `}
        onClick={toggleOpen}
      >
        {/* Expand/Collapse Icon */}
        {hasChildren ? (
          <button
            onClick={toggleOpen}
            className="p-1 text-gray-600 hover:text-gray-800"
            aria-label={isOpen ? "Collapse" : "Expand"}
          >
            {isOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </button>
        ) : (
          <div className="w-4 mr-2"></div> // keeps alignment
        )}

        {/* Checkbox + Label */}
        <div className="flex items-center gap-2 flex-1">
          <label className="flex items-center gap-2 cursor-pointer select-none">
           <Checkbox
  checked={effectiveChecked}
  onCheckedChange={(checked) => handleCheckboxChange({ target: { checked } })}
  disabled={disabled}
/>
 
            <span
              className={`text-sm font-medium ${
                disabled ? "text-gray-400" : "text-gray-800"
              }`}
            >
              {item.menu_name}
            </span>
          </label>
        </div>
      </div>

      {/* Child Items */}
      {hasChildren && isOpen && (
        <div className="ml-5 pl-3 border-l border-gray-200">
          {item.children.map((child) => (
            <PermissionItem
              key={child.menu_id}
              item={child}
              onPermissionChange={onPermissionChange}
              parentChecked={effectiveChecked}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default PermissionItem;
