# Repository rules

- Never push directly to `staging` or `main`.
- Use feature branches and pull requests.
- Staging must remain noindex.
- Production must pass the release gate.
- Never commit private SSH keys or environment secrets.
- Scheduled publishing may deploy production only when an approved post is due.
