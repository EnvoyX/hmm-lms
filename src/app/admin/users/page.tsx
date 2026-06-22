import UserManagement from "./user-management";

export default async function AdminUsersPage() {
  return (
    <div className="max-w-5xl mx-auto">
      <UserManagement />
    </div>
  );
}

export const metadata = {
  title: "Manage Users",
  description: "Manage users in the platform system",
};