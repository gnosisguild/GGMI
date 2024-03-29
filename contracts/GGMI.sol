// SPDX-License-Identifier: LGPLv3
pragma solidity ^0.8.20;

import { ERC20 } from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import { ERC20Burnable } from "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import { ERC20Pausable } from "@openzeppelin/contracts/token/ERC20/extensions/ERC20Pausable.sol";
import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";
import { ERC20Permit, Nonces } from "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";
import { ERC20Votes } from "@openzeppelin/contracts/token/ERC20/extensions/ERC20Votes.sol";

contract GGMI is ERC20, ERC20Burnable, ERC20Pausable, Ownable, ERC20Permit, ERC20Votes {
    mapping(address account => bool isAuthorized) public authorized;

    event AuthorizationGranted(address emitter, address account);
    event AuthorizationRevoked(address emitter, address account);

    constructor(
        address initialOwner,
        string memory _name,
        string memory _symbol
    ) ERC20("_name", "_symbol") Ownable(initialOwner) ERC20Permit("_symbol") {}

    function grantAuthorization(address account) public onlyOwner {
        authorized[account] = true;
        emit AuthorizationGranted(address(this), account);
    }

    function revokeAuthorization(address account) public onlyOwner {
        delete authorized[account];
        emit AuthorizationRevoked(address(this), account);
    }

    function _requireNotPaused() internal view override {
        address sender = _msgSender();
        if (paused() && authorized[sender] != true && sender != owner()) {
            revert EnforcedPause();
        }
    }

    function pause() public onlyOwner {
        _pause();
    }

    function unpause() public onlyOwner {
        _unpause();
    }

    function mint(address to, uint256 amount) public onlyOwner {
        _mint(to, amount);
    }

    // The following functions are overrides required by Solidity.

    function _update(address from, address to, uint256 value) internal override(ERC20, ERC20Pausable, ERC20Votes) {
        super._update(from, to, value);
    }

    function nonces(address owner) public view override(ERC20Permit, Nonces) returns (uint256) {
        return super.nonces(owner);
    }
}
