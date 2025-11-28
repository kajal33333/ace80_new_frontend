import AddUser from '@/components/admin/users/add-user'
import React from 'react'
import { Suspense } from 'react'

const page = () => {
  return (
    <>
      <Suspense fallback={<div className='flex justify-center items-center h-screen'>Loading...</div>}>
        <AddUser type="Add" />
      </Suspense>
    </>
  )
}

export default page
