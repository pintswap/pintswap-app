import { BiChevronsRight, BiChevronRight, BiChevronLeft, BiChevronsLeft, BiDotsHorizontal } from 'react-icons/bi';

type IPaginationProps = {
  max: number;
  next: () => void;
  prev: () => void;
  jump: (page: number) => void;
  perPage: number;
  currentPage: number;
}

export const Pagination = ({ max, next, prev, jump, perPage, currentPage }: IPaginationProps) => {
  const renderInBetween = () => {
    if(!max || !perPage) return [];
    if(max > 5) {
      if(currentPage < 3 && max > 5) {
        return [1, 2, 3, 0, max];
      } else if(currentPage > max - 2 && max > 5) {
        return [1, 0, max-2, max-1, max]
      } else {
        if(currentPage > max / 2) {
          return [1, 0, currentPage, currentPage + 1, max]
        } else {
          return [1, currentPage-1, currentPage, 0, max]
        }
      }
    } else {
      const pages = Array.from(Array(max + 1).keys()).slice(1);
      return pages;
    }
  }

  const btnBaseClass = `w-full transition duration-200 hover:text-neutral-300`
  return (
    <div className="flex justify-center w-full">
        <div className={`grid gap-0.5 grid-cols-7`}>
            <button onClick={prev} className={btnBaseClass}>
              <BiChevronLeft size={24} />
            </button>
            {renderInBetween().map(page => (
              <button 
                key={`page-${page}`}
                className={`flex justify-center w-full text-center ${currentPage === page ? 'text-indigo-500' : ''} ${page === 0 ? 'items-end' : ''}`}
                onClick={() => page === 0 ? {} : jump(page)}
              >
                {page === 0 ? <BiDotsHorizontal /> : page}
              </button>
            ))}
            <button onClick={next} className={btnBaseClass}>
              <BiChevronRight size={24} />
            </button>
        </div>
    </div>
  )
}