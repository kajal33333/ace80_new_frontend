import React, { Suspense } from 'react'
import EditSaleRequest from '@/components/admin/crop-sale-requests/edit-sale-request'

const Page = () => {
  return (
    <Suspense fallback={<div className='flex justify-center items-center h-screen'>Loading...</div>}>
      <EditSaleRequest />
    </Suspense>
  )
}

export default Page


