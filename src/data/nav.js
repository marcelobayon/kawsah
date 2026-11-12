/* ==========================================================================
   KAWSAH — Navigation model
   Keep the primary nav simple (section 33). Not every route lives here.
   ========================================================================== */
export const NAV = [
  { label: "Home", href: "/" },
  {
    label: "Buy",
    href: "/purchase/",
    children: [
      { label: "Buy a Home", href: "/purchase/" },
      { label: "First-Time Buyer", href: "/first-time-buyer/" },
      { label: "Self-Employed", href: "/self-employed/" },
      { label: "House Hunting", href: "/house-hunting/" },
      { label: "Purchase Playbook", href: "/purchase-playbook/" },
    ],
  },
  { label: "Refinance", href: "/refinance/" },
  {
    label: "Tools",
    href: "/route-finder/",
    children: [
      { label: "Find My Path", href: "/route-finder/" },
      { label: "Affordability", href: "/affordability/" },
      { label: "Mortgage Payment", href: "/mortgage-payment/" },
      { label: "Cash to Close", href: "/cash-to-close/" },
      { label: "Refinance Break-Even", href: "/refi-breakeven/" },
      { label: "Homeowner Tools", href: "/homeowner-tools/" },
    ],
  },
  {
    label: "Resources",
    href: "/financial-readiness/",
    children: [
      { label: "Financial Readiness", href: "/financial-readiness/" },
      { label: "Expense Tracker", href: "/expense-tracker/" },
      { label: "Community", href: "/community/" },
      { label: "For Professionals", href: "/professionals/" },
    ],
  },
  { label: "About", href: "/who-marcelo-is/" },
];

export const PRIMARY_CTA = { label: "Find My Path", href: "/route-finder/" };
export const SECONDARY_CTA = { label: "Apply", href: "/apply/" };

export const FOOTER_GROUPS = [
  {
    title: "Buy",
    links: [
      { label: "Buy a Home", href: "/purchase/" },
      { label: "First-Time Buyer", href: "/first-time-buyer/" },
      { label: "Self-Employed", href: "/self-employed/" },
      { label: "Refinance", href: "/refinance/" },
      { label: "House Hunting", href: "/house-hunting/" },
      { label: "Purchase Playbook", href: "/purchase-playbook/" },
    ],
  },
  {
    title: "Tools",
    links: [
      { label: "Route Finder", href: "/route-finder/" },
      { label: "Affordability", href: "/affordability/" },
      { label: "Mortgage Payment", href: "/mortgage-payment/" },
      { label: "Cash to Close", href: "/cash-to-close/" },
      { label: "Refinance Break-Even", href: "/refi-breakeven/" },
    ],
  },
  {
    title: "Homeowner",
    links: [
      { label: "Homeowner Tools", href: "/homeowner-tools/" },
      { label: "House Management", href: "/house-management/" },
      { label: "Home Inventory", href: "/home-inventory/" },
      { label: "Smart Home", href: "/smart-home/" },
      { label: "Life Wiki", href: "/life-wiki/" },
    ],
  },
  {
    title: "More",
    links: [
      { label: "Financial Readiness", href: "/financial-readiness/" },
      { label: "Community", href: "/community/" },
      { label: "For Professionals", href: "/professionals/" },
      { label: "Homebuyer Bundle", href: "/homebuyer-bundle/" },
      { label: "About Marcelo", href: "/who-marcelo-is/" },
      { label: "Contact", href: "/contact/" },
    ],
  },
];

export default NAV;
