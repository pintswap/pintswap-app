import { MdChevronRight } from 'react-icons/md';
import { useLocation } from 'react-router-dom';
import { maybeFormatMultiAddr } from '../utils';

type IBreakcrumbs = {
    crumbs: { text: string; link?: string }[];
};

export const Breadcrumbs = ({ crumbs }: IBreakcrumbs) => {
    const { pathname } = useLocation();
    return (
        <span className="flex items-center gap-1">
            {crumbs?.map((crumb, i) => (
                <span key={`breadcrumb-${crumb.text}-${i}`} className="flex items-center gap-1">
                    {i !== 0 && <MdChevronRight size="14px" />}
                    <a
                        href={`/#${crumb.link}`}
                        className={`text-xs transition duration-100 ${
                            `/#${pathname}` === crumb.link ? '' : 'hover:underline'
                        }`}
                    >
                        {maybeFormatMultiAddr(crumb.text)}
                    </a>
                </span>
            ))}
        </span>
    );
};
