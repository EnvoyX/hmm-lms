export default function FormLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <div>{children}</div>;
}

export const metadata = {
  title: "Forms",
}