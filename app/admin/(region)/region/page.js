


import RegionList from '@/components/admin/master/region/region-list'
import React from 'react'
import { Suspense } from 'react'
const page = () => {
  return (
    <>
      <Suspense fallback={<div className='flex justify-center items-center h-screen'>Loading...</div>}>
        <RegionList />
      </Suspense>
    </>
  )
}

export default page
