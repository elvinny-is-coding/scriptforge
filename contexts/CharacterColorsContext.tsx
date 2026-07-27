// contexts/CharacterColorsContext.tsx
"use client";

import { createContext, useContext } from "react";

export type CharacterColorsMap = Record<string, string>;

const CharacterColorsContext = createContext<CharacterColorsMap>({});

export function CharacterColorsProvider({
  children,
  colors,
}: {
  children: React.ReactNode;
  colors: CharacterColorsMap;
}) {
  return (
    <CharacterColorsContext.Provider value={colors}>
      {children}
    </CharacterColorsContext.Provider>
  );
}

export function useCharacterColors() {
  return useContext(CharacterColorsContext);
}
