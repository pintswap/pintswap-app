import { BigNumberish, Contract, formatEther, parseEther, Interface } from 'ethers6';
import { useAccount, useBlockNumber, useSigner } from 'wagmi';
import { CONTRACTS, alchemy, providerFromChainId, updateToast } from '../utils';
import { erc20ABI } from 'wagmi';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { waitForTransaction } from '@wagmi/core';
import { toast } from 'react-toastify';

export const useStaking = () => {
    const { data: signer } = useSigner();
    const { address } = useAccount();
    const { data: currentBlock } = useBlockNumber();
    const startingBlock = currentBlock ? currentBlock - 7150 : 0; // 50,000 blocks usually get mined in a 1 week

    const [depositInput, setDepositInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    // Contracts
    const pint = new Contract(CONTRACTS.mainnet.PINT, erc20ABI, providerFromChainId(1));

    const sipPINT = new Contract(
        CONTRACTS.mainnet.sipPINT,
        [
            'function asset() public view returns (address)',
            'function totalAssets() public view returns (uint256)',
            'function convertToShares(uint256 assets) public view returns (uint256 shares)',
            'function convertToAssets(uint256 shares) public view returns (uint256 assets)',
            'function maxDeposit(address receiver) public view returns (uint256)',
            'function previewDeposit(uint256 assets) public view returns (uint256)',
            'function deposit(uint256 assets, address receiver) public returns (uint256 shares)',
            'function maxMint(address receiver) public view returns (uint256)',
            'function previewMint(uint256 shares) public view returns (uint256)',
            'function mint(uint256 shares, address receiver) public returns (uint256 assets)',
            'function maxWithdraw(address owner) public view returns (uint256)',
            'function previewWithdraw(uint256 assets) public view returns (uint256)',
            'function withdraw(uint256 assets, address receiver, address owner) public returns (uint256 shares)',
            'function maxRedeem(address owner) public view returns (uint256)',
            'function previewRedeem(uint256 shares) public view returns (uint256)',
            'function redeem(uint256 shares, address receiver, address owner) public returns (uint256 assets)',
            'function totalSupply() public view returns (uint256)',
            'function balanceOf(address owner) public view returns (uint256)',
            'function approve(address, uint256) returns (bool)',
            'function allowance(address, address) view returns (uint256)',
        ],
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

            const returnObj = {
                totalAssets: formatEther(totalAssets).toString(),
                totalSupply: formatEther(totalSupply).toString(),
                apr: differencePercentChange,
                totalRewards: formatEther(currentDifference).toString(),
            };
            return returnObj;
        } catch (err) {
            console.error('#getVaultData:', err);
            return defaultReturn;
        }
    }

    async function getVaultUserData() {
        const defaultReturn = { userBalance: '0', availableToRedeem: '0' };
        try {
            if (address) {
                const promises = await Promise.all([sipPINT.balanceOf(address)]);
                const [walletDeposit] = promises;
                const userBalance = formatEther(walletDeposit).toString();
                const { totalSupply, totalRewards } = vaultData.data;
                const userVaultShare = Number(userBalance) / Number(totalSupply);
                const redeemAmount = !isNaN(userVaultShare)
                    ? Number(totalRewards) * userVaultShare
                    : 0;
                return {
                    userBalance,
                    availableToRedeem: redeemAmount
                        ? (Math.floor(redeemAmount * 1000) / 1000).toString()
                        : '0',
                };
            }
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
    });

    const userData = useQuery({
        queryKey: ['sipPINT-user'],
        queryFn: getVaultUserData,
        enabled: !!address,
        initialData: { userBalance: '0', availableToRedeem: '0' },
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
            toast.update('deposit-vault', { render: `Depositing ${depositInput} PINT` });
            await waitForTransaction({ hash: tx.hash });
            updateToast('deposit-vault', 'success', 'Success', tx.hash);
            setDepositInput('');
            setIsLoading(false);
        } catch (err) {
            toast.dismiss('deposit-vault');
            setIsLoading(false);
            console.log(err);
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
        if (!userData.data.userBalance || Number(userData.data.userBalance) === 0) {
            toast.info('Nothing to withdraw', { autoClose: 4000 });
            return;
        }
        try {
            setIsLoading(true);
            const amount = parseEther(userData.data.userBalance);
            toast.loading('Waiting for signature', { toastId: 'withdraw-vault' });
            const tx = await (sipPINT as any)
                .connect(signer as any)
                .withdraw(amount, address, address);
            toast.update('withdraw-vault', {
                render: `Withdrawing ${userData.data.userBalance} PINT`,
            });
            await waitForTransaction({ hash: tx.hash });
            updateToast('withdraw-vault', 'success', 'Success', tx.hash);
            setIsLoading(false);
        } catch (err) {
            toast.dismiss('withdraw-vault');
            setIsLoading(false);
            console.log(err);
        }
    }

    async function previewWithdraw() {
        return (await sipPINT.previewWithdraw()).toString();
    }

    async function handleRedeem(e: any) {
        e.preventDefault();
        // Handle redemptions
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
        apr: vaultData.data.apr,
        availableToRedeem: userData.data.availableToRedeem,
        handleInputChange,
        depositInput,
        isLoading,
        dataLoading: userData.isLoading && vaultData.isLoading,
    };
};
