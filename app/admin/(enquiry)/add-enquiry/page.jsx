// "use client";

// import AddEnquiry from "@/components/admin/enquiry/enquiry-form";
// import React from "react";


// export default function Page() {
//   return <AddEnquiry  type={"Add"}/>;
// }

// app/add-enquiry/page.tsx

import AddEnquiry from "@/components/admin/enquiry/enquiry-form";


export default function AddEnquiryPage() {
 

  return (
    <AddEnquiry 
      type="Add" 
      
    />
  );
}