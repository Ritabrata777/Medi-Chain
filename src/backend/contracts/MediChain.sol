// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

interface IMediChain {
    function isDoctorVerified(address doctorAddress) external view returns (bool);
}

contract MediChain is Ownable {

    mapping(bytes32 => bool) private consultationHashes;
    mapping(address => bool) public verifiedDoctors;

    event ConsultationLogged(bytes32 indexed summaryHash, address indexed doctor, bytes32 indexed patientHash, uint256 timestamp);
    event DoctorVerified(address indexed doctorAddress);

    constructor(address initialOwner) Ownable(initialOwner) {}

    modifier onlyVerifiedDoctor() {
        require(verifiedDoctors[msg.sender], "Only a verified doctor can perform this action");
        _;
    }

    function addConsultationLog(bytes32 _summaryHash, bytes32 _patientHash) public onlyVerifiedDoctor {
        require(!consultationHashes[_summaryHash], "This consultation summary has already been logged.");
        consultationHashes[_summaryHash] = true;
        emit ConsultationLogged(_summaryHash, msg.sender, _patientHash, block.timestamp);
    }
    
    function verifyDoctor(address doctorAddress) public onlyOwner {
        require(!verifiedDoctors[doctorAddress], "Doctor is already verified.");
        verifiedDoctors[doctorAddress] = true;
        emit DoctorVerified(doctorAddress);
    }

    function isDoctorVerified(address doctorAddress) public view returns (bool) {
        return verifiedDoctors[doctorAddress];
    }
}
