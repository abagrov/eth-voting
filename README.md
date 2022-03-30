# Referendum smart contract

This project demonstrates referendum smart contract created with solidity. Users can create referendums, vote for any address, providing 0.01 eth as vote price. After 3 days referendum can be closed and winner will rewarded with all eth provided in this referendum excluding fee 10%.

### Install
```
npm i
```

### Test Coverage
```
npx hardhat coverage
```

### Deploy to test network
1. Get Alchemy URL (open your app dashboard -> VIEW KEY -> HTTP), specify it as  ALCHEMY_URL in *.env* file.
2. Specify private key from any address in .env file - this address will be owner of contract.
```
CONTRACT_PRIVATE = "private"
```
3. Execute 
```
npx hardhat run scripts/deploy.ts --network rinkeby
```
### Interacting with deployed contract
1. Specify address in .env file where contract deployed (from previous step), get Alchemy API key (open your app dashboard -> VIEW KEY -> API KEY), specify it as  ALCHEMY_API_KEY in *.env* file, and add some wallet addresses and private keys to make votes.
```
CONTRACT_ADDRESS = "0xAddress"

ALCHEMY_API_KEY = "key"

WALLET_1_ADDRESS = "0xAddress"
WALLET_1_PRIVATE = "private"

WALLET_2_ADDRESS = "0xAddress"
WALLET_2_PRIVATE = "private"
```
Via hardhat tasks you can create and close referendums, make votes.
2. Add referendum:
```
npx hardhat add --name MyFirstReferendum
```
3. Vote in referendum:
```
npx hardhat vote --id 1 --voter WALLET_2_PRIVATE --candidate WALLET_1_ADDRESS

OPTIONS:

  --candidate   Address of candidate - address as string or key from .env with address value.
  --id          Id of referendum to vote.
  --voter       Who is voting - key from .env with private key value.
```
4. End referendum
```
npx hardhat end --id 1
```
5. Withdraw funds from contract
```
npx hardhat withdraw --address WALLET_1_ADDRESS --amount 0

OPTIONS:

  --address     Address where funds will be transfered. Provide address as string or key from .env with address value.
  --amount      Amount of funds to be withdrawed. Provide 0 for all avaliable funds.
  ```