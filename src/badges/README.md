# Badge System

This directory contains components and services for a user badge system. Badges are creative SVG images awarded to users when they complete certain actions or meet specific criteria.

## Components

- **BadgeService.js**: Main service for managing badge assignments, definitions, and logic for awarding badges.
- **BadgeDisplay.js**: Components for displaying badges, both individually and as collections.
- **BadgesPage.js**: A full page component for viewing all available badges and their details.

## Badge Definitions

All badges are defined in the `BADGES` object in `BadgeService.js`. Each badge has:

- `id`: Unique identifier string
- `name`: Display name for the badge
- `description`: Text explaining how the badge is earned
- `color`: Primary color for the badge
- `svg`: SVG component for the badge design

## Current Badges

1. **Early Adopter**: Awarded to users who joined during the launch phase
2. **Web3 Explorer**: Awarded when a user connects a Web3 wallet to their account
3. **Blockchain Master**: Awarded for demonstrating knowledge of blockchain concepts
4. **Community Pillar**: Awarded to active contributors to the community
5. **Crypto Wizard**: Awarded for completing advanced crypto transactions

## Adding New Badges

To create a new badge:

1. Add a new entry to the `BADGES` object in `BadgeService.js`
2. Create the SVG design for the badge
3. Add logic to the `checkAndAwardBadges` method to award the badge based on specific criteria

## Usage

The badge system is integrated into the `UserProfileCard` component to show earned badges. The full badge collection is available through the Badges page.

Example of displaying badges for a user:

```jsx
import BadgeDisplay from './badges/BadgeDisplay';

// In a component
<BadgeDisplay userId={user.id} size="md" limit={5} />
```

Example of awarding a badge programmatically:

```jsx
import BadgeService from './badges/BadgeService';

// When a user completes an action
BadgeService.awardBadge(userId, 'badge_id');
``` 