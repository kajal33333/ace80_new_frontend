import CustomerList from '@/components/admin/customers/customer-list'

import React from 'react'
import { Suspense } from 'react'
const page = () => {
  return (
    <>
      <Suspense fallback={<div className='flex justify-center items-center h-screen'>Loading...</div>}>
        <CustomerList />
      </Suspense>
    </>
  )
}

export default page
