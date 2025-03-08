// Custom CSS in JSX for ensuring SVGs are visible
const svgStyles = {
  '.item-svg-container svg': {
    width: '100%',
    height: '100%',
    stroke: 'currentColor',
    strokeWidth: '2px',
    minWidth: '24px',
    minHeight: '24px'
  },
  '.item-svg-container svg *': {
    stroke: 'currentColor',
    strokeWidth: '2px'
  }
};

export default svgStyles; 