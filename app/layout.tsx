import { ReactNode } from 'react';

type Props = {
  children: ReactNode;
};

// This is the root layout - it just wraps locale-specific layouts
export default function RootLayout({ children }: Props) {
  return children;
}
