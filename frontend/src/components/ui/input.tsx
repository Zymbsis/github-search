import type { ComponentProps } from "react";

const Input = (props: ComponentProps<"input">) => {
  return <input className="search-input" type="text" {...props} />;
};

export default Input;
