'use strict';

export const shorten = (s) => {
  if (s.length <= 8) return s;
  return `${s.substr(0, 4)}...${s.substr(s.length - 4, 4)}`;
};
