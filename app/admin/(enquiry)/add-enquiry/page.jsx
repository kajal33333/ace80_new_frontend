


import AddEnquiry from '@/components/admin/enquiry/enquiry-form';
import { Suspense } from 'react';


export default function AddEnquiryPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AddEnquiry type="Add" />
    </Suspense>
  );
}
