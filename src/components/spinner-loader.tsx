import { ImSpinner9 } from "react-icons/im";

type ISpinnerLoaderProps = {
  color?: `text-${string}`;
  size?: `${string}px`;
  height?: `min-h-${string}`
  className?: string;
}

export const SpinnerLoader = ({ color = 'text-gray-400', size = '20px', height = 'min-h-[50px]', className }: ISpinnerLoaderProps) => (
  <div className={`flex ${className ? className : ''} justify-center items-center ${height}`}>
    <ImSpinner9 
      className={`animate-spin ${color}`}
      size={size} 
    />
  </div>
)