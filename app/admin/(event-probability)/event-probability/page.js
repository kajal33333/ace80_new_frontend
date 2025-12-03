

import EventProbabilityList from '@/components/admin/master/event-probability/event-probability'
import React from 'react'
import { Suspense } from 'react'
const page = () => {
  return (
    <>
      <Suspense fallback={<div className='flex justify-center items-center h-screen'>Loading...</div>}>
        <EventProbabilityList />
      </Suspense>
    </>
  )
}

export default page
