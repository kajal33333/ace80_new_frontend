import {React, Suspense} from 'react'
import AddProduct from '@/components/admin/customers/add-customer'
const page = () => {
  return (
    <>
      <Suspense fallback={<div className='flex justify-center items-center h-screen'>Loading...</div>}>
        <AddProduct type="Add" />
      </Suspense>
    </>
  )
}

export default page
