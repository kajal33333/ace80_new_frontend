import {React, Suspense} from 'react'
import AddProduct from '@/components/admin/products-master/add-product'
const page = () => {
  return (
    <>
      <Suspense fallback={<div className='flex justify-center items-center h-screen'>Loading...</div>}>
        <AddProduct type="Edit" />
      </Suspense>
    </> 
  )
}

export default page
