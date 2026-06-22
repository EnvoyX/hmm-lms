import { FormsBuilder } from "~/app/admin/forms/forms-builder";

export const metadata = {
  title: "Create Form",
  description: "Create a new form",
};

export default function CreateFormPage() {
  return (
    <div className="container mx-auto max-w-5xl">
      <FormsBuilder mode="create" />
    </div>
  );
}