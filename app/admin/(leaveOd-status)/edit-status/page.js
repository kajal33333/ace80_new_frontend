"use client";
import AddLeaveOdStatus from "@/components/admin/master/leave-status/add-leaveOd-status";

import { useSearchParams } from "next/navigation";
import { Suspense } from 'react'
const Page = () => {
  const params = useSearchParams();
  const id = params.get("id");

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AddLeaveOdStatus type="Edit" userId={id} />
    </Suspense>
  );
};

export default Page;