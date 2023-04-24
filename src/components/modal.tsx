import * as React from 'react';
import Backdrop from '@mui/material/Backdrop';
import Modal from '@mui/material/Modal';
import Fade from '@mui/material/Fade';
import { Button } from './button';

type IModalProps = {
  children: React.ReactElement;
  button: React.ReactNode;
  title?: string;
}

export function TransitionModal({ children, button, title }: IModalProps) {
  const [open, setOpen] = React.useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  return (
    <>
      {typeof button === 'string' ? (
        <Button onClick={handleOpen}>{button}</Button>
      ) : (
        <div onClick={handleOpen} className="cursor-pointer w-fit">{button}</div>
      )}
      <Modal
        aria-labelledby={title || 'Modal'}
        open={open}
        onClose={handleClose}
        closeAfterTransition
        slots={{ backdrop: Backdrop }}
        slotProps={{
          backdrop: {
            timeout: 500,
          },
        }}
      >
        <Fade in={open}>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 max-w-[400px] p-4 focus-visible:outline-none">
            {children}
          </div>
        </Fade>
      </Modal>
    </>
  );
}