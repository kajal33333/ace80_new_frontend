import SchemesList from '@/components/admin/govt-schemes-master/scheme-list'
import React from 'react'
import { Suspense } from 'react'
const page = () => {
  return (
    <>
      <Suspense fallback={<div className='flex justify-center items-center h-screen'>Loading...</div>}>
        <SchemesList /> 
      </Suspense>
    </>
  )
}

export default page
