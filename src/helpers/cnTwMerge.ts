// eslint-disable-next-line
import cn from "classnames";
// eslint-disable-next-line
import { twMerge } from "tailwind-merge";

export function cnTwMerge(...args: cn.ArgumentArray) {
  return twMerge(cn(args));
}
