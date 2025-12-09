/* eslint-disable react-refresh/only-export-components */
// StateManger.jsx
import React, { createContext, useContext, useMemo, useState } from "react";

const StateMangerContext = createContext(undefined);

export function StateMangerProvider({ children }) {
  // ✅ two exposed states
  const [state1, setState1] = useState("");
  const [state2, setState2] = useState(0);

  const value = useMemo(
    () => ({ state1, setState1, state2, setState2 }),
    [state1, state2]
  );

  return (
    <StateMangerContext.Provider value={value}>
      {children}
    </StateMangerContext.Provider>
  );
}

export function useStateManger() {
  const ctx = useContext(StateMangerContext);
  if (!ctx) {
    throw new Error("useStateManger must be used within a StateMangerProvider");
  }
  return ctx;
}
