const fs = require('fs');

let content = fs.readFileSync('src/context/StoreContext.tsx', 'utf8');

// Replace context type
content = content.replace(
`  selectedCategory: string;
  setSelectedCategory: (category: string) => void;`,
`  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
  platformFilter: string;
  setPlatformFilter: (platform: string) => void;`
);

// Add initial state with localStorage
content = content.replace(
`  const [showAdminLogin, setShowAdminLogin] = useState(false);`,
`  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [platformFilter, setPlatformFilter] = useState(() => {
    try {
      return localStorage.getItem('gaming_platform_filter') || 'All';
    } catch {
      return 'All';
    }
  });

  useEffect(() => {
    localStorage.setItem('gaming_platform_filter', platformFilter);
  }, [platformFilter]);`
);

// Add to provider value
content = content.replace(
`isCartOpen, setIsCartOpen, selectedCategory, setSelectedCategory,`,
`isCartOpen, setIsCartOpen, selectedCategory, setSelectedCategory, platformFilter, setPlatformFilter,`
);

fs.writeFileSync('src/context/StoreContext.tsx', content);

