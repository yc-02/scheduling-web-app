import { createGlobalState } from "@vueuse/core";
import { useCollection } from "vuefire";
import { listsRef } from "@/firebase";

export const useProjects = createGlobalState(()=>useCollection(listsRef))