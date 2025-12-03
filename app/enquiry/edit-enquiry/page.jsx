


import AddEnquiry from '@/components/admin/enquiry/enquiry-form'

import React, { Suspense } from 'react'


const page = () => {
  return (
    <Suspense>
      <AddEnquiry  type={"Edit"} />
    </Suspense>
  )
}

export default page
