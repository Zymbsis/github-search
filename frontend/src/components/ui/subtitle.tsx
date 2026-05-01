import type { ReactNode } from "react";

const Subtitle = ({ children }: { children: ReactNode }) => {
  return <p className="subtitle">{children}</p>;
};

export default Subtitle;
