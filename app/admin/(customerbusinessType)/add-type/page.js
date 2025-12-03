import {React, Suspense} from 'react'



import AddCustomerBusinessType from '@/components/admin/master/customer-business-type/add-customer-business-type'
const page = () => {
  return (
    <>
      <Suspense fallback={<div className='flex justify-center items-center h-screen'>Loading...</div>}>
        < AddCustomerBusinessType type="Add" />
      </Suspense>
    </>
  )
}

export default page
