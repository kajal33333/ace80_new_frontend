"use client";

import AddCustomer from "@/components/admin/customers/add-customer";
import { useSearchParams } from "next/navigation";
import { Suspense } from 'react'
const Page = () => {
  const params = useSearchParams();
  const id = params.get("id");

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AddCustomer type="Edit" userId={id} />
    </Suspense>
  );
};

export default Page;