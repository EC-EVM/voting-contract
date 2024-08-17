import {viem} from "hardhat";
import {expect} from "chai";
import { loadFixture } from "@nomicfoundation/hardhat-toolbox-viem/network-helpers";

describe("My Test", () => {
    it("Shoul give a hello eorld", async () => {
        const publicClient = await viem.getPublicClient();
        const lastBlock = await publicClient.getBlock();
        console.log(lastBlock);
        const [owner, otherAccount] = await viem.getWalletClients();
        const helloWorldContract = await viem.deployContract("HelloWorld");
        const helloWorldText = await helloWorldContract.read.helloWorld();
        expect(helloWorldText).to.equal("Hello World");

    });

    it("Should set owner to deployer account", async function () {
        const { helloWorldContract, owner } = await loadFixture(
          deployContractFixture
        );
        // https://hardhat.org/hardhat-runner/plugins/nomicfoundation-hardhat-viem#contracts
        const contractOwner = await helloWorldContract.read.owner();
        // https://www.chaijs.com/api/bdd/#method_equal
        expect(contractOwner.toLowerCase()).to.equal(owner.account.address);
      });
    
});