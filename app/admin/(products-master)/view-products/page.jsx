import {React, Suspense} from 'react'
import AddProduct from '@/components/admin/products-master/add-product'
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
