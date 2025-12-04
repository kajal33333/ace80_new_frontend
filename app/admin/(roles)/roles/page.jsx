import RoleList from '@/components/admin/roles/roles-list'

import React from 'react'
import { Suspense } from 'react'
const page = () => {
  return (
    <>
      <Suspense fallback={<div className='flex justify-center items-center h-screen'>Loading...</div>}>
        <RoleList />
      </Suspense>
    </>
  )
}

export default page
