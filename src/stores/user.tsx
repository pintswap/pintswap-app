import {
    createContext,
    ReactNode,
    useContext,
    useEffect,
    useState,
} from 'react';
import { usePintswapContext } from './pinstwap';
import { EMPTY_USER_DATA } from '../utils/common';
import { ethers } from 'ethers6';
import { useProvider } from "wagmi";

// Types
export type IUserDataProps = {
    img: string | Buffer;
    bio: string;
    name: string;
    offers?: any[];
    privateKey?: string;
    extension?: string;
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
    const { pintswap } = usePintswapContext();
    const { module } = pintswap;
    const provider: any = useProvider();
    const [ userData, setUserData ] = useState<IUserDataProps>(EMPTY_USER_DATA);
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

    async function handleSave() {
        if (module) {
            localStorage.setItem('_pintUser', JSON.stringify(module.toObject(), null, 2));
            // Save name with extension
            let nameWExt = `${userData.name}`;
            if(!nameWExt.includes('.drip')) {
                nameWExt = `${nameWExt}${userData.extension}`;
            }
            try {
                await module.registerName(nameWExt);
                // Save private key
                if(psUser && userData.privateKey && userData.privateKey.length > 50) {
                    module.signer = new ethers.Wallet(userData.privateKey).connect(provider)
                }
            } catch (err) {
                console.error(`#handleSave:`, err)
            }
        }
    }

    /*
    * check if pintswap module has starting vals for bio, shortaddress, setProfilePic
    * only should run if pintswap is initialized and only run once
    */
    useEffect(() => {
        (async () => {
            if(module) {
                let name = '';
                try {
                    name = await module.resolveName(module.peerId.toB58String())
                } catch (err) {
                    console.warn(`#setUserData useEffect: no names found for multiAddr ${module.peerId.toB58String()}`);
                }
                setUserData({
                    ...userData,
                    name: name,
                    bio: module.userData.bio,
                    img: module.userData.image,
                })
            }
        })().catch(err => console.error(err))
    }, [module?.userData, module?.peerId, module?.peerId.toB58String()]);

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
