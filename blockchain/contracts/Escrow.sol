// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Escrow {

    enum Status { Created, Paid, Shipped, Completed, Refunded }

    struct Order {
        uint id;
        address buyer;
        address seller;
        uint amount;
        Status status;
    }

    mapping(uint => Order) public orders;
    uint public orderCount;

    function createOrder(address _seller) public {
        orderCount++;
        orders[orderCount] = Order(
            orderCount,
            msg.sender,
            _seller,
            0,
            Status.Created
        );
    }

    function deposit(uint _orderId) public payable {
        Order storage order = orders[_orderId];

        require(msg.sender == order.buyer, "Only buyer");
        require(order.status == Status.Created, "Invalid state");

        order.amount = msg.value;
        order.status = Status.Paid;
    }

    function confirmShipment(uint _orderId) public {
        Order storage order = orders[_orderId];

        require(msg.sender == order.seller, "Only seller");
        require(order.status == Status.Paid, "Not paid");

        order.status = Status.Shipped;
    }

    function confirmReceived(uint _orderId) public {
        Order storage order = orders[_orderId];

        require(msg.sender == order.buyer, "Only buyer");
        require(order.status == Status.Shipped, "Not shipped");

        order.status = Status.Completed;

        payable(order.seller).transfer(order.amount);
    }

    function refund(uint _orderId) public {
        Order storage order = orders[_orderId];

        require(msg.sender == order.seller, "Only seller");
        require(order.status == Status.Paid, "Invalid state");

        order.status = Status.Refunded;

        payable(order.buyer).transfer(order.amount);
    }
}
