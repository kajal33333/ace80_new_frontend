

import CustomerBusinessList from '@/components/admin/master/customer-business/customer-business-list'

import React from 'react'
import { Suspense } from 'react'
const page = () => {
  return (
    <>
      <Suspense fallback={<div className='flex justify-center items-center h-screen'>Loading...</div>}>
        <CustomerBusinessList />
      </Suspense>
    </>
  )
}

export default page



