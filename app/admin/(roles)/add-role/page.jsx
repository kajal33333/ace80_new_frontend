// import {React, Suspense} from 'react'
// import AddCrop from '@/components/admin/roles/add-role'
// const page = () => {
//   return (
//     <>
//       <Suspense fallback={<div className='flex justify-center items-center h-screen'>Loading...</div>}>
//         <AddCrop type="Add" />
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

  return <AddRole type="Add" id={id} />;
}
