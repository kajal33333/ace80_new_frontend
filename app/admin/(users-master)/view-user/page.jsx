// import AddUser from '@/components/admin/users/add-user'
// import React from 'react'
// import { Suspense } from 'react'
// const page = ({ searchParams }) => {
//   const id = searchParams.id;
//   return (
//     <>
//       <Suspense fallback={<div className='flex justify-center items-center h-screen'>Loading...</div>}>
//         <AddUser type="View" userId={id} />
//       </Suspense>
//     </>
//   )
// }

// export default page


// app/admin/view-user/page.jsx   (ya jahan bhi hai)

import AddUser from '@/components/admin/users/add-user';
import { Suspense } from 'react';

const ViewUserPage = ({ searchParams }) => {
  const id = searchParams?.id;   // ← yeh line bilkul sahi hai

  if (!id || id === 'undefined') {
    return <div className="p-12 text-center text-red-600 text-xl">Invalid User ID</div>;
  }

  return (
    <Suspense fallback={<div className="flex justify-center items-center h-screen">Loading...</div>}>
      <AddUser type="View" userId={id} />   {/* ← userId prop pass karo */}
    </Suspense>
  );
};

export default ViewUserPage;