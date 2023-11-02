import { BigNumberish, Contract, formatEther, parseEther, Interface } from 'ethers6';
import { useAccount, useBlockNumber, useSigner } from 'wagmi';
import { CONTRACTS, MIN_ABIS, numberFormatter, providerFromChainId, updateToast } from '../utils';
import { erc20ABI } from 'wagmi';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { waitForTransaction } from '@wagmi/core';
import { toast } from 'react-toastify';

export const useStaking = () => {
    const { data: signer } = useSigner();
    const { address } = useAccount();
    const { data: currentBlock } = useBlockNumber();
    const startingBlock = currentBlock ? currentBlock - 35750 : 0; // 100,000 blocks usually get mined in 2 weeks

    const [depositInput, setDepositInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);

    // Contracts
    const pint = new Contract(CONTRACTS.mainnet.PINT, erc20ABI, providerFromChainId(1));

    const sipPINT = new Contract(
        CONTRACTS.mainnet.sipPINT,
        MIN_ABIS.ERC4626,
        providerFromChainId(1),
    );

    // Contracts Data
    async function getVaultData() {
        const defaultReturn = { totalAssets: '0', totalSupply: '0', apr: '0', totalRewards: '0' };
        try {
            const promises = await Promise.all([
                sipPINT.totalAssets(), // Big Number
                sipPINT.totalSupply(), // Big Number
            ]);
            const [totalAssets, totalSupply] = promises;
            const currentDifference: BigNumberish = totalAssets - totalSupply;

            // START: Get starting totals
            let startingDifference: BigNumberish = 0;
            let differencePercentChange: number = 0;
            if (startingBlock) {
                const startingTotalAssets = await providerFromChainId(1).call({
                    to: CONTRACTS.mainnet.sipPINT,
                    data: new Interface([
                        'function totalAssets() view returns (uint256)',
                    ]).encodeFunctionData('totalAssets', []),
                    blockTag: startingBlock,
                });
                const startingTotalSupply = await providerFromChainId(1).call({
                    to: CONTRACTS.mainnet.sipPINT,
                    data: new Interface([
                        'function totalSupply() view returns (uint256)',
                    ]).encodeFunctionData('totalSupply', []),
                    blockTag: startingBlock,
                });
                const readableStartingTotalAssets = new Interface([
                    'function totalAssets() view returns (uint256)',
                ]).decodeFunctionResult('totalAssets', startingTotalAssets);
                const readableStartingTotalSupply = new Interface([
                    'function totalSupply() view returns (uint256)',
                ]).decodeFunctionResult('totalSupply', startingTotalSupply);
                startingDifference =
                    readableStartingTotalAssets[0] - readableStartingTotalSupply[0];
            }
            differencePercentChange =
                (Number(formatEther(currentDifference)) - Number(formatEther(startingDifference))) /
                Number(formatEther(startingDifference));
            // END: get starting totals

            setInitialLoading(false);
            return {
                totalAssets: formatEther(totalAssets).toString(),
                totalSupply: formatEther(totalSupply).toString(),
                apr: differencePercentChange / 73, // divided by 365 to get annual rate rather than daily
                totalRewards: formatEther(currentDifference).toString(),
            };
        } catch (err) {
            console.error('#getVaultData:', err);
            return defaultReturn;
        }
    }

    async function getVaultUserData() {
        const defaultReturn = { userBalance: '0', availableToRedeem: '0', difference: '0' };
        try {
            if (address) {
                const shares = await sipPINT.balanceOf(address);
                const maxRedeem = await sipPINT.previewRedeem(shares);
                // const startingTotalAssets = await providerFromChainId(1).call({
                //     to: CONTRACTS.mainnet.sipPINT,
                //     data: new Interface([
                //         'function totalAssets() view returns (uint256)',
                //     ]).encodeFunctionData('totalAssets', []),
                //     blockTag: startingBlock,
                // });
                // const readableStartingTotalAssets = new Interface([
                //     'function totalAssets() view returns (uint256)',
                // ]).decodeFunctionResult('totalAssets', startingTotalAssets);
                return {
                    userBalance: formatEther(shares).toString(),
                    availableToRedeem: (
                        Math.floor(Number(formatEther(maxRedeem)) * 1000) / 1000
                    ).toString(),
                    difference: formatEther(maxRedeem - shares).toString(),
                };
            }
            setInitialLoading(false);
            return defaultReturn;
        } catch (err) {
            console.log('#getVaultUserData:', err);
            return defaultReturn;
        }
    }

    const INTERVAL = 1000 * 5;
    const vaultData = useQuery({
        queryKey: ['sipPINT-data'],
        queryFn: getVaultData,
        initialData: { totalAssets: '0', totalSupply: '0', apr: '0', totalRewards: '0' },
        refetchInterval: INTERVAL,
        enabled: !!startingBlock,
    });

    const userData = useQuery({
        queryKey: ['sipPINT-user'],
        queryFn: getVaultUserData,
        enabled: !!address,
        initialData: { userBalance: '0', availableToRedeem: '0', difference: '0' },
        refetchInterval: INTERVAL,
    });

    async function getAllowance() {
        const allowanceLeft = formatEther(
            await (pint as any)
                .connect(signer as any)
                .allowance(address, CONTRACTS.mainnet.sipPINT),
        );
        return allowanceLeft;
    }

    // UI Methods
    async function handleInputChange(e: any) {
        setDepositInput(e.currentTarget.value);
    }

    async function handleDeposit(e: any) {
        e.preventDefault();
        if (Number(depositInput) === 0 || !depositInput) {
            toast.info('Deposit input cannot be empty');
            return;
        }
        try {
            setIsLoading(true);
            const amount = parseEther(depositInput);
            const allowance = await getAllowance();
            if (Number(depositInput) > Number(allowance)) {
                toast.loading('Waiting for approval', { toastId: 'deposit-vault' });
                const approveTx = await (pint as any)
                    .connect(signer as any)
                    .approve(CONTRACTS.mainnet.sipPINT, amount);
                toast.update('deposit-vault', { render: 'Approving PINT spend' });
                await waitForTransaction({ hash: approveTx.hash });
            } else {
                toast.loading('Initiating deposit', { toastId: 'deposit-vault' });
            }
            toast.update('deposit-vault', { render: 'Waiting for signature' });
            const tx = await (sipPINT as any).connect(signer as any).deposit(amount, address);
            toast.update('deposit-vault', {
                render: `Depositing ${numberFormatter().format(Number(depositInput))} PINT`,
            });
            await waitForTransaction({ hash: tx.hash });
            updateToast('deposit-vault', 'success', 'Success', tx.hash);
            setDepositInput('');
            setIsLoading(false);
        } catch (err) {
            toast.dismiss();
            setIsLoading(false);
            console.error(err);
        }
    }

    async function previewDeposit(e: any) {
        e.preventDefault();
        const preview = await (sipPINT as any).connect(signer as any).previewDeposit(1000);
        console.log('preview', preview);
        return (await sipPINT.previewDeposit(1000)).toString();
    }

    async function handleWithdraw(e: any) {
        e.preventDefault();
        if (!userData.data.availableToRedeem || Number(userData.data.availableToRedeem) === 0) {
            toast.info('Nothing to withdraw', { autoClose: 4000 });
            return;
        }
        try {
            setIsLoading(true);
            const amount = parseEther(userData.data.availableToRedeem);
            toast.loading('Waiting for signature', { toastId: 'withdraw-vault' });
            const tx = await (sipPINT as any)
                .connect(signer as any)
                .withdraw(amount, address, address);
            toast.update('withdraw-vault', {
                render: `Withdrawing ${userData.data.availableToRedeem} PINT`,
            });
            await waitForTransaction({ hash: tx.hash });
            updateToast('withdraw-vault', 'success', 'Success', tx.hash);
            setIsLoading(false);
        } catch (err) {
            toast.dismiss();
            setIsLoading(false);
            console.error(err);
        }
    }

    async function previewWithdraw() {
        return (await sipPINT.previewWithdraw()).toString();
    }

    async function handleRedeem(e: any) {
        e.preventDefault();
        if (!userData.data.availableToRedeem || Number(userData.data.availableToRedeem) === 0) {
            toast.info('Nothing to redeem', { autoClose: 4000 });
            return;
        }
        try {
            setIsLoading(true);
            const amount = parseEther(userData.data.availableToRedeem);
            const realAmount = await sipPINT.balanceOf(address);
            toast.loading('Waiting for signature', { toastId: 'redeem-vault' });
            const tx = await (sipPINT as any)
                .connect(signer as any)
                .redeem(realAmount, address, address);
            toast.update('redeem-vault', {
                render: `Redeeming ${numberFormatter().format(
                    Number(userData.data.availableToRedeem),
                )} PINT`,
            });
            await waitForTransaction({ hash: tx.hash });
            updateToast('redeem-vault', 'success', 'Success', tx.hash);
            setIsLoading(false);
        } catch (err) {
            toast.dismiss();
            setIsLoading(false);
            console.error(err);
        }
    }

    async function previewRedeem() {
        return formatEther(
            await sipPINT.previewRedeem(await sipPINT.convertToShares(userData.data.userBalance)),
        );
    }

    return {
        handleDeposit,
        handleWithdraw,
        handleRedeem,
        previewDeposit,
        previewWithdraw,
        previewRedeem,
        totalAssets: vaultData.data.totalAssets,
        totalSupply: vaultData.data.totalSupply,
        userDeposited: userData.data.userBalance,
        rewardsGenerated: userData.data.difference,
        apr: vaultData.data.apr,
        availableToRedeem: userData.data.availableToRedeem,
        handleInputChange,
        depositInput,
        isLoading,
        dataLoading: userData.isLoading || vaultData.isLoading || initialLoading,
        userLoading: initialLoading,
    };
};
