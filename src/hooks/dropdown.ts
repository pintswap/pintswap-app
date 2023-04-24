import { MouseEvent, useState } from "react"
import { IDropdownMenuItemsProps } from "../components";

export const useDropdown = (items: IDropdownMenuItemsProps[], defaultState?: number) => {
  const [current, setCurrent] = useState(items[defaultState ? defaultState : 0].text);

  const handleCurrentClick = (e: MouseEvent<HTMLButtonElement> | string) => {
    if(typeof e === 'string') {
      setCurrent(e);
    } else {
      const formatted = e.currentTarget.innerText;
      setCurrent(formatted);
    }
  }

  return {
    current,
    handleCurrentClick,
    items
  }
}