import { useEffect, useState } from 'react';
import {
    GAS_PRICE_MULTIPLIER,
    makeGetGasPrice,
    usePintswapContext,
    useUserContext,
} from '../stores';
import { Wallet, isAddress } from 'ethers6';
import { fetchNFT, savePintswap } from '../utils';

const DEFAULT_USE_NFT = { using: false, address: '', id: '' };

export const useAccountForm = () => {
    const { pintswap } = usePintswapContext();
    const { userData, setUserData } = useUserContext();

    const [isError, setIsError] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [hasEdited, setHasEdited] = useState<string[]>([]);

    const [useNft, setUseNft] = useState(DEFAULT_USE_NFT);
    const [imgFile, setImgFile] = useState('');
    const [shallowForm, setShallowForm] = useState({
        bio: userData.bio,
        name: userData.name,
        img: userData.img,
        privateKey: userData.privateKey,
    });

    const updateShallow = async (key: 'bio' | 'name' | 'img' | 'privateKey', value: any) => {
        let _value: any;
        if (key === 'img' && pintswap.module) {
            const image = (value.target.files as any)[0] ?? null;
            _value = Buffer.from(await image.arrayBuffer());
            setImgFile(value.target.files[0].name);
        } else {
            _value = value;
        }
        setHasEdited([...hasEdited, key]);
        setShallowForm({ ...shallowForm, [key]: _value });
    };

    const toggleUseNft = () => {
        if (!useNft.using) setUseNft({ ...useNft, using: true });
        else setUseNft({ ...useNft, using: false });
    };

    const handleSave = async (e: any) => {
        e.preventDefault();
        setIsLoading(true);
        const { module } = pintswap;
        const { img, name, privateKey, bio } = shallowForm;
        if (module && hasEdited.length) {
            try {
                // Name // TODO: broken
                // let nameWExt = name;
                // if (!nameWExt.includes('.drip')) nameWExt = `${nameWExt}${userData.extension}`;
                // const response = await module.registerName(nameWExt); // TODO: implement error handling when username taken
                // if(TESTING) console.log('register name response:', response);
                // Bio
                if (bio && hasEdited.includes('bio')) module.setBio(bio);
                // Img
                if (useNft.using) {
                    // if NFT
                    if (useNft.address && useNft.id && isAddress(useNft.address)) {
                        const { imageBlob } = await fetchNFT({
                            token: useNft.address,
                            tokenId: useNft.id,
                        });
                        if (imageBlob) {
                            const buff = Buffer.from(await (imageBlob as Blob).arrayBuffer());
                            module.setImage(buff);
                        }
                    }
                }
                if (img && hasEdited.includes('img')) {
                    // If normal file
                    module.setImage(img as Buffer);
                }
                // Private Key
                if (privateKey && hasEdited.includes('privateKey')) {
                    if (localStorage.getItem('_pintUser') && privateKey.length > 50) {
                        module.signer = new Wallet(privateKey).connect(module.signer.provider);
                        module.signer.provider.getGasPrice = makeGetGasPrice(
                            module.signer.provider,
                            GAS_PRICE_MULTIPLIER,
                        );
                    }
                }
                // Module
                savePintswap(module);
                setUserData({ ...userData, name, img, privateKey, bio });
            } catch (err) {
                setIsError(true);
                console.error('Error saving user data:', err);
            }
        }
        setHasEdited([]);
        setIsLoading(false);
        setIsEditing(false);
    };

    const handleCancel = (e: any) => {
        e.preventDefault();
        setShallowForm({
            bio: userData.bio,
            name: userData.name,
            img: userData.img,
            privateKey: userData.privateKey,
        });
        setHasEdited([]);
        setImgFile('');
        setIsEditing(false);
    };

    useEffect(() => {
        setShallowForm({
            bio: userData.bio,
            name: userData.name,
            img: userData.img,
            privateKey: userData.privateKey,
        });
    }, [userData.name, userData.bio, userData.privateKey, userData.img]);

    useEffect(() => {
        if (isError) {
            const timeout = setTimeout(() => setIsError(false), 3000);
            return () => clearTimeout(timeout);
        }
    }, [isError]);

    return {
        shallowForm,
        updateShallow,
        handleSave,
        handleCancel,
        useNft,
        setUseNft,
        isLoading,
        isEditing,
        setIsEditing,
        isError,
        imgFile,
        toggleUseNft,
    };
};
