"use client";

import { createContext, useContext } from "react";

export const HeaderHiddenContext = createContext(false);
export function useHeaderHidden() { return useContext(HeaderHiddenContext); }
