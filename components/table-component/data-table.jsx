"use client";
import React, { useState } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  flexRender,
} from "@tanstack/react-table";

const DataTable = ({ columns, data, renderActions, currentPage, limit }) => {
  const [sorting, setSorting] = useState([]);

  const serialNumberColumn = {
    id: "serialNumber",
    header: "S.No.",
    cell: (info) => (currentPage - 1) * limit + info.row.index + 1,
    enableSorting: false, // Disable sorting for this column
  };

  const allColumns = [serialNumberColumn, ...columns];

  const table = useReactTable({
    data,
    columns: allColumns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <div className="rounded-xl overflow-hidden border border-border bg-background shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm text-left">
          <thead className="bg-muted text-muted-foreground">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    onClick={
                      header.column.getCanSort()
                        ? header.column.getToggleSortingHandler()
                        : undefined
                    }
                    className={`px-4 py-3 font-medium uppercase tracking-wide ${
                      header.column.getCanSort()
                        ? "cursor-pointer select-none"
                        : "cursor-default"
                    }`}
                  >
                    {flexRender(header.column.columnDef.header, header.getContext())}
                    {header.column.getCanSort() && (
                      <span className="ml-1">
                        {header.column.getIsSorted() === "asc"
                          ? "▲"
                          : header.column.getIsSorted() === "desc"
                          ? "▼"
                          : ""}
                      </span>
                    )}
                  </th>
                ))}
                {renderActions && (
                  <th className="px-4 py-3 font-medium uppercase tracking-wide">
                    Actions
                  </th>
                )}
              </tr>
            ))}
          </thead>
          <tbody className="divide-y divide-border">
            {table.getRowModel().rows.map((row) => (
              <tr key={row.id} className="hover:bg-muted/40 transition-colors">
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="px-4 py-3 text-foreground">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
                {renderActions && (
                  <td className="px-4 py-3 text-foreground">
                    {renderActions(row.original)}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DataTable;