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
import { EMPTY_USER_DATA, TESTING } from '../utils/common';
import { ethers } from 'ethers6';
import PeerId, { JSONPeerId } from 'peer-id';
import { mergeUserData } from "../utils/pintswap";

let tick = 0;

// Types
export type IUserDataProps = {
    img: string | Buffer;
    bio: string;
    name: string;
    offers?: any[];
    privateKey?: string;
    extension?: string;
    active: boolean;
    peer?: JSONPeerId;
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
    const [ userData, setUserData ] = useState<IUserDataProps>(EMPTY_USER_DATA);
    const [initialized, setInitialized] = useState<boolean>(false);
    const [ loadedSigner, setLoadedSigner ] = useState<any>(null);
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
            await module.registerName(nameWExt);
            // Save private key
            if(psUser && userData.privateKey && userData.privateKey.length > 50) {
                module.signer = new ethers.Wallet(userData.privateKey).connect(module.signer.provider)
                setLoadedSigner(module.signer);
            }
        }
    }

    /*
    * load psUser from localStorage if available
    */
    useEffect(() => {
        (async () => {
        if (module && !initialized) {
            if (psUser) {
                const localUser = await Pintswap.fromObject(JSON.parse(psUser), signer);
                setPintswap({ ...pintswap, module: localUser });
            }
            setInitialized(true);
        }
        })().catch((err) => console.error(err));
    }, [module, initialized])

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
                    console.error("useEffect:", err);
                }
                setUserData({
                    ...userData,
                    name: name,
                    bio: module.userData.bio,
                    img: module.userData.image,
                })
            }
        })().catch(err => console.error(err))
    }, [module?.userData, loadedSigner, module?.peerId]);

    console.log("module user data", module?.userData)

    /* 
    * subscribe to wallet address changes to maintain the same multiAddr
    */
    useEffect(() => {
        if (tick < 3) {
          tick++;
          return;
        }
        if (!loadedSigner) return;
        (async () => {
            const ps = Object.assign({}, pintswap, { module: mergeUserData(await Pintswap.fromPassword({ signer: loadedSigner, password: await signer?.getAddress() } as any), pintswap.module) });
            if (pintswap.module) {
              await pintswap.module.pubsub.stop();
              await pintswap.module.stop();
            }
            await ps.module.startNode();
            setPintswap(ps);
        })().catch((err) => console.error(err))
    }, [loadedSigner])

    useEffect(() => {
      setLoadedSigner(signer);
    }, [ signer ]);

    /* 
    * get peer id on mount
    */
    useEffect(() => {
        const getPeer = async () => {
            const key = 'peerId';
            const localPeerId = localStorage.getItem(key);
            if (localPeerId && localPeerId != null && !TESTING) {
                setUserData({ ...userData, peer: JSON.parse(localPeerId) });
            } else {
                const id = await PeerId.create();
                setUserData({ ...userData, peer: id.toJSON() });
                localStorage.setItem(key, JSON.stringify(id.toJSON()));
            }
        };
        getPeer();
    }, []);

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
