import CropsList from '@/components/admin/crops-master/crops-list'
import React from 'react'
import { Suspense } from 'react'
const page = () => {
  return (
    <>
      <Suspense fallback={<div className='flex justify-center items-center h-screen'>Loading...</div>}>
        <CropsList />
      </Suspense>
    </>
  )
}

export default page
