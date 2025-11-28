import UsersList from '@/components/admin/users/users-list'
import React from 'react'
import { Suspense } from 'react'
const page = () => {
  return (
    <>
      <Suspense fallback={<div className='flex justify-center items-center h-screen'>Loading...</div>}>
        <UsersList />
      </Suspense>
    </>
  )
}

export default page
