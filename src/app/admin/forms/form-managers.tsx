'use client';

import { UserPlus, X, Loader2, Shield, AlertCircle } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useState } from 'react';
import { toast } from 'sonner';

import { Badge } from '~/components/ui/badge';
import { Button } from '~/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/components/ui/select';
import { api } from '~/trpc/react';

interface FormManagersProps {
  formId: string;
  isOwner: boolean;
  mode: 'create' | 'edit';
  selectedUserIds: Set<string>;
  onUserSelection: (userId: string) => void;
}

export function FormManagers({
  formId,
  isOwner,
  mode,
  selectedUserIds,
  onUserSelection,
}: FormManagersProps) {
  const {data} = useSession()

  const [selectedUserId, setSelectedUserId] = useState<string>('');

  function queryCondition(): boolean {
    if (mode === 'create') {
      return true;
    }
    return isOwner;
  }

  const { data: managers, refetch: refetchManagers } = api.form.getManagers.useQuery(
    { formId },
    { enabled: isOwner },
  );

  const { data: availableAdmins } = api.form.getAvailableAdmins.useQuery(undefined, {
    enabled: queryCondition(),
  });

  const addManager = api.form.addManager.useMutation({
    onSuccess: () => {
      toast.success('Manager added successfully');
      setSelectedUserId('');
      void refetchManagers();
    },
    onError: (error) => {
      toast.error(`Failed to add manager: ${error.message}`);
    },
  });

  const removeManager = api.form.removeManager.useMutation({
    onSuccess: () => {
      toast.success('Manager removed successfully');
      void refetchManagers();
    },
    onError: (error) => {
      toast.error(`Failed to remove manager: ${error.message}`);
    },
  });

  const handleAddManager = () => {
    if (!selectedUserId) {
      toast.error('Please select a user to add');
      return;
    }

    if (managers?.managers?.some((m) => m.id === selectedUserId)) {
      toast.error('This user is already a manager');
      return;
    }

    addManager.mutate({ formId, managerId: selectedUserId });
  };

  const handleRemoveManager = (managerId: string) => {
    removeManager.mutate({ formId, managerId });
  };

  const availableAdminsToAdd = availableAdmins?.filter(
    (admin) => !managers?.managers?.some((m) => m.id === admin.id),
  );

  const availableAdminsToManage = availableAdmins?.filter(
    (admin) => !selectedUserIds.has(admin.id),
  );

  const selectedManagers = availableAdmins?.filter((admin) => selectedUserIds.has(admin.id));

  if (!isOwner && mode === 'edit' && data?.user.role !== "SUPERADMIN") {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Form Managers
          </CardTitle>
          <CardDescription>Only the form owner can manage form access</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <AlertCircle className="h-4 w-4" />
            You don't have permission to manage form managers
          </div>
        </CardContent>
      </Card>
    );
  } else if (mode === 'edit') {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Form Managers
          </CardTitle>
          <CardDescription>Add admin users to help manage and edit this form</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Select
              value={selectedUserId}
              onValueChange={setSelectedUserId}
              disabled={addManager.isPending}
            >
              <SelectTrigger className="flex-1 truncate line-clamp-1 ">
                <SelectValue placeholder="Select an admin to add" />
              </SelectTrigger>
              <SelectContent>
                {availableAdminsToAdd?.map((admin) => (
                  <SelectItem key={admin.id} value={admin.id}>
                    {admin.name} ({admin.email}) - {admin.role}
                  </SelectItem>
                ))}
                {availableAdminsToAdd?.length === 0 && (
                  <div className="px-2 py-1 text-sm text-muted-foreground">
                    No available admins to add
                  </div>
                )}
              </SelectContent>
            </Select>
            <Button
              onClick={(e) => {
                e.preventDefault();
                handleAddManager();
              }}
              disabled={!selectedUserId || addManager.isPending}
              size="icon"
            >
              {addManager.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <UserPlus className="h-4 w-4" />
              )}
            </Button>
          </div>

          <div className="space-y-2">
            <h4 className="text-sm font-medium">Current Managers</h4>
            {managers?.managers && managers.managers.length > 0 ? (
              <div className="space-y-2">
                {managers.managers.map((manager) => (
                  <div
                    key={manager.id}
                    className="flex items-center justify-between rounded-lg border p-3"
                  >
                    <div className="flex flex-col gap-1">
                      <span className="font-medium">{manager.name}</span>
                      <span className="text-sm text-muted-foreground">{manager.email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">{manager.role}</Badge>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.preventDefault();
                          handleRemoveManager(manager.id);
                        }}
                        disabled={removeManager.isPending}
                      >
                        {removeManager.isPending ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <X className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-sm text-muted-foreground">
                No managers added yet. Add admins above to grant them access.
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  } else {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Form Managers
          </CardTitle>
          <CardDescription>Select admins to grant them access to this form</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Select value={selectedUserId} onValueChange={setSelectedUserId}>
              <SelectTrigger className="flex-1 truncate line-clamp-1 ">
                <SelectValue placeholder="Select an admin to add" />
              </SelectTrigger>
              <SelectContent>
                {availableAdminsToManage?.map((admin) => (
                  <SelectItem key={admin.id} value={admin.id}>
                    {admin.name} ({admin.email}) - {admin.role}
                  </SelectItem>
                ))}
                {availableAdminsToManage?.length === 0 && (
                  <div className="px-2 py-1 text-sm text-muted-foreground">
                    No available admins to add
                  </div>
                )}
              </SelectContent>
            </Select>
            <Button
              onClick={(e) => {
                e.preventDefault();
                onUserSelection(selectedUserId);
              }}
              disabled={!selectedUserId}
              size="icon"
            >
              <UserPlus className="h-4 w-4" />
            </Button>
          </div>

          <div className="space-y-2">
            <h4 className="text-sm font-medium">Added Managers</h4>
            {selectedManagers && selectedManagers.length > 0 ? (
              <div className="space-y-2">
                {selectedManagers.map((manager) => (
                  <div
                    key={manager.id}
                    className="flex items-center justify-between rounded-lg border p-3"
                  >
                    <div className="flex flex-col gap-1">
                      <span className="font-medium">{manager.name}</span>
                      <span className="text-sm text-muted-foreground">{manager.email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">{manager.role}</Badge>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.preventDefault();
                          onUserSelection(manager.id);
                        }}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-sm text-muted-foreground">
                No managers added yet. Add admins above to grant them access.
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }
}
