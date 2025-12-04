import {React, Suspense} from 'react'
import AddProduct from '@/components/admin/customers/add-customer'
const page = ({ searchParams }) => {
  const id = searchParams?.id; 
  return (
    <>
      <Suspense fallback={<div className='flex justify-center items-center h-screen'>Loading...</div>}>
        <AddProduct type="View" id={id} />
      </Suspense>
    </>
  )
}

export default page
