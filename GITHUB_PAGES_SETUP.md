# GitHub Pages Setup Instructions

This repository uses **MkDocs Material** to generate the documentation site, which is deployed to GitHub Pages.

## Current Status

✅ **MkDocs configuration**: Complete and working  
✅ **Build workflow**: Configured in `.github/workflows/docs.yml`  
✅ **Lesson page generation**: Automated via `tools/build_docs.py`  
✅ **Deployment to `gh-pages` branch**: Automated via peaceiris/actions-gh-pages  

⚠️ **GitHub Pages source setting**: Needs manual configuration

## Required Manual Step

The repository owner needs to update the GitHub Pages settings:

1. Go to **Settings** → **Pages** in the GitHub repository
2. Under **Build and deployment**, find the **Source** section
3. Change from:
   - **Deploy from a branch**: `main` branch, `/docs` folder
4. Change to:
   - **Deploy from a branch**: `gh-pages` branch, `/ (root)` directory

## Why This Change Is Necessary

- The `/docs` folder contains Jekyll configuration (`_config.yml`), which causes GitHub Pages to use Jekyll processing
- The MkDocs workflow builds the site and pushes it to the `gh-pages` branch
- GitHub Pages needs to serve from the `gh-pages` branch (which contains the pre-built MkDocs site), not from the `/docs` folder

## Verification

After changing the GitHub Pages source:

1. Wait 1-2 minutes for GitHub to deploy from the new branch
2. Visit https://saint2706.github.io/Coding-For-MBA/
3. You should see the **MkDocs Material** theme with:
   - Professional navigation with tabs
   - All 84+ lessons in the sidebar
   - Search functionality
   - Mobile-responsive design
   - Dark theme (slate color scheme)

## How It Works

1. **Push to `main`** triggers `.github/workflows/docs.yml`
2. **Build script** runs `python tools/build_docs.py` to generate lesson pages from `Day_*/README.md` files
3. **MkDocs** builds the static site to `./site` directory
4. **peaceiris/actions-gh-pages** action pushes `./site` contents to `gh-pages` branch (with `.nojekyll` file)
5. **GitHub Pages** serves from `gh-pages` branch root

## Mobile Support

The MkDocs Material theme is fully responsive and optimized for mobile devices:
- Touch-friendly navigation
- Responsive breakpoints
- Mobile menu drawer
- Optimized font sizes and spacing

## Troubleshooting

If the site still shows Jekyll/docs folder content after changing settings:
1. Verify the `gh-pages` branch exists: https://github.com/saint2706/Coding-For-MBA/tree/gh-pages
2. Check the latest workflow run succeeded: https://github.com/saint2706/Coding-For-MBA/actions/workflows/docs.yml
3. Try triggering a manual workflow run from the Actions tab
4. Clear browser cache or try incognito mode

## Additional Resources

- [MkDocs Material Documentation](https://squidfunk.github.io/mkdocs-material/)
- [GitHub Pages Documentation](https://docs.github.com/en/pages)
- [peaceiris/actions-gh-pages](https://github.com/peaceiris/actions-gh-pages)
