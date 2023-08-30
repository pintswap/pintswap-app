import * as React from 'react';
import Backdrop from '@mui/material/Backdrop';
import Modal from '@mui/material/Modal';
import Fade from '@mui/material/Fade';
import { Button } from './button';

type IModalProps = {
    children: React.ReactElement;
    button: React.ReactNode;
    title?: string;
    modalClass?: string;
    state?: boolean;
    setState?: React.Dispatch<React.SetStateAction<boolean>>;
};

export function TransitionModal({
    children,
    button,
    title,
    modalClass,
    state,
    setState,
}: IModalProps) {
    const [open, setOpen] = React.useState(false);
    const handleOpen = () => (setState ? setState(true) : setOpen(true));
    const handleClose = () => (setState ? setState(false) : setOpen(false));

    return (
        <>
            {typeof button === 'string' ? (
                <Button onClick={handleOpen}>{button}</Button>
            ) : (
                <button onClick={handleOpen} className="cursor-pointer w-fit">
                    {button}
                </button>
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
                        } absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 max-w-[400px] p-4 focus-visible:outline-none`}
                    >
                        {children}
                    </div>
                </Fade>
            </Modal>
        </>
    );
}
