import {React, Suspense} from 'react'


import AddLeaveOdStatus from '@/components/admin/master/leave-status/add-leaveOd-status';
const page = ({ searchParams }) => {
    const id = searchParams?.id; 
  return (
    <>
      <Suspense fallback={<div className='flex justify-center items-center h-screen'>Loading...</div>}>
        <AddLeaveOdStatus type="Edit" id={id} />
      </Suspense>
    </>
  )
}

export default page
