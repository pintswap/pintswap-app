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
    autoClose: 4000,
    closeButton: true,
};

export const updateToast = (
    toastId: Id,
    type: 'success' | 'error',
    msg?: string,
    hash?: string,
    timer?: number,
) => {
    if (type === 'success') {
        toast.update(toastId, {
            render: <ToastStatus status="success" transaction={hash} message={msg} />,
            type: 'success',
            progressStyle: {
                background: '#41a75b',
            },
            icon: <BsFillCheckCircleFill size="20px" color="#41a75b" />,
            ...defaultToastOptions,
            autoClose: timer || defaultToastOptions.autoClose,
        });
    } else {
        toast.update(toastId, {
            render: (
                <ToastStatus
                    status="error"
                    transaction={hash}
                    message={`${String(msg).slice(0, 100)}`}
                />
            ),
            type: 'error',
            progressStyle: {
                background: '#db4343',
            },
            icon: <BsFillExclamationCircleFill size="20px" color="#db4343" />,
            ...defaultToastOptions,
            autoClose: timer || defaultToastOptions.autoClose,
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
                    className="underline text-brand-blue hover:text-brand-purple transition duration-100"
                >
                    {truncate(transaction)}
                </a>
            )}
        </div>
    );
};
