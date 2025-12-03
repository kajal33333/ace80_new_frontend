import {React, Suspense} from 'react'


import AddLeaveOdType from '@/components/admin/master/leave-type/add-leaveOd-type'
const page = () => {
  return (
    <>
      <Suspense fallback={<div className='flex justify-center items-center h-screen'>Loading...</div>}>
        < AddLeaveOdType type="Edit" />
      </Suspense>
    </>
  )
}

export default page
