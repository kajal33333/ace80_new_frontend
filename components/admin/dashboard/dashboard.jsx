"use client";

import React, { useMemo, useState } from "react";
import axiosInstance from "@/lib/axiosInstance";

import {
  ChartContainer,
  ChartTooltipContent,
  ChartLegendContent,
} from "@/components/ui/chart";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from "recharts";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const Dashboard = () => {
  const instance = useMemo(() => axiosInstance(), []);

  const [selectedMonth, setSelectedMonth] = useState("all");

  const months = [
    { value: "all", label: "All Months" },
    { value: "01", label: "January" },
    { value: "02", label: "February" },
    { value: "03", label: "March" },
    { value: "04", label: "April" },
    { value: "05", label: "May" },
    { value: "06", label: "June" },
    { value: "07", label: "July" },
    { value: "08", label: "August" },
    { value: "09", label: "September" },
    { value: "10", label: "October" },
    { value: "11", label: "November" },
    { value: "12", label: "December" },
  ];

  const areaData = [
    { month: "User1", revenue: 4000 },
    { month: "User2", revenue: 3200 },
    { month: "User3", revenue: 5000 },
    { month: "User4", revenue: 4500 },
    { month: "User5", revenue: 6500 },
  ];

  const barData1 = [
    { name: "User A", target: 3700, achievement: 2400 },
    { name: "User B", target: 2500, achievement: 1398 },
    { name: "User C", target: 5000, achievement: 9800 },
    { name: "User D", target: 4000, achievement: 5000 },
    { name: "User E", target: 8000, achievement: 4509 },
  ];

  const barData2 = [
    { name: "Product E", sales: 1500 },
    { name: "Product F", sales: 4300 },
    { name: "Product G", sales: 6200 },
    { name: "Product H", sales: 2100 },
    { name: "Product I", sales: 3400 },
  ];

  const pieData = [
    { name: "Category A", value: 400 },
    { name: "Category B", value: 300 },
    { name: "Category C", value: 300 },
    { name: "Category D", value: 200 },
    { name: "Category E", value: 278 },
  ];

  return (
    <div className="p-4 flex flex-col gap-4">
      {/* Month Filter */}
      <div className="flex justify-end">
        <div className="flex items-center gap-3">
          <Label
            htmlFor="month-filter"
            className="text-base font-medium whitespace-nowrap"
          >
            Filter:
          </Label>
          <Select value={selectedMonth} onValueChange={setSelectedMonth}>
            <SelectTrigger id="month-filter" className="w-[180px]">
              <SelectValue placeholder="All Months" />
            </SelectTrigger>
            <SelectContent>
              {months.map((month) => (
                <SelectItem key={month.value} value={month.value}>
                  {month.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Target & Achievement Bar Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Target and Achievement</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{ sales: { label: "Sales", color: "#4f46e5" } }}
              className="w-full h-[250px]"
            >
              <BarChart
                data={barData1}
                width={300}
                height={180}
                margin={{ top: 10, bottom: 10 }}
              >
                <defs>
                  <linearGradient
                    id="barTargetGradient"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0.05} />
                  </linearGradient>
                  <linearGradient
                    id="barAchieveGradient"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.05} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip content={<ChartTooltipContent />} />
                <Bar dataKey="target" fill="url(#barTargetGradient)" />
                <Bar dataKey="achievement" fill="url(#barAchieveGradient)" />
              </BarChart>
              <ChartLegendContent />
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Revenue Area Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Revenue Area Chart</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{ revenue: { label: "Revenue", color: "#4f46e5" } }}
              className="w-full h-[250px]"
            >
              <AreaChart data={areaData}>
                <defs>
                  <linearGradient
                    id="revenueGradient"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0.05} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip content={<ChartTooltipContent />} />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="var(--color-revenue)"
                  fill="url(#revenueGradient)"
                />
              </AreaChart>
              <ChartLegendContent />
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Category Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Category Pie Chart</CardTitle>
          </CardHeader>
          <CardContent className="flex justify-center">
            <ChartContainer
              config={{ categories: { label: "Categories", color: "#4f46e5" } }}
              className="w-full h-[250px] flex justify-center items-center"
            >
              <PieChart width={250} height={200}>
                {["#4f46e5", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"].map(
                  (color, index) => (
                    <defs key={index}>
                      <linearGradient
                        id={`grad${index}`}
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop offset="5%" stopColor={color} stopOpacity={0.4} />
                        <stop
                          offset="95%"
                          stopColor={color}
                          stopOpacity={0.15}
                        />
                      </linearGradient>
                    </defs>
                  )
                )}
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  outerRadius={70}
                  label={({ name, percent }) =>
                    `${name}: ${(percent * 100).toFixed(0)}%`
                  }
                  dataKey="value"
                >
                  {pieData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={`url(#grad${index})`} />
                  ))}
                </Pie>
                <Tooltip content={<ChartTooltipContent />} />
              </PieChart>
              <ChartLegendContent />
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Sales Bar Chart 2 */}
        <Card>
          <CardHeader>
            <CardTitle>Sales Bar Chart 2</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{ sales: { label: "Sales", color: "#f59e0b" } }}
              className="w-full h-[250px]"
            >
              <BarChart
                data={barData2}
                width={300}
                height={180}
                margin={{ top: 10, bottom: 10 }}
              >
                <defs>
                  <linearGradient id="bar2Gradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.05} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip content={<ChartTooltipContent />} />
                <Bar dataKey="sales" fill="url(#bar2Gradient)" />
              </BarChart>
              <ChartLegendContent />
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;

