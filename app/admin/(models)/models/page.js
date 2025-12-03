

import ModelList from '@/components/admin/master/models/model-list'
import React from 'react'
import { Suspense } from 'react'
const page = () => {
  return (
    <>
      <Suspense fallback={<div className='flex justify-center items-center h-screen'>Loading...</div>}>
        <ModelList />
      </Suspense>
    </>
  )
}

export default page
