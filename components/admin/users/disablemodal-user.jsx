"use client";
import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription
} from "@/components/ui/dialog"; 
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const DisableUserModal = ({ isOpen, onClose, onConfirm, activeUsers, user, setChangeUserId }) => {
  const needsTransfer = user?.dailyReportsCount > 0 || user?.enquiriesCount > 0;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Confirm Disable</DialogTitle>
        </DialogHeader>
        <div className="mt-2">
          {needsTransfer ? (
            <>
              <p>
                This user has {user?.dailyReportsCount || 0} daily report(s) and{" "}
                {user?.enquiriesCount || 0} enquiry(ies) assigned.
              </p>
              <p className="mt-2">Please select a user to transfer these items to:</p>
              <Select
                onValueChange={setChangeUserId}
                defaultValue=""
              >
                <SelectTrigger className="w-full mt-2">
                  <SelectValue placeholder="Select a user" />
                </SelectTrigger>
                <SelectContent>
                  {activeUsers
                    .filter(u => u.id !== user.id)
                    .map(u => (
                      <SelectItem key={u.id} value={u.id}>
                        {u.first_name} {u.last_name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </>
          ) : (
            <p>Are you sure you want to disable this user?</p>
          )}
        </div>
        <DialogFooter className="flex gap-2 mt-4">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button variant="destructive" onClick={onConfirm}>Disable</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DisableUserModal;
