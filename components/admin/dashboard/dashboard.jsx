"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { SectionCards } from "@/components/section-cards";
import axiosInstance from "@/lib/axiosInstance";
import { Button } from "@/components/ui/button";
import { ChartAreaInteractive } from "@/components/chart-area-interactive";

const Dashboard = () => {
  const instance = useMemo(() => axiosInstance(), []);

  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (fromDate) params.append("from", fromDate);
      if (toDate) params.append("to", toDate);
      const query = params.toString() ? `/dashboard/stats?${params.toString()}` : "/dashboard/stats";
      const response = await instance.get(query);
      if (response?.status === 200) {
        setStats(response?.data?.data || null);
      }
    } catch (error) {
      // Centralized toast handled by axios interceptor
    } finally {
      setLoading(false);
    }
  }, [fromDate, toDate, instance]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const onReset = () => {
    setFromDate("");
    setToDate("");
    // Re-fetch without filters
    setTimeout(() => fetchStats(), 0);
  };

  return (
    <div className="p-4 flex flex-col gap-6">
      <div className="bg-white dark:bg-background border shadow rounded-lg py-6">
        {/* Filters */}
        {/* <div className="px-4 lg:px-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 w-full sm:w-auto">
            <div className="flex flex-col gap-1">
              <label className="text-sm text-muted-foreground" htmlFor="fromDate">From</label>
              <input
                id="fromDate"
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-background"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm text-muted-foreground" htmlFor="toDate">To</label>
              <input
                id="toDate"
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-background"
              />
            </div>
            <div className="flex gap-2 items-end">
              <Button onClick={fetchStats} disabled={loading} size="sm">Apply</Button>
              <Button onClick={onReset} variant="outline" size="sm" disabled={loading}>Reset</Button>
            </div>
          </div>
        </div> */}

        {/* Stats */}
        <div className="mt-6">
          <SectionCards stats={stats} loading={loading} />
        </div>

        {/* Chart */}
        <div className="px-4 lg:px-6 mt-6">
          {/* <ChartAreaInteractive /> */}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
