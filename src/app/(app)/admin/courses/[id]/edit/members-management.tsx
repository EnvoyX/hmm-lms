// ~/app/admin/courses/[id]/members-management.tsx
'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import { Badge } from '~/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '~/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '~/components/ui/alert-dialog';
import { Users, Search, UserMinus, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { api } from '~/trpc/react';
import { toast } from 'sonner';
import { type RouterOutputs } from '~/trpc/react';

type Course = RouterOutputs['course']['getCourseForAdmin'];

interface MembersManagementProps {
  course: Course;
}

export default function MembersManagement({ course }: MembersManagementProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const utils = api.useUtils();

  const removeMemberMutation = api.course.removeMember.useMutation({
    onSuccess: async () => {
      toast.success('Member removed successfully');
      await utils.course.getCourseForAdmin.invalidate({ id: course.id });
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const removeAllMembersMutation = api.course.removeCourseMembers.useMutation({
    onSuccess: async () => {
      toast.success('All members removed successfully');
      await utils.course.getCourseForAdmin.invalidate({ id: course.id });
    },
    onError: (error) => {
      toast.error(error.message);
    }
  });

  const filteredMembers = course.members.filter(
    (member) =>
      member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.nim.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const handleRemoveMember = (userId: string) => {
    removeMemberMutation.mutate({
      courseId: course.id,
      userId,
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Members Management
        </CardTitle>
        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search members..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex max-sm:flex-col gap-2">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button className='cursor-pointer' variant='destructive' size='sm'>Remove All</Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Remove Member</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to remove all members from this course?
                    This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => removeAllMembersMutation.mutate({ courseId: course.id })}
                    className="bg-destructive hover:bg-destructive/90 cursor-pointer"
                  >
                    Remove Member
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
            <Badge variant="secondary">
              {filteredMembers.length} of {course.members.length} members
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>NIM</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredMembers.map((member) => (
                <TableRow key={member.id}>
                  <TableCell className="font-medium">{member.name}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{member.nim}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      {format(member.createdAt, 'MMM dd, yyyy')}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-destructive hover:text-destructive"
                        >
                          <UserMinus className="h-4 w-4 mr-2" />
                          Remove
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Remove Member</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to remove {member.name} from this course?
                            This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleRemoveMember(member.id)}
                            className="bg-destructive cursor-pointer hover:bg-destructive/90"
                          >
                            Remove Member
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {filteredMembers.length === 0 && (
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                {searchTerm ? 'No members found matching your search' : 'No members enrolled yet'}
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}