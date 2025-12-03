import {React, Suspense} from 'react'

import AddDivision from '@/components/admin/master/division/add-division'
const page = () => {
  return (
    <>
      <Suspense fallback={<div className='flex justify-center items-center h-screen'>Loading...</div>}>
        < AddDivision type="Add" />
      </Suspense>
    </>
  )
}

export default page
