import {React, Suspense} from 'react'


import AddEventEnquiryStatus from '@/components/admin/master/events-enquiry-status/add-event-enquiry-status'
const page = () => {
  return (
    <>
      <Suspense fallback={<div className='flex justify-center items-center h-screen'>Loading...</div>}>
        < AddEventEnquiryStatus type="Edit" />
      </Suspense>
    </>
  )
}

export default page
