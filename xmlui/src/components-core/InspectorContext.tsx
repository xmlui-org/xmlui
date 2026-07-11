import { useInspectMode as useInspectModeStore } from "../components/Inspector/inspectModeStore";

export function useInspectMode() {
  const [inspectMode, setInspectMode] = useInspectModeStore();
  return { inspectMode, setInspectMode };
}
