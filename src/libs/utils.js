import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

// This function merges tailwind classes safely
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}