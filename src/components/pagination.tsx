import { BiChevronsRight, BiChevronRight, BiChevronLeft, BiChevronsLeft, BiDotsHorizontal } from 'react-icons/bi';

type IPaginationProps = {
  max: number;
  show?: number;
  next: () => void;
  prev: () => void;
  jump?: (page: number) => void;
  perPage: number;
  currentPage: number;
}

export const Pagination = ({ max, show = 4, next, prev, jump, perPage, currentPage }: IPaginationProps) => {
  const renderInBetween = () => {
    if(!max || !perPage) return;
    const pages = Array.from(Array(max / perPage).keys());
    console.log(pages);
  }

  const btnBaseClass = `w-full transition duration-200 hover:text-neutral-300`
  return (
    <div className="flex justify-center w-full">
        <div className="grid grid-cols-3 gap-1">
            <button onClick={prev} className={btnBaseClass}>
              <BiChevronLeft size={24} />
            </button>
            <span className="text-center">{currentPage}</span>
            <button onClick={next} className={btnBaseClass}>
              <BiChevronRight size={24} />
            </button>
        </div>
    </div>
  )
}