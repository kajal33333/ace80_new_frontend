import React, {Suspense} from "react";
import RolePermissionPage from "@/components/admin/role-permissions/rolepermission";
export default function Page() {
  return (
    <>
      <Suspense>
        <RolePermissionPage />
      </Suspense>
    </>
  );
}
