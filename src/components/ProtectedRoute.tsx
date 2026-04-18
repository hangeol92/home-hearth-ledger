interface Props {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: Props) {
  return <>{children}</>;
}
