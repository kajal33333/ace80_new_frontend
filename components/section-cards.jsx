"use client";

import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Leaf, Package, Landmark, PlayCircle, ShoppingCart, ShoppingBasket } from "lucide-react";

export function SectionCards({ stats, loading }) {
  const metrics = {
    crops: stats?.crops ?? 0,
    products: stats?.products ?? 0,
    governmentSchemes: stats?.governmentSchemes ?? 0,
    tutorials: stats?.tutorials ?? 0,
    cropSaleRequests: stats?.cropSaleRequests ?? 0,
    productOrderRequests: stats?.productOrderRequests ?? 0,
  };

  const items = [
    { label: "Total Crops", value: metrics.crops, icon: Leaf },
    { label: "Total Products", value: metrics.products, icon: Package },
    { label: "Govt. Schemes", value: metrics.governmentSchemes, icon: Landmark },
    { label: "Tutorials", value: metrics.tutorials, icon: PlayCircle },
    { label: "Crop Sale Requests", value: metrics.cropSaleRequests, icon: ShoppingBasket },
    { label: "Product Order Requests", value: metrics.productOrderRequests, icon: ShoppingCart },
  ];

  return (
    <div className="grid gap-4 px-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <Card
            key={item.label}
            className="p-5 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm hover:shadow-md transition-shadow"
          >
            <CardHeader className="p-0 space-y-4">
              {/* Label row */}
              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                <Icon className="w-5 h-5" />
                <CardTitle className="text-sm font-medium">{item.label}</CardTitle>
              </div>
              {/* Value */}
              <div className="text-3xl font-bold text-gray-900 dark:text-white">
                {loading ? (
                  <Skeleton className="h-8 w-20 rounded-md" />
                ) : (
                  item.value.toLocaleString()
                )}
              </div>
            </CardHeader>
          </Card>
        );
      })}
    </div>
  );
}
