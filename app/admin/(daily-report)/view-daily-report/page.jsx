


import AddDailyReport from '@/components/admin/daily-report/daily-form'


import React, { Suspense } from 'react'


const page = () => {
  return (
    <Suspense>
      <AddDailyReport  type={"View"} />
    </Suspense>
  )
}

export default page
