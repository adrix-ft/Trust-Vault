const fs = require('fs');
let content = fs.readFileSync('src/context/StoreContext.tsx', 'utf8');

content = content.replace(
`  selectedCategory: string;
  setSelectedCategory: (category: string) => void;`,
`  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
  playingTrailerUrl: string | null;
  setPlayingTrailerUrl: (url: string | null) => void;`
);

content = content.replace(
`  const [showAdminLogin, setShowAdminLogin] = useState(false);`,
`  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [playingTrailerUrl, setPlayingTrailerUrl] = useState<string | null>(null);`
);

content = content.replace(
`isCartOpen, setIsCartOpen, selectedCategory, setSelectedCategory, platformFilter, setPlatformFilter,`,
`isCartOpen, setIsCartOpen, selectedCategory, setSelectedCategory, platformFilter, setPlatformFilter, playingTrailerUrl, setPlayingTrailerUrl,`
);

fs.writeFileSync('src/context/StoreContext.tsx', content);
