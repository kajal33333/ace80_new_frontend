"use client"
import React from "react";
import { X } from "lucide-react";
import { Button } from "./ui/button";

const ConfirmationModal = ({ isOpen, onClose, onConfirm, title = "Confirm Deletion", children, description = "Are you sure you want to delete this item? This action cannot be undone.", confirmButtonText = "Delete", confirmButtonVariant = "outline", }) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-title"
      aria-describedby="delete-description"
    >
      <div className="bg-green-50 dark:bg-amber-950 rounded-xl shadow-xl w-full max-w-sm p-6 relative animate-in fade-in-0 zoom-in-95 border border-green-200 dark:border-amber-900">
        {/* Close Icon (optional) */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-amber-900 hover:text-green-700 dark:hover:text-amber-200"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>


        <h2 id="delete-title" className="text-lg font-semibold text-green-900 dark:text-amber-200">
          {title}
        </h2>
        {children ? (

          <div className="mt-4">{children}</div>
        ) : (

          <p id="delete-description" className="text-sm text-amber-900 dark:text-amber-300 mt-2">
            {description}
          </p>
        )}

        {/* Action Buttons */}
        <div className="mt-6 flex justify-end gap-2">
          <Button
            variant="outline"
            onClick={onClose}
            className="px-4 py-2 text-sm rounded-md border border-green-700 text-green-900 hover:bg-green-100 dark:border-amber-700 dark:text-amber-200 dark:hover:bg-amber-900 transition"
          >
            Cancel
          </Button>
          <Button
            variant={confirmButtonVariant}
            onClick={onConfirm}
            className="px-4 py-2 text-sm rounded-md border border-yellow-700 bg-yellow-200 text-yellow-900 hover:bg-yellow-300 dark:border-amber-500 dark:bg-amber-900 dark:text-amber-200 dark:hover:bg-amber-800 transition"
          >
            {confirmButtonText}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;
