import {
    createContext,
    Dispatch,
    EventHandler,
    ReactNode,
    SetStateAction,
    useContext,
    useEffect,
    useState,
} from 'react';
import { usePintswapContext } from './pintswap';
import { EMPTY_USER_DATA, fetchNFT, savePintswap } from '../utils';
import { ethers } from 'ethers6';
import { NFTPFP } from '@pintswap/sdk';
import { GAS_PRICE_MULTIPLIER, makeGetGasPrice } from './pintswap';

// Types
export type IUserDataProps = {
    img: NFTPFP | Buffer | string;
    bio: string;
    name: string;
    offers?: any[];
    privateKey?: string;
    extension?: string;
    active: boolean;
    loading: boolean;
};

type IUseNftProps = {
    using: boolean;
    address: string;
    id: string;
};

export type IUserStoreProps = {
    userData: IUserDataProps;
    useNft: IUseNftProps;
    loading: boolean;
    updateBio: (e: any) => void;
    updateName: (e: any) => void;
    updateImg: (e: any) => void;
    updatePrivateKey: (e: any) => void;
    handleSave: () => Promise<void>;
    updateExt: (e: any) => void;
    toggleActive: () => void;
    toggleUseNft: () => void;
    setUseNft: Dispatch<SetStateAction<any>>;
    setUserData: Dispatch<SetStateAction<IUserDataProps>>;
};

// Utils
const DEFAULT_USE_NFT = { using: false, address: '', id: '' };

// Context
const UserContext = createContext<IUserStoreProps>({
    userData: EMPTY_USER_DATA,
    useNft: DEFAULT_USE_NFT,
    loading: false,
    updateBio(e) {},
    updateName(e) {},
    updateImg(e) {},
    handleSave: async () => {},
    updatePrivateKey(e) {},
    updateExt(e) {},
    toggleActive() {},
    toggleUseNft() {},
    setUseNft() {},
    setUserData() {},
});

// Wrapper
export function UserStore(props: { children: ReactNode }) {
    const psUser = localStorage.getItem('_pintUser');
    const { pintswap } = usePintswapContext();
    const { module } = pintswap;
    const [userData, setUserData] = useState<IUserDataProps>(EMPTY_USER_DATA);
    const [useNft, setUseNft] = useState(DEFAULT_USE_NFT);
    const [loading, setLoading] = useState(false);

    function toggleActive(e?: any) {
        if (!userData.active) module?.startPublishingOffers(60000);
        else module?.startPublishingOffers(60000).stop();
        setUserData({ ...userData, active: !userData.active });
    }

    function toggleUseNft() {
        if (!useNft.using) setUseNft({ ...useNft, using: true });
        else setUseNft({ ...useNft, using: false });
    }

    function updateExt(e: any) {
        console.log(e);
    }

    async function updateImg(e: any) {
        if (module) {
            const image = (e.target.files as any)[0] ?? null;
            const _buff = Buffer.from(await image.arrayBuffer());
            module.setImage(_buff);
            setUserData({ ...userData, img: _buff });
        }
    }

    function updateBio(e: any) {
        if (module) {
            setUserData({ ...userData, bio: e.target.value });
        }
    }

    function updatePrivateKey(e: any) {
        if (module) {
            setUserData({ ...userData, privateKey: e.target.value });
        }
    }

    function updateName(e: any) {
        setUserData({ ...userData, name: `${e.target.value}` });
    }

    async function handleSave() {
        setLoading(true);
        if (module) {
            module.setBio(userData.bio);
            savePintswap(module);
            // Save name with extension
            let nameWExt = `${userData.name}`;
            if (!nameWExt.includes('.drip')) {
                nameWExt = `${nameWExt}${userData.extension}`;
            }
            try {
                if (useNft.address && useNft.id && ethers.isAddress(useNft.address)) {
                    const { imageBlob } = await fetchNFT({
                        token: useNft.address,
                        tokenId: useNft.id,
                    });
                    if (imageBlob) {
                        const buff = Buffer.from(await (imageBlob as Blob).arrayBuffer());
                        module.setImage(buff);
                        setUserData({ ...userData, img: buff });
                    }
                }
                await module.registerName(nameWExt);
                // Save private key
                if (psUser && userData.privateKey && userData.privateKey.length > 50) {
                    module.signer = new ethers.Wallet(userData.privateKey).connect(
                        module.signer.provider,
                    );
                    module.signer.provider.getGasPrice = makeGetGasPrice(
                        module.signer.provider,
                        GAS_PRICE_MULTIPLIER,
                    );
                }
            } catch (err) {
                console.error(`#handleSave:`, err);
            }
        }
        setLoading(false);
    }

    /*
     * check if pintswap module has starting vals for bio, shortaddress, setProfilePic
     * only should run if pintswap is initialized and only run once
     */
    useEffect(() => {
        (async () => {
            if (module) {
                let name = '';
                try {
                    name = await module.resolveName(
                        (module.constructor as any).toAddress(module.peerId.toB58String()),
                    );
                } catch (err) {
                    console.warn(
                        `#setUserData useEffect: no names found for multiAddr ${module.peerId.toB58String()}`,
                    );
                }
                setUserData({
                    ...userData,
                    name,
                    bio: module.userData.bio,
                    img: module.userData.image,
                });
            }
        })().catch((err) => console.error(err));
    }, [module?.peerId.toB58String(), module?.userData]);

    return (
        <UserContext.Provider
            value={{
                userData,
                updateBio,
                updateName,
                updateImg,
                handleSave,
                updatePrivateKey,
                updateExt,
                toggleActive,
                useNft,
                toggleUseNft,
                setUseNft,
                loading,
                setUserData,
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
