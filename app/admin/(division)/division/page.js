
import DivisionList from '@/components/admin/master/division/divison-list'
import React from 'react'
import { Suspense } from 'react'
const page = () => {
  return (
    <>
      <Suspense fallback={<div className='flex justify-center items-center h-screen'>Loading...</div>}>
        <DivisionList />
      </Suspense>
    </>
  )
}

export default page
