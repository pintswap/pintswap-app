import { useEffect } from 'react';
import { ImSpinner9 } from 'react-icons/im';
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
        <div className="absolute z-50 h-screen w-screen top-0 left-0 bg-neutral-900">
            <div className="flex flex-col justify-center items-center h-full gap-3 text-center">
                <img src="/logo/ps-logo.png" alt="PintSwap Logo" height="100" width="100" />
                {type === 'loading' && (
                    <>
                        <span>{message ? message : 'Filling up pints...'}</span>
                        <ImSpinner9 className="animate-spin" size="24px" />
                    </>
                )}
                {type === 'error' && (
                    <>
                        <span>{message ? message : 'An error occured while swapping pints.'}</span>
                        {!message && <Button onClick={() => navigate(0)}>Refresh</Button>}
                        <span className="text-xs">or</span>
                        <Button
                            type="transparent"
                            className="text-indigo-600 hover:text-indigo-500"
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
