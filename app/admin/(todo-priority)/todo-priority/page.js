










import TodoPriorityList from '@/components/admin/master/todo-priority/todo-priority-list'
import React from 'react'
import { Suspense } from 'react'
const page = () => {
  return (
    <>
      <Suspense fallback={<div className='flex justify-center items-center h-screen'>Loading...</div>}>
        <TodoPriorityList />
      </Suspense>
    </>
  )
}

export default page
