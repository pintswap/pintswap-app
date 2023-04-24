import { MouseEvent, useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom";
import { IDropdownMenuItemsProps } from "../components";

export const useDropdown = (items: IDropdownMenuItemsProps[], defaultState?: number, changeUrl?: boolean) => {
  const navigate = useNavigate();
  const { multiaddr, view } = useParams();
  const [current, setCurrent] = useState(items[defaultState ? defaultState : 0].text.toLowerCase());

  const handleCurrentClick = (e: MouseEvent<HTMLButtonElement> | string) => {
    if(typeof e === 'string') {
      setCurrent(e);
    } else {
      const formatted = e.currentTarget.innerText.toLowerCase();
      setCurrent(formatted);
      if(changeUrl && multiaddr) navigate(`/${multiaddr}/${formatted.toLowerCase()}`)
    }
  }

  useEffect(() => {
    if(changeUrl && view) setCurrent(view);
    else if(changeUrl && !view) setCurrent(items[defaultState ? defaultState : 0].text.toLowerCase())
  }, [view])

  return {
    current,
    handleCurrentClick,
    items
  }
}