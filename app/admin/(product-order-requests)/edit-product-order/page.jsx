import React, { Suspense } from 'react'
import EditOrderRequest from '@/components/admin/product-order-requests/edit-order-request'

const Page = () => {
  return (
    <Suspense fallback={<div className='flex justify-center items-center h-screen'>Loading...</div>}>
      <EditOrderRequest />
    </Suspense>
  )
}

export default Page


