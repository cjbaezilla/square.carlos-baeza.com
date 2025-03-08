# Carlos Baeza Square

This is a React application built with Tailwind CSS, optimized for shared webhosting environments.

## Development

To start the development server:

```bash
npm start
```

## Building for Production

To build the application for production deployment:

```bash
npm run build
```

After building, the contents of the `build` directory can be uploaded directly to your shared hosting environment.

## Deployment to Shared Hosting

1. Run `npm run build` to create a production build
2. Upload the contents of the `build` directory to your web hosting server
3. Make sure your hosting provider has the correct server configuration to support single-page applications (the included .htaccess file should handle this for Apache servers)

## Technologies Used

- React.js
- Tailwind CSS
- Create React App

# Getting Started with Create React App

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can't go back!**

If you aren't satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you're on your own.

You don't have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn't feel obligated to use this feature. However we understand that this tool wouldn't be useful if you couldn't customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

### Code Splitting

This section has moved here: [https://facebook.github.io/create-react-app/docs/code-splitting](https://facebook.github.io/create-react-app/docs/code-splitting)

### Analyzing the Bundle Size

This section has moved here: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

### Making a Progressive Web App

This section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

### Advanced Configuration

This section has moved here: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

### Deployment

This section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

### `npm run build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)

## Project Structure

Below is a hierarchical tree view of the project directories and their main functions:

```
square.carlos-baeza.com/
├── public/                     # Static public assets
│   ├── index.html              # Main HTML template
│   ├── favicon.jpg             # Site favicon
│   ├── manifest.json           # Web app manifest
│   └── robots.txt              # Robot rules
├── src/                        # Source code
│   ├── App.js                  # Main application component
│   ├── index.js                # Application entry point
│   ├── components/             # Shared UI components
│   │   ├── MetaMaskSign.js     # MetaMask integration UI
│   │   └── BlockchainGuide.js  # Guide for blockchain concepts
│   ├── db/                     # Database schema definitions
│   │   ├── create_user_items_table.sql         # Items table schema
│   │   ├── create_user_mascots_table.sql       # Mascots table schema
│   │   ├── create_user_badges_table.sql        # Badges table schema
│   │   └── create_user_points_table.sql        # Points table schema
│   ├── features/               # Feature modules
│   │   ├── auth/               # Authentication module
│   │   │   ├── MetaMaskSign.js              # MetaMask authentication
│   │   │   ├── BlockchainGuide.js           # Blockchain guide
│   │   │   └── ProtectedRoute.js            # Route protection component
│   │   ├── badges/             # Badge system
│   │   │   ├── BadgeService.js              # Service for managing badges
│   │   │   │   ├── BADGES                   # Badge definitions
│   │   │   │   ├── getBadges()              # Get user badges
│   │   │   │   ├── awardBadge()             # Award badge to user
│   │   │   │   ├── hasBadge()               # Check if user has badge
│   │   │   │   └── removeBadge()            # Remove badge from user
│   │   │   ├── BadgeDisplay.js              # Badge display components
│   │   │   ├── BadgesPage.js                # Page to view/manage badges
│   │   │   └── TestBadges.js                # Test badge functionality
│   │   ├── items/              # Item system
│   │   │   ├── ItemService.js               # Service for managing items
│   │   │   │   ├── ITEMS                    # Item definitions
│   │   │   │   ├── getUserItems()           # Get user's items
│   │   │   │   ├── purchaseRandomItem()     # Purchase random item
│   │   │   │   ├── equipItem()              # Equip item to mascot
│   │   │   │   └── unequipItem()            # Unequip item from mascot
│   │   │   ├── ItemsPage.js                 # Page to view/manage items
│   │   │   └── README.md                    # Items system documentation
│   │   ├── mascots/            # Mascot system
│   │   │   ├── MascotService.js             # Service for managing mascots
│   │   │   │   ├── MASCOTS                  # Mascot definitions
│   │   │   │   ├── getUserMascots()         # Get user's mascots
│   │   │   │   ├── purchaseMascot()         # Purchase a mascot
│   │   │   │   ├── getUserActiveMascot()    # Get user's active mascot
│   │   │   │   ├── setUserActiveMascot()    # Set active mascot
│   │   │   │   └── addMascotExperience()    # Add experience to mascot
│   │   │   ├── MascotsPage.js               # Page to view/manage mascots
│   │   │   ├── MascotProfile.js             # Mascot profile component
│   │   │   └── MascotDisplay.js             # Mascot display component
│   │   └── rewards/            # Rewards/points system
│   │       ├── PointsService.js             # Service for managing points
│   │       │   ├── POINT_VALUES             # Point value definitions
│   │       │   ├── getUserPoints()          # Get user points
│   │       │   ├── addPoints()              # Add points to user
│   │       │   ├── calculateLevel()         # Calculate user level
│   │       │   └── awardPointsForAction()   # Award points for actions
│   │       ├── UserRewardsPage.js           # Page to view/manage rewards
│   │       └── PointsBadge.js               # Points display component
│   ├── shared/                # Shared utilities
│   │   ├── utils/              # Utility functions and helpers
│   │   ├── router/             # Routing configuration
│   │   └── components/         # Shared UI components
│   └── store/                 # State management
│       └── slices/             # Redux store slices
└── package.json               # Project dependencies and scripts
```

Each feature module follows a consistent pattern with:
- Service files that contain core functionality and data management
- Page components for user interface
- Supporting components and utilities

The application is built with React and uses Supabase for backend services. The main features include:
- A robot mascot system with different rarity classes
- An item system for equipping and enhancing mascots
- A badge system to reward user achievements
- A points system to track user progress and enable purchases
