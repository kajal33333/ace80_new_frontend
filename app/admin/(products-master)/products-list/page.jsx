import ProductsList from '@/components/admin/products-master/products-list'
import React from 'react'
import { Suspense } from 'react'
const page = () => {
  return (
    <>
      <Suspense fallback={<div className='flex justify-center items-center h-screen'>Loading...</div>}>
        <ProductsList />
      </Suspense>
    </>
  )
}

export default page
