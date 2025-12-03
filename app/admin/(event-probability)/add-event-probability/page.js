import {React, Suspense} from 'react'


import AddEventProbability from '@/components/admin/master/event-probability/add-event-probability'
const page = () => {
  return (
    <>
      <Suspense fallback={<div className='flex justify-center items-center h-screen'>Loading...</div>}>
        < AddEventProbability type="Add" />
      </Suspense>
    </>
  )
}

export default page
