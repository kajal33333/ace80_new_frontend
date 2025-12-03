import {React, Suspense} from 'react'


import AddCategory from '@/components/admin/master/category/add-category'
const page = () => {
  return (
    <>
      <Suspense fallback={<div className='flex justify-center items-center h-screen'>Loading...</div>}>
        < AddCategory type="Add" />
      </Suspense>
    </>
  )
}

export default page
