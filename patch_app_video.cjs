const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

content = content.replace(
`import PlatformFilter from './components/PlatformFilter';`,
`import PlatformFilter from './components/PlatformFilter';
import VideoModal from './components/VideoModal';`
);

content = content.replace(
`      <CartDrawer />
      <AdminLogin />`,
`      <CartDrawer />
      <AdminLogin />
      <VideoModal />`
);

fs.writeFileSync('src/App.tsx', content);
