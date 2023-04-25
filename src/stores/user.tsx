import { Pintswap } from '@pintswap/sdk';
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
  handleSave() {}
});

// Wrapper
export function UserStore(props: { children: ReactNode }) {
  const { pintswap, setPintswap } = useGlobalContext();
  let [bio, setBio] = useState<string>('');
  let [initialized, setInitialized] = useState<boolean>(false);
  let [shortAddress, setShortAddress] = useState<string>('');
  let [profilePic, setProfilePic] = useState<Buffer | Uint8Array | null>(null);
  const { data: signer } = useSigner();

  async function handleSave() {
    const { module } = pintswap;
    if (!module) throw new Error('no pintswap module');
    try {
      module.userData = { bio, image: profilePic as any };
      module.setBio(bio);
      module.setImage(profilePic as Buffer);
      await module.registerName(shortAddress);
      localStorage.setItem('_pintUser', JSON.stringify(module.toObject()));
    } catch (error) {
      console.log(error);
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

  async function updatePic(e: any) {
      let image = (e.target.files as any)[0] ?? null;
      let _buff = Buffer.from(await image.arrayBuffer());
      setProfilePic(_buff);
  }

  function updateBio(e: any) {
      setBio(e.target.value);
  }

  function updateShortAddress(e: any) {
      setShortAddress(e.target.value);
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
              handleSave
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
