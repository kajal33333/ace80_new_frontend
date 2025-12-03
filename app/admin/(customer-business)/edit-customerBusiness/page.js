import {React, Suspense} from 'react'


import AddCustomerBusiness from '@/components/admin/master/customer-business/add-customer-business'
const page = () => {
  return (
    <>
      <Suspense fallback={<div className='flex justify-center items-center h-screen'>Loading...</div>}>
        < AddCustomerBusiness type="Edit" />
      </Suspense>
    </>
  )
}

export default page
