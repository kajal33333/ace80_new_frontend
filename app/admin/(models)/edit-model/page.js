import {React, Suspense} from 'react'


import AddModel from '@/components/admin/master/models/add-model'
const page = () => {
  return (
    <>
      <Suspense fallback={<div className='flex justify-center items-center h-screen'>Loading...</div>}>
        < AddModel type="Edit" />
      </Suspense>
    </>
  )
}

export default page
