// CONTRACT ADDRESSES
export const CONTRACTS = {
    mainnet: {
        WOCK: '0xcB72ed407Cdb97a7161a2b567b5f50B55585Ee6b',
        WOCKRedeem: '0x8a20b541aacc05f824f67532de995e3687431499',
        TRIS: '0x0055485fCa054D165fc0C7D836459722436544c1',
        TRISRedeem: '0xfef8205d4c472fe0442fc1026acc34e6d88e438c',
        PINT: '0x58fB30A61C218A3607e9273D52995a49fF2697Ee',
        OPPS: '0xd665F1153599e8F799b2514069dF4481d3bcb043',
        sipPINT: '0x1e8352e5d5e9ef7a68432a39118082653e8a9758',
    },
};

// ABIS
export const MIN_ABIS = {
    NFT: [
        {
            constant: true,
            inputs: [{ name: '_owner', type: 'address' }],
            name: 'balanceOf',
            outputs: [{ name: 'balance', type: 'uint256' }],
            type: 'function',
        },
        {
            constant: true,
            inputs: [{ name: 'tokenId', type: 'uint256' }],
            name: 'ownerOf',
            outputs: [{ name: '', type: 'address' }],
            type: 'function',
        },
        {
            constant: true,
            inputs: [],
            name: 'totalSupply',
            outputs: [
                {
                    name: '',
                    type: 'uint256',
                },
            ],
            payable: false,
            stateMutability: 'view',
            type: 'function',
        },
        {
            constant: true,
            inputs: [{ name: '', type: 'uint256' }],
            name: 'tokenURI',
            outputs: [{ name: '', type: 'string' }],
            type: 'function',
        },
    ],
    ERC20: [
        {
            constant: true,
            inputs: [
                {
                    name: '_owner',
                    type: 'address',
                },
            ],
            name: 'balanceOf',
            outputs: [
                {
                    name: 'balance',
                    type: 'uint256',
                },
            ],
            payable: false,
            stateMutability: 'view',
            type: 'function',
        },
        {
            constant: true,
            inputs: [],
            name: 'decimals',
            outputs: [
                {
                    name: '',
                    type: 'uint8',
                },
            ],
            payable: false,
            stateMutability: 'view',
            type: 'function',
        },
        {
            constant: true,
            inputs: [],
            name: 'totalSupply',
            outputs: [
                {
                    name: '',
                    type: 'uint256',
                },
            ],
            payable: false,
            stateMutability: 'view',
            type: 'function',
        },
    ],
    ERC4626: [
        'function asset() public view returns (address)',
        'function totalAssets() public view returns (uint256)',
        'function convertToShares(uint256 assets) public view returns (uint256 shares)',
        'function convertToAssets(uint256 shares) public view returns (uint256 assets)',
        'function maxDeposit(address receiver) public view returns (uint256)',
        'function previewDeposit(uint256 assets) public view returns (uint256)',
        'function deposit(uint256 assets, address receiver) public returns (uint256 shares)',
        'function maxMint(address receiver) public view returns (uint256)',
        'function previewMint(uint256 shares) public view returns (uint256)',
        'function mint(uint256 shares, address receiver) public returns (uint256 assets)',
        'function maxWithdraw(address owner) public view returns (uint256)',
        'function previewWithdraw(uint256 assets) public view returns (uint256)',
        'function withdraw(uint256 assets, address receiver, address owner) public returns (uint256 shares)',
        'function maxRedeem(address owner) public view returns (uint256)',
        'function previewRedeem(uint256 shares) public view returns (uint256)',
        'function redeem(uint256 shares, address receiver, address owner) public returns (uint256 assets)',
        'function totalSupply() public view returns (uint256)',
        'function balanceOf(address owner) public view returns (uint256)',
        'function approve(address, uint256) returns (bool)',
        'function allowance(address, address) view returns (uint256)',
    ],
};
