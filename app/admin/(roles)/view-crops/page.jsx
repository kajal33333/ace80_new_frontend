import {React, Suspense} from 'react'
import AddCrop from '@/components/admin/roles/add-role'
const page = ({ searchParams }) => {
  const id = searchParams?.id; 
  return (
    <>
      <Suspense fallback={<div className='flex justify-center items-center h-screen'>Loading...</div>}>
        <AddCrop type="View" id={id} />
      </Suspense>
    </>
  )
}

export default page
