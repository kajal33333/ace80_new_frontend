import {React, Suspense} from 'react'



import AddRegion from '@/components/admin/master/region/add-region'
const page = () => {
  return (
    <>
      <Suspense fallback={<div className='flex justify-center items-center h-screen'>Loading...</div>}>
        < AddRegion type="Edit" />
      </Suspense>
    </>
  )
}

export default page
