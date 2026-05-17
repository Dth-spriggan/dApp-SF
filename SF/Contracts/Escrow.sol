// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract Escrow {
    enum OrderStatus {
        None,
        Deposited,
        Released,
        Refunded
    }

    struct Order {
        address buyer;
        uint256 amount;
        OrderStatus status;
    }

    address public seller;
    mapping(uint256 => Order) private orders;

    event Deposited(uint256 indexed orderId, address indexed buyer, uint256 amount);
    event PaymentReleased(uint256 indexed orderId, address indexed seller, uint256 amount);
    event Refunded(uint256 indexed orderId, address indexed buyer, uint256 amount);

    constructor(address _seller) {
        require(_seller != address(0), "Invalid seller");
        seller = _seller;
    }

    function deposit(uint256 orderId) external payable {
        require(orderId != 0, "Invalid order");
        require(msg.value > 0, "Must send ETH");

        Order storage order = orders[orderId];
        require(order.status == OrderStatus.None, "Order exists");

        order.buyer = msg.sender;
        order.amount = msg.value;
        order.status = OrderStatus.Deposited;

        emit Deposited(orderId, msg.sender, msg.value);
    }

    function confirmDelivery(uint256 orderId) external {
        Order storage order = orders[orderId];
        require(order.status == OrderStatus.Deposited, "Order not funded");
        require(msg.sender == order.buyer, "Only buyer");

        uint256 paymentAmount = order.amount;
        order.status = OrderStatus.Released;

        (bool success, ) = payable(seller).call{value: paymentAmount}("");
        require(success, "Transfer failed");

        emit PaymentReleased(orderId, seller, paymentAmount);
    }

    function refundBuyer(uint256 orderId) external {
        Order storage order = orders[orderId];
        require(order.status == OrderStatus.Deposited, "Order not funded");
        require(msg.sender == seller, "Only seller");

        uint256 refundAmount = order.amount;
        order.status = OrderStatus.Refunded;

        (bool success, ) = payable(order.buyer).call{value: refundAmount}("");
        require(success, "Refund failed");

        emit Refunded(orderId, order.buyer, refundAmount);
    }

    function getOrder(uint256 orderId)
        external
        view
        returns (
            address buyer,
            address currentSeller,
            uint256 amount,
            uint8 status
        )
    {
        Order storage order = orders[orderId];
        return (order.buyer, seller, order.amount, uint8(order.status));
    }
}
