# Security Policy

## Reporting Security Vulnerabilities

**Please do not open public GitHub issues for security vulnerabilities.** Instead, please report security issues responsibly through alternative channels.

### Responsible Disclosure

If you discover a security vulnerability in this project, please:

1. **Email**: Send a detailed report to the repository maintainer(s). Include:
   - A clear description of the vulnerability
   - Steps to reproduce (if applicable)
   - Potential impact and severity assessment
   - Any proof-of-concept code (with responsible handling)

2. **Private Security Advisory**: Use GitHub's [private security advisory feature](https://docs.github.com/en/code-security/security-advisories/repository-security-advisories/creating-a-repository-security-advisory) if the vulnerability is in a public repository.

3. **Timeline**: We aim to:
   - Acknowledge receipt within 24 hours
   - Provide an initial assessment within 48 hours
   - Issue a fix or mitigation plan within 7 days for critical issues

## Security Practices

### Dependency Management

- **Automated Scanning**: This project uses [GitHub Dependency Review](https://docs.github.com/en/code-security/supply-chain-security/understanding-your-software-supply-chain/about-dependency-review) to block pull requests that introduce high or critical vulnerabilities.
- **Scheduled Updates**: [Dependabot](https://docs.github.com/en/code-security/dependabot) checks for dependency updates on **Thursdays at 1:00 PM IST** (configured in `.github/dependabot.yml`).
- **Manual Audits**: Run `npm audit` locally to scan for known vulnerabilities:

  ```bash
  npm audit
  npm audit fix
  ```

### Code Quality & Testing

- **TypeScript**: Strict type checking (`typecheck` command) prevents common security issues like type confusion.
- **Linting**: ESLint and Prettier enforce code quality and consistent formatting.
- **Automated Tests**:
  - **Unit Tests**: Vitest with coverage reports
  - **End-to-End Tests**: Playwright tests verify real user workflows
  - **Visual Regression Tests**: Detect unintended UI changes
- **CI/CD Pipeline**: All code changes must pass the CI workflow (`.github/workflows/ci.yml`) before merging:
  - TypeScript type checking
  - Lint validation
  - Unit test coverage
  - Content validation
  - Dependency review

### Secure Defaults

- **No Hardcoded Secrets**: Use `.env.example` (not `.env`) in version control. Actual `.env` files are in `.gitignore`.
- **CSP-Ready**: The project supports Content Security Policy (CSP) headers for XSS protection.
- **SRI (Subresource Integrity)**: External dependencies are managed through `package.json` with locked versions.
- **Minimal Attack Surface**: Limited external API calls; most content is served statically.

### Data Handling

- **Client-Side Only**: This is a static learning platform. No user data is stored on backend servers.
- **Local Storage**: Only non-sensitive progress tracking is stored in browser localStorage.
- **No Authentication**: The platform is public; no login mechanism exists, reducing authentication-related risks.

## Secure Development

### Contributing Securely

When submitting pull requests:

1. **Don't commit secrets**: Never commit API keys, tokens, or credentials.
2. **Use feature branches**: Work on isolated branches; never commit to `main` directly.
3. **Code review**: All changes require review before merging.
4. **Update dependencies carefully**: If updating major versions, verify backward compatibility and test thoroughly.

### Running Locally

```bash
# Clone safely
git clone https://github.com/saint2706/Coding-For-MBA.git
cd Coding-For-MBA

# Install dependencies
npm install

# Run security audit
npm audit

# Run tests (including security-adjacent checks)
npm test
npm run test:e2e

# Type check
npm run typecheck
```

## Known Limitations

- **Third-Party Dependencies**: This project depends on npm packages. While we monitor these with Dependabot, vulnerabilities may exist in transitive dependencies.
- **Client-Side Rendering**: As a static SPA, XSS vulnerabilities could impact users if malicious content is injected.
- **Browser Security**: Security depends partly on the user's browser and network environment.

## Security Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [GitHub Security Best Practices](https://docs.github.com/en/code-security)
- [npm Security Documentation](https://docs.npmjs.com/about-audit-reports)
- [Node.js Security Best Practices](https://nodejs.org/en/learn/getting-started/security-best-practices)

## Version History

- **2026-04-26**: Initial security policy publication

## License

This security policy is part of the Coding-For-MBA project and is made available under the same terms as the project itself.
