


import OrderProbabilityList from '@/components/admin/master/order-probability/order-probability-list'
import React from 'react'
import { Suspense } from 'react'
const page = () => {
  return (
    <>
      <Suspense fallback={<div className='flex justify-center items-center h-screen'>Loading...</div>}>
        <OrderProbabilityList />
      </Suspense>
    </>
  )
}

export default page
