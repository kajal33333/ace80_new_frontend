// "use client";
// import AddUser from '@/components/admin/users/add-user'
// import React from 'react'
// import { Suspense } from 'react'
// const page = ({ searchParams }) => {
//    const id = searchParams?.id; 

   
//   return (
//     <>
//       <Suspense fallback={<div className='flex justify-center items-center h-screen'>Loading...</div>}>
//         <AddUser type="View" userId={id} />
//       </Suspense>
//     </>
//   )
// }

// export default page


"use client";
import AddUser from "@/components/admin/users/add-user";
import { useSearchParams } from "next/navigation";
import { Suspense } from 'react'
const Page = () => {
  const params = useSearchParams();
  const id = params.get("id");

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AddUser type="View" userId={id} />
    </Suspense>
  );
};

export default Page;
