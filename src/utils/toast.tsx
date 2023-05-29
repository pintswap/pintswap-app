import { Id, toast } from 'react-toastify';
import { BsFillCheckCircleFill, BsFillExclamationCircleFill } from 'react-icons/bs';
import { truncate } from './format';

type IToastStatusProps = {
  status: 'error' | 'success' | 'pending';
  transaction?: string;
  message?: string;
};

export const defaultToastOptions = {
    isLoading: false,
    autoClose: 6000,
    closeButton: true,
};

export const updateToast = (toastId: Id, type: 'success' | 'error', msg?: string, hash?: string) => {
    if (type === 'success') {
        toast.update(toastId, {
            render: <ToastStatus status="success" transaction={hash} message={msg} />,
            type: 'success',
            progressStyle: {
                background: '#41a75b',
            },
            icon: <BsFillCheckCircleFill size="20px" color="#41a75b" />,
            ...defaultToastOptions,
        });
    } else {
        toast.update(toastId, {
            render: (
                <ToastStatus
                    status="error"
                    transaction={hash}
                    message={`${String(msg).slice(0, 100)}...`}
                />
            ),
            type: 'error',
            progressStyle: {
                background: '#db4343',
            },
            icon: <BsFillExclamationCircleFill size="20px" color="#db4343" />,
            ...defaultToastOptions,
        });
    }
};

export const ToastStatus = ({ status, transaction, message }: IToastStatusProps) => {
    const determineText = () => {
        if (!message) {
            switch (status) {
                case 'error':
                    return `${transaction ? 'Error while submitted transaction' : 'Error'}`;
                case 'success':
                    return `${transaction ? 'Transaction completed' : 'Success'}`;
                case 'pending':
                    return `${transaction ? 'Transaction submitted' : 'Loading'}`;
            }
        } else {
            return message;
        }
    };
    return (
        <div className="w-full flex flex-col justify-between">
            <span>{determineText()}</span>
            {transaction && (
                <a
                    href={`https://etherscan.io/tx/${transaction}`}
                    target="_blank"
                    rel="noreferrer"
                    className="underline text-brand-blue hover:text-brand-purple transition duration-150"
                >
                    {truncate(transaction)}
                </a>
            )}
        </div>
    );
};

