

import CustomerBusinessTypeList from '@/components/admin/master/customer-business-type/customer-business-type-list'

import React from 'react'
import { Suspense } from 'react'
const page = () => {
  return (
    <>
      <Suspense fallback={<div className='flex justify-center items-center h-screen'>Loading...</div>}>
        <CustomerBusinessTypeList />
      </Suspense>
    </>
  )
}

export default page



