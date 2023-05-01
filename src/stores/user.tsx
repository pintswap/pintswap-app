import {
    createContext,
    ReactNode,
    useContext,
    useEffect,
    useState,
} from 'react';
import { useSigner } from 'wagmi';
import { useGlobalContext } from './global';
import { Pintswap } from "@pintswap/sdk";
import { EMPTY_USER_DATA } from '../utils/common';
import { ethers } from 'ethers6';

// Types
export type IUserDataProps = {
    img: string | Buffer;
    bio: string;
    name: string;
    offers?: any[];
    privateKey: string;
}

export type IUserStoreProps = {
    userData: IUserDataProps;
    updateBio: (e: any) => void;
    updateName: (e: any) => void;
    updateImg: (e: any) => void;
    updatePrivateKey: (e: any) => void;
    handleSave: () => void;
};

// Context
const UserContext = createContext<IUserStoreProps>({
    userData: EMPTY_USER_DATA,
    updateBio(e) {},
    updateName(e) {},
    updateImg(e) {},
    handleSave() {},
    updatePrivateKey(e) {},
});

// Wrapper
export function UserStore(props: { children: ReactNode }) {
    const { pintswap, setPintswap } = useGlobalContext();
    const { module } = pintswap;
    const { data: signer } = useSigner();
    const [ userData, setUserData ] = useState<IUserDataProps>(EMPTY_USER_DATA);
    let [initialized, setInitialized] = useState<boolean>(false);

    /*
     * check if pintswap module is initialized and/or has starting vals for bio, shortaddress, setProfilePic
     * only should run if pintswap is initialized and only run once
     */
    useEffect(() => {
        (async () => {
            if (!initialized && module) {
/* 
                const pintswapSigner = signer || ethers.Wallet.createRandom().connect(new ethers.InfuraProvider('mainnet'));
                const pintswapLoaded = localStorage.getItem('_pintUser') ? await Pintswap.fromObject(
                    JSON.parse(localStorage.getItem('_pintUser') as string),
                    pintswapSigner as any
                ) : await Pintswap.initialize({ signer: (pintswapSigner as any), awaitReceipts: false });
                setPintswap({ ...pintswap, module: pintswapLoaded, loading: false });
*/
                setUserData({
                    name: await module.resolveName(module.peerId.toB58String()),
                    bio: module.userData.bio,
                    img: module.userData.image,
                    privateKey: ''
                })
                setInitialized(true);
            }
        })().catch((err) => console.error(err));
    }, [module, initialized]);

    async function updateImg(e: any) {
        if(module) {
            let image = (e.target.files as any)[0] ?? null;
            let _buff = Buffer.from(await image.arrayBuffer());
            module.setImage(_buff);
            setUserData({...userData, img: _buff});
        }
    }

    function updateBio(e: any) {
        if(module) {
            module.setBio(e.target.value);
            setUserData({ ...userData, bio: e.target.value })
        }
    }

    // TODO
    function updatePrivateKey(e: any) {
        if(module) {
            setUserData({ ...userData, privateKey: e.target.value})
        } else {
            setUserData({ ...userData, privateKey: e.target.value })
        }
    }

    function updateName(e: any) {
        setUserData({ ...userData, name: e.target.value });
    }

    function handleSave() {
        const { module } = pintswap;
        if (module) {
          localStorage.setItem('_pintUser', JSON.stringify(module.toObject(), null, 2));
          (async () => {
            if (module) {
                await module.registerName(userData.name);
                // TODO: fix saving private key
                const psUser = localStorage.getItem('_pintUser');
                if(psUser && userData.privateKey && userData.privateKey.length > 10) {
                    await Pintswap.fromObject(JSON.parse(psUser), new ethers.Wallet(userData.privateKey))
                }
            }
          })().catch((err) => console.error(err));
        }
    }

    /*
    * check if pintswap module is initialized and/or has starting vals for bio, shortaddress, setProfilePic
    * only should run if pintswap is initialized and only run once
    */
    useEffect(() => {
        (async () => {
        if (module && !initialized) {
            const localUser = localStorage.getItem('_pintUser')
            let { bio: _bio, image: _image } = (module as any).userData ?? {
                bio: '',
                image: new Uint8Array(0),
            };
            if (_bio !== '') setUserData({...userData, bio: _bio });
            if (_image) setUserData({...userData, img: _image });
            if (localUser) {
                const psUser = await Pintswap.fromObject(JSON.parse(localUser), signer);
                setPintswap({ ...pintswap, module: psUser });
            }
            setInitialized(true);
        }
        })().catch((err) => console.error(err));
    }, [pintswap.module, initialized])

    return (
        <UserContext.Provider
            value={{
                userData,
                updateBio,
                updateName,
                updateImg,
                handleSave,
                updatePrivateKey,
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
