import AddEventProbability from '@/components/admin/master/event-probability/add-event-probability';
import {React, Suspense} from 'react'


const page = ({ searchParams }) => {
    const id = searchParams?.id; 
  return (
    <>
      <Suspense fallback={<div className='flex justify-center items-center h-screen'>Loading...</div>}>
        <AddEventProbability type="Edit" id={id} />
      </Suspense>
    </>
  )
}

export default page
