"use client";
import React from "react";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

const PaginationComponent = ({
  onLimitChange,
  limit,
  currentPage,
  totalPages,
  onPageChange,
  siblingCount = 1,
}) => {
  const range = (start, end) => {
    const output = [];
    for (let i = start; i <= end; i++) output.push(i);
    return output;
  };

  const paginationRange = () => {
    const totalPageNumbers = siblingCount * 2 + 5;
    if (totalPages <= totalPageNumbers) return range(1, totalPages);

    const leftSibling = Math.max(currentPage - siblingCount, 1);
    const rightSibling = Math.min(currentPage + siblingCount, totalPages);

    const showLeftDots = leftSibling > 2;
    const showRightDots = rightSibling < totalPages - 1;
    const pages = [];

    if (!showLeftDots && showRightDots) {
      pages.push(...range(1, siblingCount * 2 + 3), "...", totalPages);
    } else if (showLeftDots && !showRightDots) {
      pages.push(1, "...", ...range(totalPages - (siblingCount * 2 + 2), totalPages));
    } else {
      pages.push(1, "...", ...range(leftSibling, rightSibling), "...", totalPages);
    }

    return pages;
  };

  const pages = paginationRange();

  return (
    <div className="mt-6 flex flex-col md:flex-row items-center justify-between gap-4">
      <Limit onLimitChange={onLimitChange} limit={limit} />

      <div className="overflow-x-auto">
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  if (currentPage > 1) onPageChange(currentPage - 1);
                }}
                className={cn(currentPage === 1 && "pointer-events-none opacity-50")}
              />
            </PaginationItem>

            {pages.map((page, index) =>
              page === "..." ? (
                <PaginationItem key={index}>
                  <PaginationEllipsis />
                </PaginationItem>
              ) : (
                <PaginationItem key={index}>
                  <PaginationLink
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      onPageChange(page);
                    }}
                    isActive={currentPage === page}
                  >
                    {page}
                  </PaginationLink>
                </PaginationItem>
              )
            )}

            <PaginationItem>
              <PaginationNext
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  if (currentPage < totalPages) onPageChange(currentPage + 1);
                }}
                className={cn(currentPage === totalPages && "pointer-events-none opacity-50")}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    </div>
  );
};

const Limit = ({ onLimitChange, limit }) => (
  <div className="flex items-center gap-2">
    <Label htmlFor="limit-select" className="text-sm text-muted-foreground">
      Rows:
    </Label>
    <Select value={limit.toString()} onValueChange={(value) => onLimitChange(parseInt(value))}>
      <SelectTrigger className="w-20 h-8">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {[2, 5, 10, 15, 20].map((num) => (
          <SelectItem key={num} value={num.toString()}>
            {num}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  </div>
);

export default PaginationComponent;
