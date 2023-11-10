import {
    createContext,
    Dispatch,
    ReactNode,
    SetStateAction,
    useContext,
    useEffect,
    useState,
} from 'react';
import { usePintswapContext } from './pintswap';
import { EMPTY_USER_DATA } from '../utils';
import { NFTPFP } from '@pintswap/sdk';
import { getTokenBalances } from '../api';
import { useAccount } from 'wagmi';

// Types
export type IUserDataProps = {
    img: NFTPFP | Buffer | string;
    bio: string;
    name: string;
    address: string;
    offers?: any;
    privateKey?: string;
    extension?: string;
    active: boolean;
    loading: boolean;
};

export type ITokenResProps = {
    symbol: string;
    address: string;
    decimals: number;
    balance: string;
};

export type IUserStoreProps = {
    tokenHoldings: ITokenResProps[];
    userData: IUserDataProps;
    toggleActive: () => void;
    setUserData: Dispatch<SetStateAction<IUserDataProps>>;
    offers: number;
};

// Context
const UserContext = createContext<IUserStoreProps>({
    tokenHoldings: [],
    userData: EMPTY_USER_DATA,
    toggleActive() {},
    setUserData() {},
    offers: 0,
});

// Wrapper
export function UserStore(props: { children: ReactNode }) {
    const { address } = useAccount();
    const { pintswap } = usePintswapContext();
    const { module } = pintswap;
    const [userData, setUserData] = useState<IUserDataProps>(EMPTY_USER_DATA);
    const [offers, setOffers] = useState(0);
    const [tokenHoldings, setTokenHoldings] = useState<ITokenResProps[]>([]);

    function toggleActive(e?: any) {
        if (!userData.active) module?.startPublishingOffers(10000);
        else module?.startPublishingOffers(10000).stop();
        setUserData({ ...userData, active: !userData.active });
    }

    /*
     * check if pintswap module has starting vals for bio, shortaddress, setProfilePic
     * only should run if pintswap is initialized and only run once
     */
    useEffect(() => {
        (async () => {
            if (module) {
                let name = '';
                // try {
                //     name = await module.resolveName(module.address);
                // } catch (err) {
                //     console.warn(
                //         `#setUserData useEffect: no names found for multiAddr ${module?.address}`,
                //     );
                // }
                setUserData({
                    ...userData,
                    name,
                    address: module.address,
                    bio: module.userData.bio,
                    img: module.userData.image,
                    offers: module.offers,
                });
            }
        })().catch((err) => console.error(err));
    }, [module?.address, module?.userData]);

    /**
     * Gets user's token holdings (used only for select token dropdown button component)
     */
    useEffect(() => {
        (async () => {
            if (address) {
                const tokenHoldings = await getTokenBalances(address);
                if (tokenHoldings?.length) setTokenHoldings(tokenHoldings);
            }
        })().catch((err) => console.error(err));
    }, [address]);

    useEffect(() => {
        if (module) {
            const interval = setInterval(() => {
                setOffers(module?.offers?.size || 0);
            }, 2000);
            return () => clearInterval(interval);
        }
    }, [module]);

    return (
        <UserContext.Provider
            value={{
                userData,
                toggleActive,
                setUserData,
                tokenHoldings,
                offers,
            }}
        >
            {props.children}
        </UserContext.Provider>
    );
}

// Independent
export function useUserContext() {
    return useContext(UserContext);
}
