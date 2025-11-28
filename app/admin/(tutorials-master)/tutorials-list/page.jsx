import TutorialsList from '@/components/admin/tutorials-master/tutorials-list'
import React from 'react'
import { Suspense } from 'react'
const page = () => {
  return (
    <>
      <Suspense fallback={<div className='flex justify-center items-center h-screen'>Loading...</div>}>
        <TutorialsList />
      </Suspense>
    </>
  )
}

export default page
