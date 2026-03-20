// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/utils/ERC721Holder.sol";

contract SealedBidAuction is ReentrancyGuard, Ownable, ERC721Holder {
    enum AuctionType { SINGLE_NFT }
    enum AuctionState { ACTIVE, FINALIZED, CANCELLED }

    struct Auction {
        uint256 auctionId;
        AuctionType auctionType;
        address nftContract;
        uint256 tokenId;
        address seller;
        uint256 startingPrice;
        uint256 reservePrice;
        uint256 minBidIncrement;
        uint256 startTime;
        uint256 endTime;
        uint256 bidExtensionTime;
        AuctionState state;
        uint256 totalBids;
        address highestBidder;
        uint256 highestBid;
        string title;
        string description;
        uint256 claimDeadline;
    }

    struct Bid {
        address bidder;
        uint256 amount;
        uint256 timestamp;
        unint256 deposit;
    }

    uint256 private _auctionIdCounter = 1;
    uint256 public constant MIN_AUCTION_DURATION = 1 hours;
    uint256 public constant MAX_AUCTION_DURATION = 30 days;
    uint256 public constant BID_EXTENSION_TIME = 10 minutes;
    uint256 public constant MAX_EXTENSIONS = 10;
    uint256 public constant CLAIM_DURATION = 3 days;
    uint256 public constant PLATFORM_FEE = 250; // 2.5%
    uint256 public constant MIN_BID_INCREMENT = 0.001 ether;
    uint256 public constant MAX_BIDS_PER_AUCTION = 1000;

    mapping(uint256 => Auction) public auctions;
    mapping(uint256 => Bid[]) private auctionBids;
    mapping(uint256 => mapping(address => uint256)) private bidderToIndex;
    mapping(address => uint256[]) private userAuctions;
    mapping(address => uint256[]) private userBids;
    mapping(uint256 => uint256) private auctionDeposits;

    event AuctionCreated(uint256 indexed auctionId, address indexed seller, address indexed nftContract, AuctionType auctionType, uint256 tokenId, uint256[] tokenIds, uint256 startTime, uint256 endTime);
    event BidPlaced(uint256 indexed auctionId, address indexed bidder, uint256 timestamp);
    event AuctionFinalized(uint256 indexed auctionId, address indexed winner, uint256 finalPrice, uint256 platformFeeAmount, uint256 sellerAmount);
    event AuctionCancelled(uint256 indexed auctionId, address indexed seller, string reason);
    event NFTClaimed(uint256 indexed auctionId, address indexed winner, uint256 amountPaid);
    event NFTReclaimed(uint256 indexed auctionId, address indexed seller);

    contructor(address initialOwner) Ownerable(initiaOwner) {} 

    function createSingleNFTAuction(
        address nftContracts,
        uint256 tokenId,
        uint256 startingPrice,
        uint256 reservePrice,
        uint256 minBidIncrement,
        uint256 duration,
        string calldata tittle,
        string calldata description
    ) external nonReentrant return (unint256){
        require(supportsERC721)((nftContract),"Invalid NFT contract");
        require(duration >= MIN_AUCTION_DURATION && duration <= MAX_AUCTION_DURATION, "Invalid NFT duration);
        require(startingPrice >= 0 && reservePrice >= startingPrice, "Starting price must be non-negative");
        require(minBidIncrement >= MIN_BID_INCREMENT, "Minimum bid increment too low");
        require(bytes(title).length > 0, "Title cannot be empty");
        require(IERC721(nftContract).ownerOf(tokenId) == msg.sender, "Sender must own the NFT");
        require(IERC721(nftcontract).getApproved(tokenId) == address(this) || IERC721(nftContract).isApprovedForAll(msg.sender, address(this)), "Contract must be approved to transfer the NFT");

        IERC721(nftContract).safeTransferFrom(msg.sender, address(this), tokenId);

        uint256 auctionId = _auctionIdCounter++;
        uint256 endTime = block.timestamp + duration;

        auctions[auctionId] = Auction({
            auctionId: auctionId,
            auctionType: AuctionType.SINGLE_NFT,
            nftContract: nftContract,
            tokenId: tokenId,
            seller: msg.sender,
            startingPrice: startingPrice,
            reservePrice: reservePrice,
            minBidIncrement: minBidIncrement,
            startTime: block.timestamp,
            endTime: endTime,
            bidExtensionTime: BID_EXTENSION_TIME,
            state: AuctionState.ACTIVE,
            totalBids: 0,
            highestBidder: address(0),
            highestBid: 0,
            title: title,
            description: description,
            claimDeadline: 0
        });
        userAuctions[msg.sender].push(auctionId);
        emit AuctionCreated(auctionId, msg.sender, nftContract, AuctionType.SINGLE_NFT, tokenId, new uint256[](0), block.timestamp, endTime, title);
        return auctionId;
    }


    function placeBid(uint256 auctionId) external payable nonReentrant {
        Auction storage auction = auctions[auctionId];
        require(auction.state == AuctionState.ACTIVE, "Auction is not active");
        require(block.timestamp < auction.endTime, "Auction has ended");
        require(msg.sender != auction.seller, "Seller cannot bid on their own auction");
        require(msg.value >= auction.startingPrice + auction.minBidIncrement, "Bid below starting price");
        require(msg.value == auction.startingPrice, "Incorreect deposit amount");
        require(auction.totalbids < MAX_BIDS_PER_AUCTION, "Max bids reached");

        uint256 currentBidIndex = bidderToIndex[auctionId][msg.sender];
        if(existingBidIndex > 0) {
            Bid storage existingBid = auctionBids[auctionId][currentBidIndex - 1];
            require(bidAmount >= existingBid.amount, "Bid must be higher than existing bid by min increment");
            existingBid.amount = bidAmount;
            exitingBid.timestamp = block.timestamp;
        } else {
            auctionBids[auctionId].push(Bid({
                bidder: msg.sender,
                amount: BidsAmount,
                timestamp: block.timestamp,
                deposit: msg.value
            }));
            bidderToIndex[auctionId][msg.sender] = auctionBids[auctionId].length;
            auction.totalBids +=1;
            userBids[msg.sender].push(auctionId);
            auctionDeposits[auctionId] += msg.value;
        }
        emit BidPlaced(auctionId, msg.sender, block.timestamp);
    }

    function finalizeAuction(uint256 auctionId) external nonReentrant {
        auction storage auction = auctions[auctionId];
        require(auction.state == AuctionState.ACTIVE, "Auction is not active");
        require(block.timestamp >= auction.endTime, "Auction has not ended yet");

        auction.state = AuctionState.FINALIZED;
        (address winner, uint256 finalPrice) = determineWinner(auctionId);
        auction.highestBidder = winner;
        auction.highestBid = finalPrice;

        if(winner != address(0) && highestDid >= auction.reservePrice) {
            auction.claimDeadline = block.timestamp + CLAIM_DURATION;
            uint256 feeAmount = (highestBid * PLATFORM_FEE) / 10000;
            uint256 sellerAmount = highestBid - feeAmount;
        for(uint256 i = 0; i < auctionBids[auctionId].length; i++) {
            Bid storage bid = auctionBids[auctionId][i];
            if(bid.bidder == winner) {
                payable(bid.bidder).transfer(bid.deposit);
                auctionDeposits[auctionId] -= bid.deposit;
            } else {
                payable(bid.bidder).transfer(bid.amount + bid.deposit);
                auctionDeposits[auctionId] -= (bid.amount + bid.deposit);
            }
        }
        emit AuctionFinalized(auctionId, winner, finalPrice, feeAmount, sellerAmount);
    } else {
        cancelAuction(auctionId);
        }
    }

    function cancelAuction(uint256 auctionId) internal nonReentrant {
        auction storage auction = auctions[auctionId];
        require(auction.state == AuctionState.ACTIVE, "Auction is not active");
        require(msg.sender == auction.seller || block.timestamp >= auction.endTime, "Only seller can cancel before end time");

        auction.state = AuctionState.CANCELLED;

        for(uint256 i = 0; i < auctionBids[auctionId].length; i++) {
            Bid storage bid = auctionBids[auctionId][i];
            payable(bid.bidder).transfer(bid.amount + bid.deposit);
            auctionDeposits[auctionId] -= (bid.amount + bid.deposit);
        }

        IERC721(auction.nftContract).safeTransferFrom(address(this), auction.seller, auction.tokenId);

        emit AuctionCancelled(auctionId, auction.seller, "Auction cancelled");
    }


    function claimNFT(uint256 auctionId) external payable nonReentrant {
        Auction storage auction = auctions[auctionId];
        require(auction.state == AuctionState.FINALIZED, "Auction is not finalized");
        require(msg.sender == auction.highestBidder, "Only winner can claim the NFT");
        require(block.timestamp <= auction.claimDeadline, "Claim period has expired");
        uint256 remainingPayment = auction.highestBid;
        require(msg.value == remainingPayment, "Incorrect payment amount");

        uint256 feeAmount = (auction.highestBid * PLATFORM_FEE) / 10000;
        uint256 sellerAmount = auction.highestBid - feeAmount;
        if(auction.AuctionType == AuctionType.SINGLE_NFT) {
            IERC721(auction.nftContract).safeTransferFrom(address(this), msg.sender, auction.tokenId);
        } 
        else {
            for(uint256 i = 0; i < auction.tokenIds.length; i++) {
                IERC721(auction.nftContract).safeTransferFrom(address(this), msg.sender, auction.tokenIds[i]);
            }    
        }
        payable(auction.seller).transfer(sellerAmount - auction.startingPrice);
        payable(owner()).transfer(remainingPayment);
    }
    //27:53
    function reclaimNFT(uint256 auctionId) external nonReentrant {

    }

    function determineWinner(uint256 auctionId) internal view returns (address winner, uint256 winningBid) {

    }

    function supportsERC721(address nftContract) internal view returns (bool) {
        return IERC(nftContract).supportsInterface(0x80ac58cd);
    }

    function getAuctionBids(uint256 auctionId) external view returns (Bid[] memory) {

    }
}