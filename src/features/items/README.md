# Robot Items System

This directory contains the implementation of the robot items system for the Square Web3 Profile application.

## Overview

The items system allows users to:

1. Purchase random robot parts (items) for 50 points each
2. View items in their inventory
3. Equip items to mascots (up to 3 items per mascot)
4. Enhance mascot stats with equipped items

## Files

- `ItemService.js` - Service for managing items, including storage in localStorage, purchase logic, and equipping/unequipping
- `ItemsPage.js` - UI component for displaying the items interface
- `README.md` - This documentation file

## Item Properties

Each item has the following properties:

- `id` - Unique identifier
- `name` - Display name
- `description` - Text description
- `type` - Item type (head, body, arms, etc.)
- `rarity` - One of: COMMON, UNCOMMON, RARE, EPIC, LEGENDARY
- `stats` - Object containing stat modifiers: hp, mp, agility, power, defense
- `svg` - SVG markup for rendering the item icon
- `instanceId` - Unique ID for each item instance owned by a user

## Rarity System

Items have 5 different rarities with varying probabilities:

1. **Common** - 55% chance
2. **Uncommon** - 25% chance
3. **Rare** - 12% chance
4. **Epic** - 6% chance
5. **Legendary** - 2% chance

## Equipping System

- Users can equip up to 3 items per mascot
- The same item cannot be equipped to multiple mascots
- When equipped, items' stats are added to the mascot's base stats

## Stats Calculation

The total stats of a mascot are calculated by:
1. Starting with the mascot's base stats
2. Adding the stats from each equipped item
3. Ensuring no stat goes below 1 (in case of negative modifiers)

## Storage

All item data is stored in localStorage with the following keys:

- `user_items_data` - Stores all user inventory data
- `mascot_items_data` - Stores which items are equipped to which mascots

## Events

The system uses a custom event system for updates:

- `ITEM_UPDATED_EVENT` - Fired when items are added, equipped, or unequipped

## Integration

The items system integrates with:

- The points system (for purchasing items)
- The mascots system (for equipping items to mascots and enhancing their stats) 