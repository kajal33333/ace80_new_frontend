import React, { Suspense } from 'react'
import SaleRequestsList from '@/components/admin/crop-sale-requests/sale-requests-list'
import OrderRequestsList from '@/components/admin/product-order-requests/order-requests-list'

const Page = () => {
  return (
    <Suspense fallback={<div className='flex justify-center items-center h-screen'>Loading...</div>}>
      <OrderRequestsList />
    </Suspense>
  )
}

export default Page


