

import CompetitorList from '@/components/admin/master/competitor-name/competitor-name-list'


import React from 'react'
import { Suspense } from 'react'
const page = () => {
  return (
    <>
      <Suspense fallback={<div className='flex justify-center items-center h-screen'>Loading...</div>}>
        <CompetitorList />
      </Suspense>
    </>
  )
}

export default page



