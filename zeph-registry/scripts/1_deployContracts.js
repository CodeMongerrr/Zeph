import React, { useState, useEffect } from "react";
import { ethers } from "ethers";

const stakingPoolAddress = "0xF91FC2d1E84ef98Abd66B459aB4B3C988F60F5b4";

const stakingPoolAbi = [
  "function stakeJASMY() external payable",
  "function claim() external",
  "function unstakeJASMY(uint256 amount) external",
  "function totalSupply() external view returns (uint256)",
  "function balanceOf(address account) external view returns (uint256)",
  "function earned(address account) external view returns (uint256)",
  "function rewardRate() external view returns (uint256)",
  "function MINIMUM_CLAIMABLE_TIME() external view returns (uint256)"
];

export default function StakingPage() {
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [stakingPool, setStakingPool] = useState(null);
  const [account, setAccount] = useState(null);

  const [stakeAmount, setStakeAmount] = useState("");
  const [tvl, setTvl] = useState("0");
  const [userStake, setUserStake] = useState("0");
  const [claimableRewards, setClaimableRewards] = useState("0");
  const [rewardRatePerWeek, setRewardRatePerWeek] = useState("0");
  const [minimumClaimableTime, setMinimumClaimableTime] = useState("0");

  useEffect(() => {
    async function init() {
      const rpcUrl = process.env.RPC_URL;
      const privateKey = process.env.PRIVATE_KEY;

      if (!rpcUrl || !privateKey) {
        console.error("RPC_URL or PRIVATE_KEY environment variable not set");
        return;
      }

      const _provider = new ethers.JsonRpcProvider(rpcUrl);
      const _signer = new ethers.Wallet(privateKey, _provider);
      const _stakingPool = new ethers.Contract(stakingPoolAddress, stakingPoolAbi, _signer);
      const _account = await _signer.getAddress();

      setProvider(_provider);
      setSigner(_signer);
      setStakingPool(_stakingPool);
      setAccount(_account);

      // Fetch and set values
      try {
        const [totalSupply, balance, earned, rewardRate, minClaimTime] = await Promise.all([
          _stakingPool.totalSupply(),
          _stakingPool.balanceOf(_account),
          _stakingPool.earned(_account),
          _stakingPool.rewardRate(),
          _stakingPool.MINIMUM_CLAIMABLE_TIME()
        ]);

        setTvl(ethers.formatEther(totalSupply));
        setUserStake(ethers.formatEther(balance));
        setClaimableRewards(ethers.formatEther(earned));
        // rewardRate per week = rewardRate * 7 * 24 * 60 * 60
        const weeklyRewardRate = rewardRate * 7 * 24 * 60 * 60;
        setRewardRatePerWeek(ethers.formatEther(weeklyRewardRate));
        setMinimumClaimableTime(minClaimTime.toString());
      } catch (err) {
        console.error("Error fetching staking data:", err);
      }
    }
    init();
  }, []);

  async function handleStake() {
    if (!stakingPool || !stakeAmount) return;

    try {
      const value = ethers.parseEther(stakeAmount);
      const tx = await stakingPool.stakeJASMY({ value });
      await tx.wait();
      alert("Stake successful!");
      // Refresh user data
      const balance = await stakingPool.balanceOf(account);
      const earned = await stakingPool.earned(account);
      const totalSupply = await stakingPool.totalSupply();
      setUserStake(ethers.formatEther(balance));
      setClaimableRewards(ethers.formatEther(earned));
      setTvl(ethers.formatEther(totalSupply));
      setStakeAmount("");
    } catch (err) {
      console.error("Stake failed:", err);
      alert("Stake failed: " + err.message);
    }
  }

  async function handleClaim() {
    if (!stakingPool) return;

    try {
      const tx = await stakingPool.claim();
      await tx.wait();
      alert("Claim successful!");
      // Refresh claimable rewards and user stake
      const earned = await stakingPool.earned(account);
      const balance = await stakingPool.balanceOf(account);
      setClaimableRewards(ethers.formatEther(earned));
      setUserStake(ethers.formatEther(balance));
    } catch (err) {
      console.error("Claim failed:", err);
      alert("Claim failed: " + err.message);
    }
  }

  async function handleUnstake() {
    if (!stakingPool) return;

    const unstakeAmount = prompt("Enter amount to unstake:");
    if (!unstakeAmount) return;

    try {
      const amount = ethers.parseEther(unstakeAmount);
      const tx = await stakingPool.unstakeJASMY(amount);
      await tx.wait();
      alert("Unstake successful!");
      // Refresh user data
      const balance = await stakingPool.balanceOf(account);
      const earned = await stakingPool.earned(account);
      const totalSupply = await stakingPool.totalSupply();
      setUserStake(ethers.formatEther(balance));
      setClaimableRewards(ethers.formatEther(earned));
      setTvl(ethers.formatEther(totalSupply));
    } catch (err) {
      console.error("Unstake failed:", err);
      alert("Unstake failed: " + err.message);
    }
  }

  return (
    <div>
      <h1>Staking Pool</h1>
      <div>
        <p><strong>TVL:</strong> {tvl} JASMY</p>
        <p><strong>Your Stake:</strong> {userStake} JASMY</p>
        <p><strong>Claimable Rewards:</strong> {claimableRewards} JASMY</p>
        <p><strong>Reward Rate per Week:</strong> {rewardRatePerWeek} JASMY</p>
        <p><strong>Minimum Claimable Time:</strong> {minimumClaimableTime} seconds</p>
      </div>

      <div>
        <input
          type="text"
          placeholder="Amount to stake"
          value={stakeAmount}
          onChange={(e) => setStakeAmount(e.target.value)}
        />
        <button onClick={handleStake}>Stake</button>
      </div>
      <div>
        <button onClick={handleClaim}>Claim Rewards</button>
        <button onClick={handleUnstake}>Unstake</button>
      </div>
    </div>
  );
}