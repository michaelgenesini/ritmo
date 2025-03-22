import { PropsWithChildren } from "react";

type Props = PropsWithChildren<{
  onClick(): void;
}>;

export const Button = ({ children, onClick }: Props) => (
  <button
    className="bg-blue-500 text-white rounded hover:bg-blue-600 transition cursor-pointer"
    onClick={onClick}
  >
    {children}
  </button>
);
