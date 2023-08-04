import { ReactNode } from 'react';
import { MdChevronRight } from 'react-icons/md';
import { useLocation } from 'react-router-dom';

type IHeader = {
    children: string | ReactNode;
    breadcrumbs?: { text: string; link: string }[];
};

export const Header = ({ children, breadcrumbs }: IHeader) => {
    const { pathname } = useLocation();
    return (
        <div className="flex flex-col justify-start items-start gap-1 md:gap-2 whitespace-nowrap">
            <h2 className="view-header mb-0">{children}</h2>
            <span className="flex items-center gap-1">
                {breadcrumbs?.map((crumb, i) => (
                    <span key={`breadcrumb-${crumb.text}-${i}`} className="flex items-center gap-1">
                        {i !== 0 && <MdChevronRight size="14px" />}
                        <a
                            href={`/#${crumb.link}`}
                            className={`text-xs transition duration-150 ${
                                `/#${pathname}` === crumb.link ? '' : 'hover:underline'
                            }`}
                        >
                            {crumb.text}
                        </a>
                    </span>
                ))}
            </span>
        </div>
    );
};
