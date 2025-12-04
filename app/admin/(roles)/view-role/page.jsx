// import {React, Suspense} from 'react'

// import AddRole from '@/components/admin/roles/add-role';
// const page = ({ searchParams }) => {
//   const id = searchParams?.id; 
//   return (
//     <>
//       <Suspense fallback={<div className='flex justify-center items-center h-screen'>Loading...</div>}>
//         <AddRole type="View" id={id} />
//       </Suspense>
//     </>
//   )
// }

// export default page

'use client';
import AddRole from '@/components/admin/roles/add-role';
import { useSearchParams } from 'next/navigation';

export default function ViewRolePage() {
  const searchParams = useSearchParams();
  const id = searchParams.get('id');

  return <AddRole type="View" id={id} />;
}
