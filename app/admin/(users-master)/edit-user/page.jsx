"use client";
import AddUser from "@/components/admin/users/add-user";
import { useSearchParams } from "next/navigation";
import { Suspense } from 'react'
const Page = () => {
  const params = useSearchParams();
  const id = params.get("id");

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AddUser type="Edit" userId={id} />
    </Suspense>
  );
};

export default Page;