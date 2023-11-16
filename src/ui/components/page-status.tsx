import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from './button';
import { DripAnimation } from './drip-animation';

type IPageStatusProps = {
    type: 'loading' | 'error' | 'success';
    message?: string;
    fx?: () => void;
};

export const PageStatus = ({ type = 'loading', message, fx }: IPageStatusProps) => {
    const navigate = useNavigate();

    useEffect(() => {
        if (fx) {
            fx();
        }
    }, []);

    return (
        <div className="fixed z-[9999] h-screen w-screen top-0 left-0 bg-brand-dashboard">
            <div className="flex flex-col justify-center items-center h-full gap-3 text-center">
                <img src="/logo/pintswap-logo.svg" alt="PintSwap Logo" height="28" width="159" />
                {type === 'loading' && (
                    <>
                        <span>{message ? message : 'A P2P Orderbook DEX'}</span>
                        <div className="Toastify__spinner" />
                    </>
                )}
                {type === 'error' && (
                    <>
                        <span>{message ? message : 'An error occured while swapping pints.'}</span>
                        {!message && <Button onClick={() => navigate(0)}>Refresh</Button>}
                        <span className="text-xs">or</span>
                        <Button
                            type="transparent"
                            className="text-primary hover:text-primary-hover"
                            onClick={() => navigate('/')}
                        >
                            Return Home
                        </Button>
                    </>
                )}
                {type === 'success' && (
                    <>
                        <DripAnimation />
                        <span>Swap Complete</span>
                        <Button onClick={() => navigate('/')}>Return Home</Button>
                    </>
                )}
            </div>
        </div>
    );
};
