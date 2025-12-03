


import {React, Suspense} from 'react'


import AddTodoStatus from '@/components/admin/master/todo-status/add-todo-status'
const page = () => {
  return (
    <>
      <Suspense fallback={<div className='flex justify-center items-center h-screen'>Loading...</div>}>
        < AddTodoStatus type="View" />
      </Suspense>
    </>
  )
}

export default page
