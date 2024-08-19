# Weekend Project 2

### Project instructions

This is a group activity for at least 3 students:

- Develop and run scripts for “Ballot.sol” within your group to give voting rights, casting votes, delegating votes and querying results
- Write a report with each function execution and the transaction hash, if successful, or the revert reason, if failed
- Submit your weekend project by filling the form provided in Discord
- Submit your code in a github repository in the form

## Group 2

| Unique id | Discord username    |
| --------- | ------------------- |
| RAAzLF    | @GRAVER 👾                |
| 2SyBp0    | @wackozacco        |
| 10exgX    | @δαλλασκατ    |
| r5YSqY    | @imchrismayfield          |
| HhHAQw    | @swooz                |
| Pok9XD    | @Timster            |
| T5zGzt    | @Carl Youngblood            |

## List of interactions

1. 💫 **[Pass]:** Deployed `Ballot.sol` smart contract on Sepolia testnet
    1. `npx ts-node --files scripts/DeployWithViem.ts`
    2. [TxHash (0x80...bF9B)](https://sepolia.etherscan.io/tx/0x0ac04dc1fbfec626442d0af68df1b824f0b796506d47eb473b0fbe0c23ffa94c)
    3. [Script ↗](./scripts/DeployWithViem.ts)
    


    ---
    
2. 💫 **[Pass]:** Call `vote` function
    1. `npx ts-node --files scripts/CastVote.ts 0x329590c91563584091f6f4d8909728eb1050efec 2`
    2. [TxHash (0x81...91b0)](https://sepolia.etherscan.io/tx/0x5b98f2f64a132b7b4cd79cf82c56bbf86c4eefdb0e8bca9fee1bc6603c518a00)
    3. [Script ↗](./scripts/CastVote.ts)
    ![Screenshot_2024-08-18_at_4 06 51_AM](https://github.com/user-attachments/assets/ba01e143-a838-481d-9621-191be39c01b9)


    ---
    
3. 💫 **[Pass]:** Call `giveRightToVote` function from the chairman address
    1. `npx ts-node --files scripts/GiveRightToVote.ts 0x329590C91563584091f6f4D8909728EB1050EFEC 	0x99940BeaCB5FC1d87b7Df18736559c66A0f98b23`
    2. [TxHash (0x80715279...496BEbF9B)](https://sepolia.etherscan.io/tx/0x66f6be3d97fbd90075c3f8c4471290e1759b351180c975563fa714080f24ba5c)
    3. [Script ↗](./scripts/GiveRightToVote.ts)
    
    
> 🚨 Attempting to call this function with an address that isn't part of the voters will cause it to revert with an unspecified error message.

---

    
4. 💫 **[Pass]:** Call `delegateVote` function
    1. `npx ts-node --files scripts/DelegateVote.ts 0x329590C91563584091f6f4D8909728EB1050EFEC 	0x99940BeaCB5FC1d87b7Df18736559c66A0f98b23`
    2. [TxHash (0x80715279...496BEbF9B)](https://sepolia.etherscan.io/tx/0x447aa443aad8f2e8687f57744f4a96e7d971e5258e075d61f55be5faf3a3b5d6)
    3. [Script ↗](./scripts/DelegateVote.ts)
    
    
    ---
    
5. 💫 **[Pass]:** Call `winnerName` view function
    1. `npx ts-node --files scripts/PrintResults.ts 0x329590c91563584091f6f4d8909728eb1050efec`
    2. [Script ↗](./scripts/PrintResults.ts)
  
    <img width="711" alt="Screenshot 2024-08-19 at 12 21 20 AM" src="https://github.com/user-attachments/assets/a8c45b99-241d-44cc-b071-6d6afb8c6348">
   
    ---

6. 💫 **[Pass]:** Call `vote` function
    1. `npx ts-node --files scripts/CastVote.ts 0x329590c91563584091f6f4d8909728eb1050efec 3`
    2. [TxHash (0x55631F25...C58241bE4)](https://sepolia.etherscan.io/tx/0xcfa4e41f10117d3dfc2edc5c95a838b8b762723d8651e0a69b5af4eb74b51c92)
    3. [Script ↗](./scripts/CastVote.ts)
       
       ![image (5)](https://github.com/user-attachments/assets/abe1a043-8eb6-4df8-b22b-e8fa53353823)

    ---

7. 💫 **[Pass]:** Call `vote` function
    1. `npx ts-node --files scripts/CastVote.ts 0x329590c91563584091f6f4d8909728eb1050efec 3`
    2. [TxHash (0x822D80eC...51E720EAa)](https://sepolia.etherscan.io/tx/0x6ca8316ad72a9ad8b614692fb87c9ccf7634427dffe40631d1b78e0ad4c9a17e)
    3. [Script ↗](./scripts/CastVote.ts)
  
       <img width="456" alt="Screenshot 2024-08-18 at 11 50 27 PM" src="https://github.com/user-attachments/assets/fb70a3a7-02ff-4004-807c-4b4cf42c38d1">


