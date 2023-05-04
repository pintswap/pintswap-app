import {
    createContext,
    ReactNode,
    useContext,
    useEffect,
    useState,
} from 'react';
import { useAccount, useSigner } from 'wagmi';
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
    extension: string;
    active: boolean;
}

export type IUserStoreProps = {
    userData: IUserDataProps;
    updateBio: (e: any) => void;
    updateName: (e: any) => void;
    updateImg: (e: any) => void;
    updatePrivateKey: (e: any) => void;
    handleSave: () => void;
    updateExt: (e: any) => void;
    toggleActive: () => void;
};

// Context
const UserContext = createContext<IUserStoreProps>({
    userData: EMPTY_USER_DATA,
    updateBio(e) {},
    updateName(e) {},
    updateImg(e) {},
    handleSave() {},
    updatePrivateKey(e) {},
    updateExt(e) {},
    toggleActive() {}
});

// Wrapper
export function UserStore(props: { children: ReactNode }) {
    const { pintswap, setPintswap } = useGlobalContext();
    const { module } = pintswap;
    const { data: signer } = useSigner();
    const { address } = useAccount();
    const [ userData, setUserData ] = useState<IUserDataProps>(EMPTY_USER_DATA);
    const [initialized, setInitialized] = useState<boolean>(false);
    const psUser = localStorage.getItem('_pintUser');

    function toggleActive() {
        if(!userData.active) module?.startPublishingOffers(60000);
        else module?.startPublishingOffers(60000).stop();
        setUserData({ ...userData, active: !userData.active });
    }

    function updateExt(e: any) {
        console.log(e)
    }

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
        setUserData({ ...userData, name: `${e.target.value}`});
    }

    function handleSave() {
        if (module) {
          localStorage.setItem('_pintUser', JSON.stringify(module.toObject(), null, 2));
          (async () => {
            if (module) {
                const psUser = localStorage.getItem('_pintUser');
                // Save name with extension
                let nameWExt = `${userData.name}`;
                if(!nameWExt.includes('.drip')) {
                    nameWExt = `${nameWExt}${userData.extension}`;
                }
                await module.registerName(nameWExt);
                // Save private key
                if(psUser && userData.privateKey && userData.privateKey.length > 50) {
                    module.signer = new ethers.Wallet(userData.privateKey).connect(module.signer.provider)
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
            setUserData({
                name: await module.resolveName(module.peerId.toB58String()),
                bio: module.userData.bio,
                img: module.userData.image,
                privateKey: '',
                active: false,
                extension: '.drip'
            })
            let { bio: _bio, image: _image } = (module as any).userData ?? {
                bio: '',
                image: new Uint8Array(0),
            };
            if (_bio !== '') setUserData({...userData, bio: _bio });
            if (_image) setUserData({...userData, img: _image });
            if (psUser) {
                const localUser = await Pintswap.fromObject(JSON.parse(psUser), signer);
                setPintswap({ ...pintswap, module: localUser });
            }
            setInitialized(true);
        }
        })().catch((err) => console.error(err));
    }, [pintswap.module, initialized])

    /* 
    * subscribe to wallet address changes to maintain the same multiAddr
    */
    useEffect(() => {
        (async () => {
            if(!psUser && module && address) await Pintswap.fromPassword({ signer, multiaddr: module.peerId.toB58String(), password: await signer?.getAddress() })
        })().catch((err) => console.error(err))
    }, [address, signer])

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
                toggleActive
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
