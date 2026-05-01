import type { ReactNode } from "react";

const Title = ({ children }: { children: ReactNode }) => {
  return <p className="title">{children}</p>;
};

export default Title;
