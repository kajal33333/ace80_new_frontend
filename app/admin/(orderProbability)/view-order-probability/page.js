import {React, Suspense} from 'react'



import AddOrderProbability from '@/components/admin/master/order-probability/add-order-probability'
const page = () => {
  return (
    <>
      <Suspense fallback={<div className='flex justify-center items-center h-screen'>Loading...</div>}>
        < AddOrderProbability type="View" />
      </Suspense>
    </>
  )
}

export default page
