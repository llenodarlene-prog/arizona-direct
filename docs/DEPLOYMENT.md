# Deployment

Arizona Direct uses a protected publishing flow:

1. Work on a feature branch.
2. Open a PR into `staging`.
3. Verify repository checks and the staging deployment.
4. Open a PR from `staging` into `main`.
5. Production deploys only from `main` through the protected `production` environment.

## Required staging environment
Variables: `DEPLOY_PORT`, `SITE_URL`, `SITE_NAME`, `PRODUCTION_URL`.
Secrets: `DEPLOY_HOST`, `DEPLOY_USER`, `DEPLOY_ROOT` (must end in `/staging`), `DEPLOY_SSH_KEY`, `SSH_KNOWN_HOSTS`.

## Required production environment
Variables: `DEPLOY_PORT`, `SITE_URL`, `SITE_NAME`.
Secrets: `DEPLOY_HOST`, `DEPLOY_USER`, `DEPLOY_ROOT`, `DEPLOY_SSH_KEY`, `SSH_KNOWN_HOSTS`.

Production remains blocked while `data/site.json` has `launch_status: prelaunch`.
