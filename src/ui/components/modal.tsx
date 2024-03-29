import * as React from 'react';
import Backdrop from '@mui/material/Backdrop';
import Modal from '@mui/material/Modal';
import Fade from '@mui/material/Fade';
import { Button } from './button';

type IModalProps = {
    children: React.ReactElement;
    button?: React.ReactNode;
    title?: string;
    modalClass?: string;
    state?: boolean;
    setState?: React.Dispatch<React.SetStateAction<boolean>>;
    buttonClass?: string;
};

export function TransitionModal({
    children,
    button,
    title,
    modalClass,
    state,
    setState,
    buttonClass,
}: IModalProps) {
    const [open, setOpen] = React.useState(false);
    const handleOpen = () => (setState ? setState(true) : setOpen(true));
    const handleClose = () => (setState ? setState(false) : setOpen(false));

    return (
        <>
            {button && (
                <>
                    {typeof button === 'string' ? (
                        <Button onClick={handleOpen}>{button}</Button>
                    ) : (
                        <span
                            onClick={handleOpen}
                            className={`cursor-pointer  w-fit ${buttonClass || ''}`}
                        >
                            {button}
                        </span>
                    )}
                </>
            )}

            <Modal
                aria-labelledby={title || 'Modal'}
                open={state || open}
                onClose={handleClose}
                closeAfterTransition
                slots={{ backdrop: Backdrop }}
                slotProps={{
                    backdrop: {
                        timeout: 150,
                        className: '!bg-[rgba(0,0,0,0.25)]',
                    },
                }}
            >
                <Fade in={state || open}>
                    <div
                        className={`${
                            modalClass || ''
                        } absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 max-w-[500px] w-full p-4 focus-visible:outline-none z-[999]`}
                    >
                        {children}
                    </div>
                </Fade>
            </Modal>
        </>
    );
}
