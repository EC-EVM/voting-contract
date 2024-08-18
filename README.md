# Voting Contract 
The following contract is quite complex, but showcases a lot of Solidity’s features. It implements a voting contract. Of course, the main problems of electronic voting is how to assign voting rights to the correct persons and how to prevent manipulation. We will not solve all problems here, but at least we will show how delegated voting can be done so that vote counting is automatic and completely transparent at the same time.

The idea is to create one contract per ballot, providing a short name for each option. Then the creator of the contract who serves as chairperson will give the right to vote to each address individually.

The persons behind the addresses can then choose to either vote themselves or to delegate their vote to a person they trust.

At the end of the voting time, winningProposal() will return the proposal with the largest number of votes.

## Getting Started

### Running a script

The easiest way is to run the CheckVoter.ts script below to check if the address has a voting right/weight, the address has already voted, etc:
```shell 
npx ts-node --files ./scripts/CheckVoter.ts [contractAddress] [address1] 
```
Sample contract: https://sepolia.etherscan.io/address/0x329590c91563584091f6f4d8909728eb1050efec< br/>

<img width="667" alt="Screenshot 2024-08-17 at 5 40 34 PM" src="https://github.com/user-attachments/assets/0a027dc5-6606-4f4c-a87b-605faf46e1eb">< br/>
You can also run the PrintResults.ts script below to check the result of votes:
```shell 
npx ts-node --files ./scripts/PrintResults.ts 0x329590c91563584091f6f4d8909728eb1050efec 3 
```


You can also run the DeployWithViem.ts script below to deploy a new contract:
```shell 
npx ts-node --files ./scripts/DeployWithViem.ts 
npx ts-node --files ./scripts/DeployWithViem.ts ramen pizza burger 
```


### Installation

-copy all files/folders from project2 except artifacts, cache, node_modules<br /> 
-create new project3 and paste here<br /> 
-make sure you have the .env file (.gitignore it)<br /> 
create a scripts folder under the root project4 folder & then create a DeployWithHardhat.ts file under scripts directory<br /> 

### Prerequisites 
```shell
nvm use --lts   
node -v
v20.14.0
```

## Hardhat 
```shell
npm init
npm install --save-dev hardhat
npx hardhat init
```
-> Create a typescript project

```shell
npx hardhat compile
npx hardhat test
npx hardhat clean


cretae a .mocharc.json with contents:
{
  "require": "hardhat/register",
  "timeout": 40000,
  "_": ["test*/**/*.ts"]
}


rm ./contracts/*
rm ./ignition/*
rm ./test/*
npx hardhat clean
npm viem
npm install --save-dev @nomicfoundation/hardhat-chai-matchers
```

