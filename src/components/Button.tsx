import { PropsWithChildren } from "react";

type Props = PropsWithChildren<{
  onClick(): void;
}>;

export const Button = ({ children, onClick }: Props) => (
  <button
    className="mt-4 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition cursor-pointer"
    onClick={onClick}
  >
    {children}
  </button>
);
