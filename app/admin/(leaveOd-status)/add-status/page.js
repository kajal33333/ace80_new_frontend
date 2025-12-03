import {React, Suspense} from 'react'


import AddLeaveOdStatus from '@/components/admin/master/leave-status/add-leaveOd-status'
const page = () => {
  return (
    <>
      <Suspense fallback={<div className='flex justify-center items-center h-screen'>Loading...</div>}>
        < AddLeaveOdStatus type="Add" />
      </Suspense>
    </>
  )
}

export default page
