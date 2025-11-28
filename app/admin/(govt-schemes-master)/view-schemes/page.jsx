import {React, Suspense} from 'react'
import AddScheme from '@/components/admin/govt-schemes-master/add-scheme'
const page = () => {
  return (
    <>
      <Suspense fallback={<div className='flex justify-center items-center h-screen'>Loading...</div>}>
        <AddScheme type="View" />
      </Suspense>
    </>
  )
}

export default page
