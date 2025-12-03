

import LeaveOdStatusList from '@/components/admin/master/leave-status/leaveOd-status-list'
import React from 'react'
import { Suspense } from 'react'
const page = () => {
  return (
    <>
      <Suspense fallback={<div className='flex justify-center items-center h-screen'>Loading...</div>}>
        <LeaveOdStatusList />
      </Suspense>
    </>
  )
}

export default page
