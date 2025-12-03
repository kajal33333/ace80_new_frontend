import AddTodoPriority from '@/components/admin/master/todo-priority/add-todo-priority'
import {React, Suspense} from 'react'



const page = () => {
  return (
    <>
      <Suspense fallback={<div className='flex justify-center items-center h-screen'>Loading...</div>}>
        < AddTodoPriority type="Add" />
      </Suspense>
    </>
  )
}

export default page