import {React, Suspense} from 'react'

import AddDivision from '@/components/admin/master/division/add-division';
const page = ({ searchParams }) => {
    const id = searchParams?.id; 
  return (
    <>
      <Suspense fallback={<div className='flex justify-center items-center h-screen'>Loading...</div>}>
        <AddDivision type="Edit" id={id} />
      </Suspense>
    </>
  )
}

export default page
