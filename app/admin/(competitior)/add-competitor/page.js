import {React, Suspense} from 'react'



import AddCompetitor from '@/components/admin/master/competitor-name/add-competitor-name'
const page = () => {
  return (
    <>
      <Suspense fallback={<div className='flex justify-center items-center h-screen'>Loading...</div>}>
        < AddCompetitor type="Add" />
      </Suspense>
    </>
  )
}

export default page
