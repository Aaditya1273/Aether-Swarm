// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title GrantDistribution
 * @dev Smart contract for Aether Swarm automated grant distribution
 * Integrates with Cortensor's $COR token for staking and payments
 */
contract GrantDistribution is ReentrancyGuard, Ownable {
    IERC20 public immutable corToken;
    
    struct Grant {
        address recipient;
        uint256 amount;
        uint256 stakeRequired;
        uint256 stakeDeposited;
        uint256 createdAt;
        uint256 expiresAt;
        bool executed;
        bool cancelled;
        string proposalHash; // IPFS hash of proposal details
        string proofOfInference; // Cortensor PoI hash
    }
    
    struct Milestone {
        string description;
        uint256 amount;
        bool completed;
        string evidenceHash; // IPFS hash of completion evidence
    }
    
    mapping(uint256 => Grant) public grants;
    mapping(uint256 => Milestone[]) public grantMilestones;
    mapping(address => uint256) public stakerBalances;
    
    uint256 public nextGrantId = 1;
    uint256 public constant STAKE_PERCENTAGE = 10; // 10% of grant amount must be staked
    uint256 public constant GRANT_DURATION = 90 days;
    
    event GrantCreated(
        uint256 indexed grantId,
        address indexed recipient,
        uint256 amount,
        uint256 stakeRequired,
        string proposalHash
    );
    
    event GrantExecuted(
        uint256 indexed grantId,
        address indexed recipient,
        uint256 amount
    );
    
    event MilestoneCompleted(
        uint256 indexed grantId,
        uint256 milestoneIndex,
        uint256 amount
    );
    
    event StakeDeposited(
        uint256 indexed grantId,
        address indexed staker,
        uint256 amount
    );
    
    event StakeWithdrawn(
        address indexed staker,
        uint256 amount
    );
    
    constructor(address _corToken) {
        corToken = IERC20(_corToken);
    }
    
    /**
     * @dev Create a new grant proposal (called by Aether Swarm agents)
     */
    function createGrant(
        address _recipient,
        uint256 _amount,
        string calldata _proposalHash,
        string calldata _proofOfInference,
        string[] calldata _milestoneDescriptions,
        uint256[] calldata _milestoneAmounts
    ) external returns (uint256) {
        require(_recipient != address(0), "Invalid recipient");
        require(_amount > 0, "Amount must be positive");
        require(_milestoneDescriptions.length == _milestoneAmounts.length, "Milestone arrays mismatch");
        
        uint256 totalMilestoneAmount = 0;
        for (uint256 i = 0; i < _milestoneAmounts.length; i++) {
            totalMilestoneAmount += _milestoneAmounts[i];
        }
        require(totalMilestoneAmount == _amount, "Milestone amounts must sum to total");
        
        uint256 grantId = nextGrantId++;
        uint256 stakeRequired = (_amount * STAKE_PERCENTAGE) / 100;
        
        grants[grantId] = Grant({
            recipient: _recipient,
            amount: _amount,
            stakeRequired: stakeRequired,
            stakeDeposited: 0,
            createdAt: block.timestamp,
            expiresAt: block.timestamp + GRANT_DURATION,
            executed: false,
            cancelled: false,
            proposalHash: _proposalHash,
            proofOfInference: _proofOfInference
        });
        
        // Create milestones
        for (uint256 i = 0; i < _milestoneDescriptions.length; i++) {
            grantMilestones[grantId].push(Milestone({
                description: _milestoneDescriptions[i],
                amount: _milestoneAmounts[i],
                completed: false,
                evidenceHash: ""
            }));
        }
        
        emit GrantCreated(grantId, _recipient, _amount, stakeRequired, _proposalHash);
        return grantId;
    }
    
    /**
     * @dev Stake $COR tokens to support a grant
     */
    function stakeForGrant(uint256 _grantId, uint256 _amount) external nonReentrant {
        Grant storage grant = grants[_grantId];
        require(grant.amount > 0, "Grant does not exist");
        require(!grant.executed && !grant.cancelled, "Grant not active");
        require(block.timestamp < grant.expiresAt, "Grant expired");
        require(grant.stakeDeposited < grant.stakeRequired, "Grant fully staked");
        
        uint256 stakeNeeded = grant.stakeRequired - grant.stakeDeposited;
        uint256 stakeAmount = _amount > stakeNeeded ? stakeNeeded : _amount;
        
        require(corToken.transferFrom(msg.sender, address(this), stakeAmount), "Stake transfer failed");
        
        grant.stakeDeposited += stakeAmount;
        stakerBalances[msg.sender] += stakeAmount;
        
        emit StakeDeposited(_grantId, msg.sender, stakeAmount);
        
        // Auto-execute if fully staked
        if (grant.stakeDeposited >= grant.stakeRequired) {
            _executeGrant(_grantId);
        }
    }
    
    /**
     * @dev Complete a milestone (called by grant recipient with evidence)
     */
    function completeMilestone(
        uint256 _grantId,
        uint256 _milestoneIndex,
        string calldata _evidenceHash
    ) external {
        Grant storage grant = grants[_grantId];
        require(msg.sender == grant.recipient, "Only recipient can complete milestones");
        require(grant.executed && !grant.cancelled, "Grant not active");
        require(_milestoneIndex < grantMilestones[_grantId].length, "Invalid milestone");
        
        Milestone storage milestone = grantMilestones[_grantId][_milestoneIndex];
        require(!milestone.completed, "Milestone already completed");
        
        milestone.completed = true;
        milestone.evidenceHash = _evidenceHash;
        
        // Release milestone payment
        require(corToken.transfer(grant.recipient, milestone.amount), "Milestone payment failed");
        
        emit MilestoneCompleted(_grantId, _milestoneIndex, milestone.amount);
    }
    
    /**
     * @dev Internal function to execute a grant
     */
    function _executeGrant(uint256 _grantId) internal {
        Grant storage grant = grants[_grantId];
        grant.executed = true;
        
        emit GrantExecuted(_grantId, grant.recipient, grant.amount);
    }
    
    /**
     * @dev Cancel a grant (only owner/DAO)
     */
    function cancelGrant(uint256 _grantId) external onlyOwner {
        Grant storage grant = grants[_grantId];
        require(grant.amount > 0, "Grant does not exist");
        require(!grant.executed && !grant.cancelled, "Grant not active");
        
        grant.cancelled = true;
        
        // Refund stakers
        if (grant.stakeDeposited > 0) {
            // In a full implementation, track individual staker contributions
            // For now, return to contract owner for redistribution
            require(corToken.transfer(owner(), grant.stakeDeposited), "Refund failed");
        }
    }
    
    /**
     * @dev Withdraw staked tokens (after grant completion or cancellation)
     */
    function withdrawStake(uint256 _amount) external nonReentrant {
        require(stakerBalances[msg.sender] >= _amount, "Insufficient stake balance");
        
        stakerBalances[msg.sender] -= _amount;
        require(corToken.transfer(msg.sender, _amount), "Withdrawal failed");
        
        emit StakeWithdrawn(msg.sender, _amount);
    }
    
    /**
     * @dev Get grant details
     */
    function getGrant(uint256 _grantId) external view returns (
        address recipient,
        uint256 amount,
        uint256 stakeRequired,
        uint256 stakeDeposited,
        uint256 createdAt,
        uint256 expiresAt,
        bool executed,
        bool cancelled,
        string memory proposalHash,
        string memory proofOfInference
    ) {
        Grant storage grant = grants[_grantId];
        return (
            grant.recipient,
            grant.amount,
            grant.stakeRequired,
            grant.stakeDeposited,
            grant.createdAt,
            grant.expiresAt,
            grant.executed,
            grant.cancelled,
            grant.proposalHash,
            grant.proofOfInference
        );
    }
    
    /**
     * @dev Get milestone details
     */
    function getMilestone(uint256 _grantId, uint256 _milestoneIndex) external view returns (
        string memory description,
        uint256 amount,
        bool completed,
        string memory evidenceHash
    ) {
        require(_milestoneIndex < grantMilestones[_grantId].length, "Invalid milestone");
        Milestone storage milestone = grantMilestones[_grantId][_milestoneIndex];
        return (
            milestone.description,
            milestone.amount,
            milestone.completed,
            milestone.evidenceHash
        );
    }
    
    /**
     * @dev Get number of milestones for a grant
     */
    function getMilestoneCount(uint256 _grantId) external view returns (uint256) {
        return grantMilestones[_grantId].length;
    }
    
    /**
     * @dev Emergency function to recover tokens (only owner)
     */
    function emergencyWithdraw(address _token, uint256 _amount) external onlyOwner {
        IERC20(_token).transfer(owner(), _amount);
    }
}