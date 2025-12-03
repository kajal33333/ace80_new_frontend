import {React, Suspense} from 'react'
import AddCrop from '@/components/admin/roles/add-role'
const page = () => {
  return (
    <>
      <Suspense fallback={<div className='flex justify-center items-center h-screen'>Loading...</div>}>
        <AddCrop type="Add" />
      </Suspense>
    </>
  )
}

export default page
