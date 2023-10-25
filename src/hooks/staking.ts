import { useAccount } from 'wagmi';

export const useStaking = () => {
    const { address } = useAccount();

    async function handleDeposit(e: any) {
        e.preventDefault();
        // Handle deposit in vault
    }

    async function handleWithdraw(e: any) {
        e.preventDefault();
        // Handle deposit in vault
    }

    return {
        handleDeposit,
        handleWithdraw,
    };
};
