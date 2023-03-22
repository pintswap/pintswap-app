import React, { createContext, ReactNode, useContext } from 'react';

// Types
export type IGlobalStoreProps = {};

// Context
const GlobalContext = createContext<IGlobalStoreProps>({});

// Wrapper
export function GlobalStore(props: { children: ReactNode }) {
    return <GlobalContext.Provider value={{}}>{props.children}</GlobalContext.Provider>;
}

// Independent
export function useGlobalContext() {
    return useContext(GlobalContext);
}
