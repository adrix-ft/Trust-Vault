const fs = require('fs');

let content = fs.readFileSync('src/App.tsx', 'utf8');

content = content.replace(
`import { StoreProvider, useStore } from './context/StoreContext';`,
`import { StoreProvider, useStore } from './context/StoreContext';
import PlatformFilter from './components/PlatformFilter';`
);

content = content.replace(
`<Navbar />`,
`<Navbar />
      <PlatformFilter />`
);

fs.writeFileSync('src/App.tsx', content);

