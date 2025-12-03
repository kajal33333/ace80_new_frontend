


import LeaveOdTypeList from '@/components/admin/master/leave-type/leaveOd-type-list'
import React from 'react'
import { Suspense } from 'react'
const page = () => {
  return (
    <>
      <Suspense fallback={<div className='flex justify-center items-center h-screen'>Loading...</div>}>
        <LeaveOdTypeList />
      </Suspense>
    </>
  )
}

export default page
