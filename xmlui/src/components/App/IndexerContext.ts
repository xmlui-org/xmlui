import React, { useContext } from "react";

export const IndexerContext = React.createContext({
  indexing: false
});

export function useIndexerContext(){
  return useContext(IndexerContext);
}