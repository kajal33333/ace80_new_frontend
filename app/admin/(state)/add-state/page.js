import {React, Suspense} from 'react'


import AddState from '@/components/admin/master/state/add-state'
const page = () => {
  return (
    <>
      <Suspense fallback={<div className='flex justify-center items-center h-screen'>Loading...</div>}>
        < AddState type="Add" />
      </Suspense>
    </>
  )
}

export default page
