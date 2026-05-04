🔄 CI/CD: Downgraded non-existent futuristic action versions to stable versions:
- actions/checkout@v6 -> @v4
- actions/upload-artifact@v7 -> @v4
- actions/upload-pages-artifact@v5 -> @v3
- actions/deploy-pages@v5 -> @v4
- actions/cache@v5 -> @v4
- actions/github-script@v9 -> @v7
This prevents 'Failed to resolve action' errors during pipeline initialization.
