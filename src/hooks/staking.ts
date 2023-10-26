import { Contract, formatEther, parseEther } from 'ethers6';
import { useAccount, useSigner } from 'wagmi';
import { CONTRACTS, providerFromChainId, updateToast } from '../utils';
import { erc4626ABI, erc20ABI } from 'wagmi';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { waitForTransaction } from '@wagmi/core';
import { toast } from 'react-toastify';

export const useStaking = () => {
    const { data: signer } = useSigner();
    const { address } = useAccount();

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
        const promises = await Promise.all([sipPINT.totalAssets(), sipPINT.totalSupply()]);
        return {
            totalAssets: formatEther(promises[0]).toString(),
            totalSupply: formatEther(promises[1]).toString(),
        };
    }

    async function getVaultUserData() {
        const promises = await Promise.all([sipPINT.balanceOf(address)]);
        return {
            userBalance: formatEther(promises[0]).toString(),
        };
    }

    const INTERVAL = 1000 * 5;
    const vaultData = useQuery({
        queryKey: ['sipPINT-data'],
        queryFn: getVaultData,
        initialData: { totalAssets: '0', totalSupply: '0' },
        refetchInterval: INTERVAL,
    });

    const userData = useQuery({
        queryKey: ['sipPINT-user'],
        queryFn: getVaultUserData,
        enabled: !!address,
        initialData: { userBalance: '0' },
        refetchInterval: INTERVAL,
    });

    // UI Methods
    async function handleInputChange(e: any) {
        setDepositInput(e.currentTarget.value);
    }

    async function handleDeposit(e: any) {
        e.preventDefault();
        setIsLoading(true);
        const amount = parseEther(depositInput);
        toast.loading('Waiting for approval', { toastId: 'deposit-vault' });
        const approveTx = await (pint as any)
            .connect(signer as any)
            .approve(CONTRACTS.mainnet.sipPINT, amount);
        toast.update('deposit-vault', { render: 'Approving PINT spend' });
        await waitForTransaction({ hash: approveTx.hash });
        toast.update('deposit-vault', { render: 'Waiting for signature' });
        const tx = await (sipPINT as any).connect(signer as any).deposit(amount, address);
        toast.update('deposit-vault', { render: `Depositing ${depositInput} PINT` });
        await waitForTransaction({ hash: tx.hash });
        updateToast('deposit-vault', 'success', 'Success', tx.hash);
        setDepositInput('');
        setIsLoading(false);
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
        setIsLoading(true);
        const amount = parseEther(userData.data.userBalance);
        console.log('amount', amount);
        toast.loading('Waiting for signature', { toastId: 'withdraw-vault' });
        const tx = await (sipPINT as any).connect(signer as any).withdraw(amount, address, address);
        toast.update('withdraw-vault', { render: `Withdrawing ${userData.data.userBalance} PINT` });
        await waitForTransaction({ hash: tx.hash });
        updateToast('withdraw-vault', 'success', 'Success', tx.hash);
        setIsLoading(false);
    }

    async function previewWithdraw() {
        return (await sipPINT.previewWithdraw()).toString();
    }

    async function handleRedeem(e: any) {
        e.preventDefault();
        // Handle redemptions
    }

    async function previewRedeem() {
        return (await sipPINT.previewRedeem()).toString();
    }

    console.log('userData', userData.data);

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
        apr: '0',
        availableToRedeem: '0',
        handleInputChange,
        depositInput,
        isLoading,
    };
};
