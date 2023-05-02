type IStatusIndicatorProps = {
  active: boolean;
  className?: string;
  size?: `sm` | 'md' | 'lg';
  clickable?: boolean;
}

export const StatusIndicator = ({ active, className, size }: IStatusIndicatorProps) => {
  const renderSize = () => {
    switch (size) {
      case 'sm': return 'h-1 w-1';
      case 'lg': return 'h-4 w-4';
      default: return 'h-2.5 w-2.5';
    }
  }
  const renderColor = () => {
    if(active) return 'bg-green-400';
    else return 'bg-red-400';
  }

  return (
    <div className={`${className ? className : ''} absolute z-50`}>
        <span className={`${renderSize()} ${renderColor()} rounded-full block`} />
    </div>
  )
}