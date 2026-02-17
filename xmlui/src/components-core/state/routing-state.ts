/**
 * Routing State Module
 * 
 * Handles routing parameter integration for XMLUI containers.
 * 
 * OVERVIEW:
 * This module provides routing-related variables that components can access:
 * - $pathname: Current URL pathname
 * - $routeParams: Dynamic route parameters (e.g., /user/:id)
 * - $queryParams: Query string parameters (e.g., ?page=1&sort=name)
 * - $linkInfo: Link metadata from the routing context
 * 
 * INTEGRATION:
 * These routing variables are added as Layer 6 in the state composition pipeline.
 * They're additive - they don't override other state layers, just add routing info.
 * 
 * USAGE:
 * Components can bind to routing parameters:
 * - text="$pathname" - Display current path
 * - text="$routeParams.id" - Access dynamic route segment
 * - text="$queryParams.page" - Access query parameter
 * 
 * REACTIVITY:
 * The hook automatically re-evaluates when:
 * - URL pathname changes (navigation)
 * - Route parameters change (different route segment values)
 * - Query parameters change (URL search string updates)
 * - Link info changes (routing context updates)
 * 
 * Part of StateContainer.tsx refactoring - Step 9
 */

import { useMemo } from "react";
import { useLocation, useParams, useSearchParams } from "react-router-dom";
import type { ContainerState } from "../../abstractions/ContainerDefs";
import { useLinkInfoContext } from "../../components/App/LinkInfoContext";
import { EMPTY_OBJECT } from "../constants";

/**
 * Hook to get routing-related parameters from React Router.
 * 
 * This hook integrates with React Router to provide routing state variables
 * that components can access in their bindings and expressions.
 * 
 * Returns an object with routing variables:
 * - $pathname: The current URL pathname (e.g., "/users/123")
 * - $routeParams: Dynamic route parameters as an object (e.g., { id: "123" })
 * - $queryParams: Query string parameters as an object (e.g., { page: "1" })
 * - $linkInfo: Link metadata from the routing context (if available)
 * 
 * These variables are memoized and only update when the underlying routing
 * state changes, preventing unnecessary re-renders.
 * 
 * @returns Container state object with routing variables
 */
export function useRoutingParams(): ContainerState {
  const [queryParams] = useSearchParams();
  const routeParams = useParams();
  const location = useLocation();
  const linkInfoContext = useLinkInfoContext();
  
  // Extract link metadata for the current pathname
  const linkInfo = useMemo(() => {
    return linkInfoContext?.linkMap?.get(location.pathname) || EMPTY_OBJECT;
  }, [linkInfoContext?.linkMap, location.pathname]);

  // Convert query params from URLSearchParams to plain object
  const queryParamsMap = useMemo(() => {
    const result: Record<string, any> = {};
    for (const [key, value] of Array.from(queryParams.entries())) {
      result[key] = value;
    }
    return result;
  }, [queryParams]);

  // Combine all routing parameters into state object
  return useMemo(() => {
    return {
      $pathname: location.pathname,
      $routeParams: routeParams,
      $queryParams: queryParamsMap,
      $linkInfo: linkInfo,
    };
  }, [linkInfo, location.pathname, queryParamsMap, routeParams]);
}
