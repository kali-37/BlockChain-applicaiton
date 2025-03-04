// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/**
 * @title SimplifiedMatrixCore
 * @dev Centralized version of Xclera Matrix with minimal on-chain operations
 */
contract SimplifiedMatrixCore is Ownable, ReentrancyGuard {
    // Constants
    uint256 private immutable LEVEL_1_PRICE;
    uint256 private immutable SERVICE_FEE;
    uint256 private constant COMPANY_FEE_PERCENTAGE = 20; // 20% of level upgrade fees

    // Basic user data (minimized for gas efficiency)
    struct User {
        bool isRegistered;
        address referrer;
        uint8 currentLevel;
    }

    // State variables
    mapping(address => User) public users;
    address public companyWallet;
    address public immutable rootUser;

    // Events
    event UserRegistered(address indexed user, address indexed referrer);
    event LevelUpgraded(address indexed user, uint8 newLevel, uint256 fee);
    event RewardSent(address indexed to, uint256 amount, uint8 level);

    constructor(address _companyWallet, address _rootUser) Ownable(msg.sender) {
        require(_companyWallet != address(0), "Invalid company wallet");
        require(_rootUser != address(0), "Invalid root user");

        LEVEL_1_PRICE = 100 ether; // 100 USDT (using ether as denomination)
        SERVICE_FEE = 15 ether; // 15 USDT

        companyWallet = _companyWallet;
        rootUser = _rootUser;

        // Register root user
        User storage root = users[_rootUser];
        root.isRegistered = true;
        root.referrer = address(0); // No referrer for root
        root.currentLevel = 19; // Max level for the root user
    }

    /**
     * @dev Register a new user in the system
     * @param _referrer Referrer address
     */
    function register(address _referrer) external payable nonReentrant {
        require(!users[msg.sender].isRegistered, "Already registered");
        require(msg.value >= LEVEL_1_PRICE + SERVICE_FEE, "Insufficient payment");
        require(
            _referrer != address(0) && 
            _referrer != msg.sender && 
            users[_referrer].isRegistered,
            "Invalid referrer"
        );

        // Register user
        users[msg.sender] = User({
            isRegistered: true,
            referrer: _referrer,
            currentLevel: 1
        });

        // Process level 1 payment
        (bool referrerSuccess, ) = payable(_referrer).call{value: LEVEL_1_PRICE}("");
        require(referrerSuccess, "Referrer payment failed");

        // Send service fee to company wallet
        (bool companySuccess, ) = payable(companyWallet).call{value: SERVICE_FEE}("");
        require(companySuccess, "Company fee payment failed");

        emit UserRegistered(msg.sender, _referrer);
    }

    /**
     * @dev Upgrade user to next level with eligibility verified off-chain
     * @param _level New level to upgrade to
     * @param _uplineAddress Address that should receive the upgrade reward
     */
    function upgradeLevel(uint8 _level, address _uplineAddress) external payable nonReentrant {
        require(users[msg.sender].isRegistered, "Not registered");
        require(_level == users[msg.sender].currentLevel + 1, "Can only upgrade to next level");
        require(_level <= 19, "Maximum level is 19");

        // Calculate upgrade fee (150 for level 2, 200 for level 3, etc.)
        uint256 upgradeFee = (_level * 50) + 50;
        upgradeFee = upgradeFee * 1 ether; // Convert to proper denomination

        require(msg.value >= upgradeFee, "Insufficient payment");

        // Calculate company fee (20% of upgrade fee)
        uint256 companyFeeAmount = (upgradeFee * COMPANY_FEE_PERCENTAGE) / 100;
        uint256 uplineAmount = upgradeFee - companyFeeAmount;

        // Send company fee
        (bool companySuccess, ) = payable(companyWallet).call{value: companyFeeAmount}("");
        require(companySuccess, "Company fee payment failed");

        // Update user level
        users[msg.sender].currentLevel = _level;

        // Send the upline amount
        if (_uplineAddress != address(0)) {
            require(users[_uplineAddress].isRegistered, "Invalid upline address");
            require(users[_uplineAddress].currentLevel >= _level, "Upline level too low");
            
            (bool uplineSuccess, ) = payable(_uplineAddress).call{value: uplineAmount}("");
            require(uplineSuccess, "Upline payment failed");
            emit RewardSent(_uplineAddress, uplineAmount, _level);
        } else {
            // If no eligible upline, send to company wallet
            (bool walletSuccess, ) = payable(companyWallet).call{value: uplineAmount}("");
            require(walletSuccess, "Company payment failed");
        }

        emit LevelUpgraded(msg.sender, _level, upgradeFee);
    }

    // Simple view functions
    function isUserRegistered(address _user) external view returns (bool) {
        return users[_user].isRegistered;
    }

    function getUserLevel(address _user) external view returns (uint8) {
        return users[_user].currentLevel;
    }

    function getUserReferrer(address _user) external view returns (address) {
        return users[_user].referrer;
    }

    function setCompanyWallet(address _newWallet) external onlyOwner {
        require(_newWallet != address(0), "Invalid company wallet");
        companyWallet = _newWallet;
    }
}