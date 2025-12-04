


import AddDailyReport from '@/components/admin/daily-report/daily-form'


import React, { Suspense } from 'react'


const page = () => {
  return (
    <Suspense>
      <AddDailyReport  type={"Add"} />
    </Suspense>
  )
}

export default page
