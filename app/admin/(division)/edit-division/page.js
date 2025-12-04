

import { Suspense } from 'react';
import AddDivision from '@/components/admin/master/division/add-division';

const Page = async ({ searchParams }) => {
  const { id } = await searchParams; 

  return (
    <Suspense fallback={<div className='flex justify-center items-center h-screen'>Loading...</div>}>
      <AddDivision type="Edit" id={id} />
    </Suspense>
  );
};

export default Page;
