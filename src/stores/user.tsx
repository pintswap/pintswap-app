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
import { resolveName } from "../hooks/trade";
import { TESTING } from '../utils/common';
import { ethers } from 'ethers6';

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
    updatePrivateKey: (e: any) => void;
    privateKey: string;
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
    updatePrivateKey(e) {},
    privateKey: ''
});

// Wrapper
export function UserStore(props: { children: ReactNode }) {
    const { pintswap, setPintswap } = useGlobalContext();
    const { data: signer } = useSigner();
    let [bio, setBio] = useState<string>('');
    let [initialized, setInitialized] = useState<boolean>(false);
    let [shortAddress, setShortAddress] = useState<string>('');
    let [profilePic, setProfilePic] = useState<Buffer | Uint8Array | null>(null);
    const [privateKey, setPrivateKey] = useState('');

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
                if(TESTING) console.log("SHORTNAME", shortName);
                setShortAddress(await pintswap.module.resolveName((pintswap.module as any).peerId.toB58String()));
                setInitialized(true);
            }
        })().catch((err) => console.error(err));
    }, [pintswap.module, initialized]);

    async function updatePic(e: any) {
        if(pintswap.module) {
            let image = (e.target.files as any)[0] ?? null;
            let _buff = Buffer.from(await image.arrayBuffer());
            pintswap.module.setImage(_buff);
            setProfilePic(_buff);
        }
    }

    function updateBio(e: any) {
        if(pintswap.module) {
            pintswap.module.setBio(e.target.value);
            setBio(e.target.value);
        }
    }

    // TODO
    function updatePrivateKey(e: any) {
        console.log(e.target.value)
        if(pintswap.module) {
            setPrivateKey(e.target.value)
        } else {
            setPrivateKey(e.target.value)
        }
    }
  /*
  * check if pintswap module is initialized and/or has starting vals for bio, shortaddress, setProfilePic
  * only should run if pintswap is initialized and only run once
  */
  useEffect(() => {
    const { module } = pintswap;
    (async () => {
      if (module && !initialized) {
        const localUser = localStorage.getItem('_pintUser')
          let { bio: _bio, image: _image } = (module as any).userData ?? {
              bio: '',
              image: new Uint8Array(0),
          };
          if (_bio !== '') setBio(_bio);
          if (_image) setProfilePic(_image);
          if (localUser) {
            const psUser = await Pintswap.fromObject(JSON.parse(localUser), signer);
            setPintswap({ ...pintswap, module: psUser });
          }
          setInitialized(true);
      }
    })().catch((err) => console.error(err));
  }, [pintswap.module, initialized])

    function updateShortAddress(e: any) {
        setShortAddress(e.target.value);
    }
    function handleSave() {
        const { module } = pintswap;
        if (module) {
          localStorage.setItem('_pintUser', JSON.stringify(module.toObject(), null, 2));
          (async () => {
            if (module) {
                await module.registerName(shortAddress);
                // TODO: fix saving private key
                const psUser = localStorage.getItem('_pintUser');
                if(psUser) await Pintswap.fromObject(JSON.parse(psUser), new ethers.Wallet(privateKey))
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
                updatePrivateKey,
                privateKey
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
