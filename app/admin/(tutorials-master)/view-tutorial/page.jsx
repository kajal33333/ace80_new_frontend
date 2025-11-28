import AddTutorial from '@/components/admin/tutorials-master/add-tutorial'
import React from 'react'
import { Suspense } from 'react'

const page = () => {
  return (
    <>
      <Suspense fallback={<div className='flex justify-center items-center h-screen'>Loading...</div>}>
        <AddTutorial type="View" />
      </Suspense>
    </>
  )
}

export default page
