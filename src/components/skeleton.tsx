import { ReactNode } from "react"

type ISkeletonProps = {
  children: ReactNode;
  loading?: boolean;
}

export const Skeleton = ({ children, loading }: ISkeletonProps) => {
  return (
    <div role="status" className={`${loading ? 'animate-pulse' : ''}`}>
      <div className={`rounded-full px-2 ${loading ? 'bg-neutral-700 text-transparent' : ''}`}>
        {children}
      </div>
  </div>
  )
}