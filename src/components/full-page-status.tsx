import { ImSpinner9 } from 'react-icons/im';
import { useNavigate } from 'react-router-dom';
import { Button } from './button';

type IFullPageStatusProps = {
  type: 'loading' | 'error';
  message?: string;
}

export const FullPageStatus = ({ type ='loading', message }: IFullPageStatusProps) => {
  const navigate = useNavigate();
  return (
    <div className="absolute z-50 h-screen w-screen top-0 left-0 bg-neutral-900">
        <div className="flex flex-col justify-center items-center h-full gap-3">
            <img src="/logo/ps-logo.png" alt="PintSwap Logo" height="100" width="100" />
            {type === 'loading' && (
              <>
            <span>{message ? message : 'Connecting to peer'}</span>
            <ImSpinner9 className="animate-spin" size="24px" />
            </>
            )}
            {type === 'error' && (
              <>
            <span>{message ? message : 'An error occured while swapping pints.'}</span>
            {!message && <Button onClick={() => navigate(0)}>Refresh</Button>}
            </>
            )}
        </div>
    </div>
  )
}