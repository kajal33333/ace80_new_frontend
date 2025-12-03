

import EventEnquiryList from '@/components/admin/master/events-enquiry-status/event-enquiry-list'
import React from 'react'
import { Suspense } from 'react'
const page = () => {
  return (
    <>
      <Suspense fallback={<div className='flex justify-center items-center h-screen'>Loading...</div>}>
        <EventEnquiryList />
      </Suspense>
    </>
  )
}

export default page
