

import StateList from '@/components/admin/master/state/state-list'
import React from 'react'
import { Suspense } from 'react'
const page = () => {
  return (
    <>
      <Suspense fallback={<div className='flex justify-center items-center h-screen'>Loading...</div>}>
        <StateList />
      </Suspense>
    </>
  )
}

export default page
