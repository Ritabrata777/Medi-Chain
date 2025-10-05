# Contributing to MediChain

Thank you for your interest in contributing to MediChain! This document provides guidelines and information for contributors.

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- Git
- MongoDB Atlas account
- Aptos wallet (Petra)
- Google AI API key

### Development Setup

1. **Fork the repository**
   ```bash
   git clone https://github.com/your-username/medichain.git
   cd medichain
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment**
   ```bash
   cp config.env.example config.env
   # Edit config.env with your credentials
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

## 📝 How to Contribute

### Reporting Issues
- Use the GitHub issue tracker
- Provide clear description and steps to reproduce
- Include system information and error logs
- Use appropriate labels

### Suggesting Features
- Use GitHub discussions for feature requests
- Provide detailed use cases and benefits
- Consider implementation complexity

### Code Contributions

1. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes**
   - Follow the coding standards
   - Add tests for new functionality
   - Update documentation

3. **Test your changes**
   ```bash
   npm test
   npm run lint
   ```

4. **Commit your changes**
   ```bash
   git add .
   git commit -m "Add: Brief description of changes"
   ```

5. **Push and create PR**
   ```bash
   git push origin feature/your-feature-name
   ```

## 🎯 Areas for Contribution

### Frontend Development
- UI/UX improvements
- Component enhancements
- Responsive design
- Accessibility features

### Backend Development
- API optimizations
- Database improvements
- Security enhancements
- Performance tuning

### Blockchain Integration
- Smart contract development
- Transaction optimization
- Wallet integration
- Security audits

### AI/ML Features
- Symptom analysis improvements
- Prescription generation
- Anomaly detection
- Natural language processing

### Documentation
- Code documentation
- API documentation
- User guides
- Tutorial creation

## 📋 Coding Standards

### JavaScript/TypeScript
- Use TypeScript for new files
- Follow ESLint configuration
- Use meaningful variable names
- Add JSDoc comments for functions

### React Components
- Use functional components with hooks
- Implement proper prop types
- Use CSS modules or Tailwind classes
- Follow component naming conventions

### Database
- Use MongoDB best practices
- Implement proper indexing
- Add data validation
- Use transactions when needed

### Blockchain
- Follow Move language conventions
- Implement proper error handling
- Add comprehensive tests
- Document smart contract functions

## 🧪 Testing

### Unit Tests
```bash
npm run test
```

### Integration Tests
```bash
npm run test:integration
```

### E2E Tests
```bash
npm run test:e2e
```

### Test Coverage
```bash
npm run test:coverage
```

## 📚 Documentation

### Code Documentation
- Use JSDoc for functions
- Add inline comments for complex logic
- Document API endpoints
- Update README for new features

### User Documentation
- Update user guides
- Create video tutorials
- Write blog posts
- Maintain changelog

## 🔒 Security

### Security Guidelines
- Never commit sensitive data
- Use environment variables for secrets
- Implement proper input validation
- Follow OWASP guidelines

### Reporting Security Issues
- Use private channels for security issues
- Provide detailed vulnerability information
- Allow time for fixes before disclosure

## 🏷️ Commit Message Format

```
type(scope): description

[optional body]

[optional footer]
```

### Types
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes
- `refactor`: Code refactoring
- `test`: Adding tests
- `chore`: Maintenance tasks

### Examples
```
feat(auth): add OAuth2 integration
fix(ui): resolve mobile layout issues
docs(api): update authentication endpoints
```

## 🎉 Recognition

### Contributors
- All contributors are recognized in README
- Significant contributors get maintainer status
- Regular contributors receive special badges

### Contribution Types
- Code contributions
- Documentation improvements
- Bug reports
- Feature suggestions
- Community support

## 📞 Support

### Getting Help
- GitHub Discussions for questions
- Discord community for real-time chat
- Email for private matters
- Weekly office hours

### Resources
- [Development Guide](docs/development.md)
- [API Documentation](docs/api.md)
- [Deployment Guide](docs/deployment.md)
- [Troubleshooting](docs/troubleshooting.md)

## 📋 Pull Request Process

1. **Fork and clone** the repository
2. **Create a feature branch** from main
3. **Make your changes** following guidelines
4. **Add tests** for new functionality
5. **Update documentation** as needed
6. **Submit a pull request** with clear description
7. **Respond to feedback** and make requested changes
8. **Celebrate** when your PR is merged! 🎉

## 🤝 Code of Conduct

### Our Pledge
We are committed to providing a welcoming and inclusive environment for all contributors.

### Expected Behavior
- Be respectful and inclusive
- Use welcoming and inclusive language
- Accept constructive criticism gracefully
- Focus on what's best for the community

### Unacceptable Behavior
- Harassment or discrimination
- Trolling or inflammatory comments
- Personal attacks or political discussions
- Spam or off-topic discussions

## 📄 License

By contributing to MediChain, you agree that your contributions will be licensed under the MIT License.

---

Thank you for contributing to MediChain! Together, we're building a healthier world. 🌍💚
