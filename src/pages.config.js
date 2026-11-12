/**
 * pages.config.js - Page routing configuration
 * 
 * This file is AUTO-GENERATED. Do not add imports or modify PAGES manually.
 * Pages are auto-registered when you create files in the ./pages/ folder.
 * 
 * THE ONLY EDITABLE VALUE: mainPage
 * This controls which page is the landing page (shown when users visit the app).
 * 
 * Example file structure:
 * 
 *   import HomePage from './pages/HomePage';
 *   import Dashboard from './pages/Dashboard';
 *   import Settings from './pages/Settings';
 *   
 *   export const PAGES = {
 *       "HomePage": HomePage,
 *       "Dashboard": Dashboard,
 *       "Settings": Settings,
 *   }
 *   
 *   export const pagesConfig = {
 *       mainPage: "HomePage",
 *       Pages: PAGES,
 *   };
 * 
 * Example with Layout (wraps all pages):
 *
 *   import Home from './pages/Home';
 *   import Settings from './pages/Settings';
 *   import __Layout from './Layout.jsx';
 *
 *   export const PAGES = {
 *       "Home": Home,
 *       "Settings": Settings,
 *   }
 *
 *   export const pagesConfig = {
 *       mainPage: "Home",
 *       Pages: PAGES,
 *       Layout: __Layout,
 *   };
 *
 * To change the main page from HomePage to Dashboard, use find_replace:
 *   Old: mainPage: "HomePage",
 *   New: mainPage: "Dashboard",
 *
 * The mainPage value must match a key in the PAGES object exactly.
 */
import Achievements from './pages/Achievements';
import BrandStudio from './pages/BrandStudio';
import AdminPanel from './pages/AdminPanel';
import Avatar from './pages/Avatar';
import Blog from './pages/Blog';
import BlogPost from './pages/BlogPost';
import BuyCoins from './pages/BuyCoins';
import BuyGems from './pages/BuyGems';
import Challenges from './pages/Challenges';
import Coach from './pages/Coach';
import Dashboard from './pages/Dashboard';
import Documentation from './pages/Documentation';
import Gifts from './pages/Gifts';
import Guilds from './pages/Guilds';
import HabitLibrary from './pages/HabitLibrary';
import Home from './pages/Home';
import Inventory from './pages/Inventory';
import InvitationStats from './pages/InvitationStats';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Leaderboard from './pages/Leaderboard';
import Missions from './pages/Missions';
import Notifications from './pages/Notifications';
import Objectives from './pages/Objectives';
import Onboarding from './pages/Onboarding';
import Perks from './pages/Perks';
import Premium from './pages/Premium';
import PrivacyPolicy from './pages/PrivacyPolicy';
import Profile from './pages/Profile';
import Projects from './pages/Projects';
import Settings from './pages/Settings';
import Shop from './pages/Shop';
import Social from './pages/Social';
import Statistics from './pages/Statistics';
import __Layout from './Layout.jsx';

export const PAGES = {
    "Achievements": Achievements,
    "BrandStudio": BrandStudio,
    "AdminPanel": AdminPanel,
    "Avatar": Avatar,
    "Blog": Blog,
    "BlogPost": BlogPost,
    "BuyCoins": BuyCoins,
    "BuyGems": BuyGems,
    "Challenges": Challenges,
    "Coach": Coach,
    "Dashboard": Dashboard,
    "Documentation": Documentation,
    "Gifts": Gifts,
    "Guilds": Guilds,
    "HabitLibrary": HabitLibrary,
    "Home": Home,
    "Inventory": Inventory,
    "InvitationStats": InvitationStats,
    "Landing": Landing,
    "Login": Login,
    "Leaderboard": Leaderboard,
    "Missions": Missions,
    "Notifications": Notifications,
    "Objectives": Objectives,
    "Onboarding": Onboarding,
    "Perks": Perks,
    "Premium": Premium,
    "PrivacyPolicy": PrivacyPolicy,
    "Profile": Profile,
    "Projects": Projects,
    "Settings": Settings,
    "Shop": Shop,
    "Social": Social,
    "Statistics": Statistics,
}

export const pagesConfig = {
    mainPage: "Landing",
    Pages: PAGES,
    Layout: __Layout,
};