import { ReactNode } from 'react';
import { Breadcrumbs } from './breadcrumbs';

type IHeader = {
    children: string | ReactNode;
    breadcrumbs?: { text: string; link: string }[];
};

export const Header = ({ children, breadcrumbs }: IHeader) => {
    return (
        <div className="flex flex-col justify-start items-start gap-1 whitespace-nowrap">
            <h2 className="view-header mb-0">{children}</h2>
            {breadcrumbs && <Breadcrumbs crumbs={breadcrumbs} />}
        </div>
    );
};
