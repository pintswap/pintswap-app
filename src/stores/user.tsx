import {
    createContext,
    Dispatch,
    ReactNode,
    SetStateAction,
    useContext,
    useEffect,
    useState,
} from 'react';
import { useSigner } from 'wagmi';
import { useGlobalContext } from './global';
import { Pintswap } from "@pintswap/sdk";
import { ethers } from "ethers6";
import { resolveName } from "../hooks/trade";

// Types
export type IUserStoreProps = {
    bio: string;
    setBio: Dispatch<SetStateAction<string>>;
    shortAddress: string;
    setShortAddress: Dispatch<SetStateAction<string>>;
    profilePic: Buffer | Uint8Array | null;
    setProfilePic: Dispatch<SetStateAction<Buffer | Uint8Array | null>>;
    updateBio: (e: any) => void;
    updateShortAddress: (e: any) => void;
    updatePic: (e: any) => void;
    handleSave: () => void;
};

// Context
const UserContext = createContext<IUserStoreProps>({
    bio: '',
    setBio() {},
    shortAddress: '',
    setShortAddress() {},
    profilePic: new Uint8Array(0),
    setProfilePic() {},
    updateBio(e) {},
    updateShortAddress(e) {},
    updatePic(e) {},
    handleSave() {},
});

// Wrapper
export function UserStore(props: { children: ReactNode }) {
    const { pintswap, setPintswap } = useGlobalContext();
    const { data: signer } = useSigner();
    let [bio, setBio] = useState<string>('');
    let [initialized, setInitialized] = useState<boolean>(false);
    let [shortAddress, setShortAddress] = useState<string>('');
    let [profilePic, setProfilePic] = useState<Buffer | Uint8Array | null>(null);

    /*
     * check if pintswap module is initialized and/or has starting vals for bio, shortaddress, setProfilePic
     * only should run if pintswap is initialized and only run once
     */
    useEffect(() => {
        (async () => {
            if (!initialized && pintswap.module) {
/*
                const pintswapSigner = signer || ethers.Wallet.createRandom().connect(new ethers.InfuraProvider('mainnet'));
                const pintswapLoaded = localStorage.getItem('_pintUser') ? await Pintswap.fromObject(
                    JSON.parse(localStorage.getItem('_pintUser') as string),
                    pintswapSigner as any
                ) : await Pintswap.initialize({ signer: (pintswapSigner as any), awaitReceipts: false });
                setPintswap({ ...pintswap, module: pintswapLoaded, loading: false });
*/
                setBio(pintswap.module.userData.bio);
                setProfilePic(pintswap.module.userData.image);

                const shortName = await resolveName((pintswap.module as any), (pintswap.module as any).peerId.toB58String());
                console.log("SHORTNAME", shortName);
                setShortAddress(await pintswap.module.resolveName((pintswap.module as any).peerId.toB58String()));
                setInitialized(true);
            }
        })().catch((err) => console.error(err));
    }, [pintswap.module, initialized]);

    async function updatePic(e: any) {
        let image = (e.target.files as any)[0] ?? null;
        let _buff = Buffer.from(await image.arrayBuffer());
        (pintswap as any).setImage(_buff);
        setProfilePic(_buff);
    }

    function updateBio(e: any) {
        (pintswap as any).setBio(e.target.value);
        setBio(e.target.value);
    }

    function updateShortAddress(e: any) {
        setShortAddress(e.target.value);
    }
    function handleSave() {
        if (pintswap.module) {
          localStorage.setItem('_pintUser', JSON.stringify(pintswap.module.toObject(), null, 2));
          (async () => {
            if (pintswap.module) {
              console.log('REGISTERNAME', await pintswap.module.registerName(shortAddress));
            }
          })().catch((err) => console.error(err));
        }
    }

    return (
        <UserContext.Provider
            value={{
                bio,
                setBio,
                shortAddress,
                setShortAddress,
                profilePic,
                setProfilePic,
                updateBio,
                updateShortAddress,
                updatePic,
                handleSave,
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
