import TodoStatusList from '@/components/admin/master/todo-status/todo-status-list'
import React from 'react'
import { Suspense } from 'react'
const page = () => {
  return (
    <>
      <Suspense fallback={<div className='flex justify-center items-center h-screen'>Loading...</div>}>
        <TodoStatusList />
      </Suspense>
    </>
  )
}

export default page
