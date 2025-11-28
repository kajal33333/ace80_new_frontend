import AddUser from '@/components/admin/users/add-user'
import React from 'react'
import { Suspense } from 'react'
const page = ({ searchParams }) => {
   const id = searchParams?.id; 
  return (
    <>
      <Suspense fallback={<div className='flex justify-center items-center h-screen'>Loading...</div>}>
        <AddUser type="Edit" userId={id} />
      </Suspense>
    </>
  )
}

export default page
